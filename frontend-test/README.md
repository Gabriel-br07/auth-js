# Auth Test Frontend

A minimal Next.js frontend application for testing OAuth2 authentication with a self-hosted Supabase/Auth backend.

## Features

- OAuth2 login with GitHub (configured in your backend)
- Session and token management
- User profile display
- Token inspection and debugging
- Session refresh functionality
- Secure logout

## Prerequisites

1. **Backend Services Running**: Make sure your Supabase/Auth backend is running via Docker Compose:
   ```bash
   cd C:\Workplace\auth-js
   docker-compose -f infra/docker-compose.custom.yml up -d
   ```
   
   Or if you're using the custom YAML you provided:
   ```bash
   cd C:\Workplace\auth-js
   docker-compose -f your-custom-docker-compose.yml up -d
   ```

2. **OAuth Provider Setup**: Your backend is already configured with GitHub OAuth:
   - GitHub Client ID: `Ov23lidoSPJSjspJNSJs`
   - GitHub Secret: `91a2f381883ebbb96bb364eb250fb36c6ce16a5f`
   - Redirect URI: `http://0.0.0.0:9998/callback`

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd C:\Workplace\auth-js\frontend-test
   npm install
   ```

2. **Environment Configuration**:
   The `.env.local` file is already configured to connect to your local auth backend at `http://localhost:9998`. If your backend runs on a different port, update the file:
   ```
   NEXT_PUBLIC_AUTH_URL=http://localhost:9998
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Manual Testing Guide

### 1. Initial State
- Open the application
- Should see "Auth Test Frontend" with sign-in buttons
- Should show "Sign in using one of the OAuth providers below"

### 2. OAuth Login Flow
- Click the GitHub OAuth provider button
- Should redirect to GitHub's authorization page
- Grant permissions and complete authentication
- Should redirect back to `/auth/callback`
- Should show "Processing authentication..." then "Authentication Successful!"
- Should automatically redirect to home page

### 3. Authenticated State
- After successful login, home page should show:
  - "✅ Successfully authenticated!" message
  - "View Profile" and "Refresh" buttons
  - Session & Token Details section with:
    - Session information (token type, expiration)
    - User information (ID, email, timestamps)
    - Access token (JWT)
    - Refresh token
    - User metadata from OAuth provider
    - Identity provider details

### 4. Profile Page
- Click "View Profile" button
- Should navigate to `/me`
- Should show same token/session information
- Should have additional buttons:
  - "← Back Home" - returns to main page
  - "Refresh Session" - refreshes tokens
  - "Sign Out" - logs out user

### 5. Session Refresh
- Click "Refresh Session" button
- Should update tokens with new expiration times
- Should maintain user session without re-authentication

### 6. Logout Flow
- Click "Sign Out" button
- Should clear session and tokens
- Should redirect to home page
- Should show initial sign-in state

### 7. Direct URL Access
- Try accessing `/me` without authentication
- Should redirect to home page
- Try accessing `/auth/callback` directly
- Should show error state

## Testing Different Scenarios

### Error Scenarios
1. **Network Issues**: Disconnect internet during OAuth flow
2. **Invalid Tokens**: Manually clear browser storage
3. **Expired Sessions**: Wait for token expiration
4. **Backend Offline**: Stop Docker Compose services

### OAuth Provider Testing
1. **GitHub**: Test with different GitHub accounts
2. **Multiple Sessions**: Sign out and sign in with different GitHub accounts
3. **Permissions**: Test with different GitHub account permission levels

### Browser Testing
- Test in different browsers (Chrome, Firefox, Edge, Safari)
- Test in incognito/private mode
- Test with browser developer tools open

## File Structure

```
frontend-test/
├── app/
│   ├── layout.tsx          # Root layout with styles
│   ├── page.tsx            # Home page with login/session display
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx    # OAuth callback handler
│   └── me/
│       └── page.tsx        # User profile page
├── components/
│   ├── LoginButtons.tsx    # OAuth login buttons
│   └── TokenView.tsx       # Session/token display component
├── lib/
│   └── gotrue.ts          # Auth client configuration
├── .env.local             # Environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## Key Components

- **GoTrue Client**: Configured to connect to your local Supabase/Auth backend
- **OAuth Providers**: Supports GitHub OAuth flow (as configured in your backend)
- **Session Management**: Handles token storage, refresh, and validation
- **Error Handling**: Comprehensive error handling for auth flows
- **Responsive Design**: Mobile-friendly responsive layout

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Run `npm install` to install dependencies
2. **Auth backend not responding**: Ensure Docker Compose services are running
3. **OAuth redirect errors**: Check OAuth app configuration in backend
4. **Token parsing errors**: Check browser console for detailed error messages
5. **CORS issues**: Ensure backend allows requests from `http://localhost:3000`

### Debug Information

- All auth operations log to browser console
- Token details are displayed in the UI for inspection
- Network requests can be monitored in browser developer tools
- Session state is preserved across page reloads

## Production Considerations

This is a minimal test application. For production use, consider:

- Environment-specific configuration
- Error boundary components
- Loading states and skeletons
- Proper TypeScript types
- Security headers and CSP
- Token storage security
- Route protection middleware
- Comprehensive error handling
- Accessibility improvements
- Performance optimizations
