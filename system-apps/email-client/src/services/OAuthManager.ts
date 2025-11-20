import type { EmailProvider, OAuthTokens, OAuthConfig } from '../types';

export interface OAuthManagerOptions {
  networkAPI: any; // os.network API
  fsAPI?: any; // os.fs API for storing state
  redirectUri?: string;
}

export class OAuthManager {
  private networkAPI: any;
  private fsAPI?: any;
  private redirectUri: string;
  private pendingAuths: Map<string, {
    resolve: (tokens: OAuthTokens) => void;
    reject: (error: Error) => void;
    provider: EmailProvider;
  }> = new Map();

  // Provider configurations
  private readonly providerConfigs: Record<EmailProvider, OAuthConfig> = {
    gmail: {
      clientId: '', // Will be set from environment or config
      redirectUri: '',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
      ],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
    },
    outlook: {
      clientId: '', // Will be set from environment or config
      redirectUri: '',
      scopes: [
        'Mail.Read',
        'Mail.Send',
        'offline_access'
      ],
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
    yahoo: {
      clientId: '', // Will be set from environment or config
      redirectUri: '',
      scopes: [
        'mail-r',
        'mail-w'
      ],
      authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
      tokenUrl: 'https://api.login.yahoo.com/oauth2/get_token',
    },
  };

  constructor(options: OAuthManagerOptions) {
    this.networkAPI = options.networkAPI;
    this.fsAPI = options.fsAPI;
    this.redirectUri = options.redirectUri || `${window.location.origin}/oauth-callback`;
    
    // Set redirect URIs for all providers
    Object.keys(this.providerConfigs).forEach(provider => {
      this.providerConfigs[provider as EmailProvider].redirectUri = this.redirectUri;
    });

    // Listen for OAuth callback messages from popup
    window.addEventListener('message', this.handleOAuthCallback.bind(this));
  }

  /**
   * Set OAuth client ID for a provider
   */
  setClientId(provider: EmailProvider, clientId: string, clientSecret?: string): void {
    this.providerConfigs[provider].clientId = clientId;
    if (clientSecret) {
      this.providerConfigs[provider].clientSecret = clientSecret;
    }
  }

