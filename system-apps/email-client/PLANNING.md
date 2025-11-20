# Email Client App - Planning Document

## Overview
An email client application that performs OAuth handoff with email servers (Gmail, Outlook, etc.) for account authentication and email management.

## Features

### Account Management
1. **OAuth Integration**
   - Support multiple email providers:
     - Gmail (Google OAuth 2.0)
     - Outlook/Office 365 (Microsoft OAuth 2.0)
     - Yahoo Mail (OAuth 2.0)
     - Custom IMAP/SMTP with OAuth
   - OAuth flow initiation
   - Token storage and refresh
   - Multiple account support

2. **Account Settings**
   - Add/remove email accounts
   - Configure account settings
   - Test connection
   - View account status

### Email Management
1. **Inbox View**
   - List of emails with:
     - Sender name/email
     - Subject
     - Preview/snippet
     - Timestamp
     - Read/unread status
     - Starred/important indicators
     - Attachments indicator
   - Sort by date, sender, subject
   - Filter by unread, starred, etc.
   - Search emails

2. **Email View**
   - Full email content display
   - HTML email rendering
   - Plain text fallback
   - Show headers (From, To, CC, Date, Subject)
   - Display attachments
   - Reply/forward buttons
   - Mark as read/unread
   - Star/unstar
   - Delete email

3. **Compose Email**
   - To, CC, BCC fields
   - Subject field
   - Rich text editor (or plain text)
   - Attach files
   - Send button
   - Save draft
   - Send later scheduling (future)

4. **Folders/Labels**
   - Inbox
   - Sent
   - Drafts
   - Trash/Deleted
   - Spam
   - Custom folders/labels (provider-dependent)

### Real-time Updates
- Poll for new emails (or use IMAP IDLE if supported)
- Show unread count badge
- Notification for new emails
- Sync status indicator

## Technical Implementation

### OAuth Flow
1. **OAuth 2.0 Authorization Code Flow**
   - Redirect user to provider's OAuth page
   - Handle OAuth callback
   - Exchange authorization code for access token
   - Store refresh token securely
   - Refresh access token when expired

2. **Provider-Specific Implementation**
   - Google Gmail API:
     - OAuth scopes: `https://www.googleapis.com/auth/gmail.readonly`, `https://www.googleapis.com/auth/gmail.send`
     - Use Gmail API for email operations
   - Microsoft Graph API:
     - OAuth scopes: `Mail.Read`, `Mail.Send`
     - Use Microsoft Graph API
   - IMAP/SMTP with OAuth:
     - Use OAuth 2.0 for IMAP/SMTP authentication
     - Connect via IMAP for reading, SMTP for sending

### Email API Integration
- **Gmail API**: REST API for Gmail operations
- **Microsoft Graph API**: REST API for Outlook/Office 365
- **IMAP/SMTP**: Direct protocol access with OAuth authentication

### OS API Usage
- `os.fs.*` - Store OAuth tokens securely (encrypted)
- `os.fs.*` - Cache emails locally
- `os.notification.*` - Show notifications for new emails
- `os.window.*` - Open OAuth popup/redirect window
- `os.network.*` - Make API requests to email providers

### Token Storage
- Store OAuth tokens securely:
  - Access tokens (short-lived)
  - Refresh tokens (long-lived)
  - Encrypt tokens before storing
- Handle token refresh automatically
- Clear tokens on logout

### State Management
- Account list state
- Active account state
- Email list state
- Selected email state
- Compose draft state
- Sync status state

### UI Components
- Account sidebar/list
- Email list view
- Email detail view
- Compose email modal/form
- OAuth login flow UI
- Settings panel

### Email Rendering
- HTML email rendering (sanitized)
- Plain text email display
- Attachment handling:
  - Download attachments
  - Preview images
  - Show attachment list

### Security Considerations
- Never expose OAuth tokens in client code
- Encrypt stored tokens
- Use secure storage (OS filesystem with encryption)
- Validate email content (prevent XSS)
- Handle OAuth errors gracefully

## OAuth Implementation Details

### Gmail OAuth Flow
1. Redirect to: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&response_type=code`
2. User authorizes
3. Receive authorization code in callback
4. Exchange code for tokens: `POST https://oauth2.googleapis.com/token`
5. Use access token for Gmail API calls
6. Refresh token when access token expires

### Microsoft OAuth Flow
1. Redirect to: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=...&redirect_uri=...&scope=...&response_type=code`
2. User authorizes
3. Receive authorization code in callback
4. Exchange code for tokens: `POST https://login.microsoftonline.com/common/oauth2/v2.0/token`
5. Use access token for Graph API calls
6. Refresh token when access token expires

## API Endpoints (Provider-specific)

### Gmail API
- `GET https://gmail.googleapis.com/gmail/v1/users/me/messages` - List messages
- `GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}` - Get message
- `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send` - Send message

### Microsoft Graph API
- `GET https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages` - List messages
- `GET https://graph.microsoft.com/v1.0/me/messages/{id}` - Get message
- `POST https://graph.microsoft.com/v1.0/me/sendMail` - Send message

## Future Enhancements
- Email threading/conversation view
- Advanced search filters
- Email templates
- Email scheduling
- Email encryption (PGP)
- Multiple account unified inbox
- Email rules/filters
- Calendar integration
- Contact integration
- Email signatures
- Rich text editor with formatting
- Email forwarding rules

