# Environment Variables

This document describes all environment variables used in Browser OS.

## Setup

Create a `.env.local` file in the `apps/desktop-shell` directory (or root directory) with your values. Copy the template below:

```bash
# ============================================
# Email Client OAuth Configuration
# ============================================
# These are OAuth 2.0 Client IDs for email providers.
# Create OAuth apps in each provider's developer console:
# - Gmail: https://console.cloud.google.com/apis/credentials
# - Outlook: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
# - Yahoo: https://developer.yahoo.com/apps/

# Gmail OAuth Client ID
# Format: xxxxxx.apps.googleusercontent.com
# Redirect URI must be: http://localhost:5173/oauth-callback (or your production URL)
VITE_EMAIL_OAUTH_GMAIL_CLIENT_ID=

# Outlook/Microsoft OAuth Client ID
# Format: UUID (e.g., 12345678-1234-1234-1234-123456789abc)
# Redirect URI must be: http://localhost:5173/oauth-callback (or your production URL)
VITE_EMAIL_OAUTH_OUTLOOK_CLIENT_ID=

# Yahoo OAuth Client ID
# Format: Your Yahoo App ID
# Redirect URI must be: http://localhost:5173/oauth-callback (or your production URL)
VITE_EMAIL_OAUTH_YAHOO_CLIENT_ID=

# ============================================
# Browser App Configuration
# ============================================
# Proxy URL for the browser app to make requests through the server
# This allows the browser to bypass CORS restrictions
VITE_PROXY_URL=http://localhost:8000/proxy

# ============================================
# Messaging Client Configuration
# ============================================
# WebSocket server URL for the messaging client
# This is where the messaging server is running
VITE_SERVER_URL=ws://localhost:8000

# ============================================
# Server Configuration
# ============================================
# Port for the backend server to listen on
PORT=8000

# Host for the backend server to bind to
# Use 0.0.0.0 to listen on all interfaces, or 127.0.0.1 for localhost only
HOST=0.0.0.0
```

## Variable Reference

### Email OAuth Variables

#### `VITE_EMAIL_OAUTH_GMAIL_CLIENT_ID`
- **Type**: String
- **Required**: Yes (if using Gmail)
- **Description**: OAuth 2.0 Client ID for Gmail API
- **Format**: `xxxxxx.apps.googleusercontent.com`
- **Setup**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  2. Create OAuth 2.0 credentials
  3. Add authorized redirect URI: `http://localhost:5173/oauth-callback` (or your production URL)
  4. Copy the Client ID

#### `VITE_EMAIL_OAUTH_OUTLOOK_CLIENT_ID`
- **Type**: String (UUID)
- **Required**: Yes (if using Outlook)
- **Description**: OAuth 2.0 Client ID for Microsoft Graph API
- **Format**: UUID (e.g., `12345678-1234-1234-1234-123456789abc`)
- **Setup**:
  1. Go to [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
  2. Register a new application
  3. Add redirect URI: `http://localhost:5173/oauth-callback`
  4. Copy the Application (client) ID

#### `VITE_EMAIL_OAUTH_YAHOO_CLIENT_ID`
- **Type**: String
- **Required**: Yes (if using Yahoo)
- **Description**: OAuth Client ID for Yahoo Mail API
- **Setup**:
  1. Go to [Yahoo Developer](https://developer.yahoo.com/apps/)
  2. Create a new app
  3. Set redirect URI: `http://localhost:5173/oauth-callback`
  4. Copy the Client ID

### Browser Variables

#### `VITE_PROXY_URL`
- **Type**: String (URL)
- **Required**: No (defaults to `http://localhost:8000/proxy`)
- **Description**: URL of the proxy server used by the browser app to bypass CORS restrictions
- **Default**: `http://localhost:8000/proxy`

### Messaging Variables

#### `VITE_SERVER_URL`
- **Type**: String (WebSocket URL)
- **Required**: No (defaults to `ws://localhost:8000`)
- **Description**: WebSocket server URL for the messaging client
- **Default**: `ws://localhost:8000`
- **Format**: `ws://hostname:port` or `wss://hostname:port` for secure connections

### Server Variables

#### `PORT`
- **Type**: Number
- **Required**: No (defaults to `8000`)
- **Description**: Port number for the backend server to listen on
- **Default**: `8000`

#### `HOST`
- **Type**: String (IP address)
- **Required**: No (defaults to `0.0.0.0`)
- **Description**: Host address for the backend server to bind to
- **Default**: `0.0.0.0` (listens on all interfaces)
- **Options**:
  - `0.0.0.0` - Listen on all network interfaces
  - `127.0.0.1` - Listen only on localhost

## Notes

- All `VITE_*` variables are exposed to the browser client and should not contain sensitive information
- OAuth Client IDs are safe to expose (they're public identifiers)
- Never commit `.env.local` files to version control
- For production, set these variables in your deployment platform's environment configuration
- The redirect URI must match exactly what's configured in your OAuth apps (including protocol and port)