  /**
   * Initiate OAuth flow for a provider
   * Returns a promise that resolves with tokens when authentication completes
   */
  async initiateAuth(provider: EmailProvider): Promise<OAuthTokens> {
    const config = this.providerConfigs[provider];
    
    if (!config.clientId) {
      throw new Error(`OAuth client ID not configured for ${provider}. Call setClientId() first.`);
    }

    // Generate state parameter for CSRF protection
    const state = this.generateState();
    const authUrl = this.buildAuthUrl(provider, state);

    return new Promise<OAuthTokens>((resolve, reject) => {
      // Store promise resolvers
      this.pendingAuths.set(state, { resolve, reject, provider });

      // Open popup window
      const popup = window.open(
        authUrl,
        'oauth-popup',
        'width=500,height=600,left=100,top=100'
      );

      if (!popup) {
        this.pendingAuths.delete(state);
        reject(new Error('Failed to open popup window. Please allow popups for this site.'));
        return;
      }

      // Monitor popup for closure (user might cancel)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          if (this.pendingAuths.has(state)) {
            this.pendingAuths.delete(state);
            reject(new Error('OAuth flow cancelled by user'));
          }
        }
      }, 1000);

      // Cleanup after timeout (5 minutes)
      setTimeout(() => {
        if (this.pendingAuths.has(state)) {
          clearInterval(checkClosed);
          this.pendingAuths.delete(state);
          if (popup && !popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth flow timed out'));
        }
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Handle OAuth callback from popup window
   */
  private async handleOAuthCallback(event: MessageEvent): Promise<void> {
    // Security: Only accept messages from same origin
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, code, state, error } = event.data || {};

    if (type !== 'oauth-callback') {
      return;
    }

    const pendingAuth = this.pendingAuths.get(state);
    if (!pendingAuth) {
      console.warn('[OAuthManager] Received callback for unknown state:', state);
      return;
    }

    this.pendingAuths.delete(state);

    if (error) {
      pendingAuth.reject(new Error(`OAuth error: ${error}`));
      return;
    }

    if (!code) {
      pendingAuth.reject(new Error('No authorization code received'));
      return;
    }

    try {
      const tokens = await this.exchangeCodeForTokens(pendingAuth.provider, code);
      pendingAuth.resolve(tokens);
    } catch (error) {
      pendingAuth.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(provider: EmailProvider, code: string): Promise<OAuthTokens> {
    const config = this.providerConfigs[provider];

    const tokenRequest: Record<string, string> = {
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    };

    // Build request based on provider
    let url = config.tokenUrl;
    let headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    let body: string;

    if (provider === 'gmail') {
      // Gmail uses application/x-www-form-urlencoded with client_id and client_secret
      tokenRequest.client_id = config.clientId;
      if (config.clientSecret) {
        tokenRequest.client_secret = config.clientSecret;
      }
      body = new URLSearchParams(tokenRequest).toString();
    } else if (provider === 'outlook') {
      // Microsoft Graph uses application/x-www-form-urlencoded
      tokenRequest.client_id = config.clientId;
      if (config.clientSecret) {
        tokenRequest.client_secret = config.clientSecret;
      }
      body = new URLSearchParams(tokenRequest).toString();
    } else if (provider === 'yahoo') {
      // Yahoo uses Basic Auth with client_id:client_secret
      const credentials = btoa(`${config.clientId}:${config.clientSecret || ''}`);
      headers['Authorization'] = `Basic ${credentials}`;
      body = new URLSearchParams(tokenRequest).toString();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      const response = await this.networkAPI.request(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorText = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        tokenType: tokenData.token_type || 'Bearer',
      };
    } catch (error) {
      console.error('[OAuthManager] Token exchange error:', error);
      throw error instanceof Error ? error : new Error('Failed to exchange code for tokens');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(provider: EmailProvider, refreshToken: string): Promise<OAuthTokens> {
    const config = this.providerConfigs[provider];

    const refreshRequest: Record<string, string> = {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    let url = config.tokenUrl;
    let headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    let body: string;

    if (provider === 'gmail') {
      refreshRequest.client_id = config.clientId;
      if (config.clientSecret) {
        refreshRequest.client_secret = config.clientSecret;
      }
      body = new URLSearchParams(refreshRequest).toString();
    } else if (provider === 'outlook') {
      refreshRequest.client_id = config.clientId;
      if (config.clientSecret) {
        refreshRequest.client_secret = config.clientSecret;
      }
      body = new URLSearchParams(refreshRequest).toString();
    } else if (provider === 'yahoo') {
      const credentials = btoa(`${config.clientId}:${config.clientSecret || ''}`);
      headers['Authorization'] = `Basic ${credentials}`;
      body = new URLSearchParams(refreshRequest).toString();
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      const response = await this.networkAPI.request(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorText = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        tokenType: tokenData.token_type || 'Bearer',
      };
    } catch (error) {
      console.error('[OAuthManager] Token refresh error:', error);
      throw error instanceof Error ? error : new Error('Failed to refresh token');
    }
  }

  /**
   * Build OAuth authorization URL
   */
  private buildAuthUrl(provider: EmailProvider, state: string): string {
    const config = this.providerConfigs[provider];
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent screen to get refresh token
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Generate random state parameter for CSRF protection
   */
  private generateState(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(provider: EmailProvider, token: string): Promise<void> {
    let revokeUrl: string;
    
    if (provider === 'gmail') {
      revokeUrl = `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`;
    } else if (provider === 'outlook') {
      // Microsoft doesn't have a simple revoke endpoint, but we can clear tokens locally
      return;
    } else if (provider === 'yahoo') {
      revokeUrl = `https://api.login.yahoo.com/oauth2/revoke?token=${encodeURIComponent(token)}`;
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      await this.networkAPI.request(revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      console.warn('[OAuthManager] Token revocation failed (non-critical):', error);
      // Don't throw - revocation is best effort
    }
  }
}

