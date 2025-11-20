import React, { useEffect, useState } from 'react';
import type { EmailProvider } from '../types';
import './OAuthFlow.css';

export interface OAuthFlowProps {
  provider: EmailProvider;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const OAuthFlow: React.FC<OAuthFlowProps> = ({
  provider,
  onComplete,
  onError,
}) => {
  const [status, setStatus] = useState<'initializing' | 'authenticating' | 'completing' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // OAuth flow is handled by OAuthManager
    // This component just shows loading state
    setStatus('authenticating');
  }, [provider]);

  return (
    <div className="oauth-flow-overlay">
      <div className="oauth-flow-modal">
        <div className="oauth-flow-content">
          {status === 'authenticating' && (
            <>
              <div className="oauth-spinner" />
              <h3>Connecting to {provider}...</h3>
              <p>Please complete the authentication in the popup window.</p>
            </>
          )}
          {status === 'completing' && (
            <>
              <div className="oauth-spinner" />
              <h3>Completing setup...</h3>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="oauth-error-icon">⚠️</div>
              <h3>Authentication Failed</h3>
              <p>{errorMessage}</p>
              <button onClick={onComplete}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

