'use client'

import { useState, useEffect } from 'react'

interface TokenViewProps {
  session: any
  user: any
}

export default function TokenView({ session, user }: TokenViewProps) {
  const [tokenData, setTokenData] = useState<any>(null)

  useEffect(() => {
    if (session) {
      // Extract and display key session/token information
      setTokenData({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        expiresIn: session.expires_in,
        tokenType: session.token_type,
        user: {
          id: user?.id,
          email: user?.email,
          emailVerified: user?.email_confirmed_at,
          lastSignIn: user?.last_sign_in_at,
          createdAt: user?.created_at,
          updatedAt: user?.updated_at,
          identities: user?.identities,
          userMetadata: user?.user_metadata,
          appMetadata: user?.app_metadata,
        }
      })
    }
  }, [session, user])

  if (!tokenData) {
    return <div className="text-center">No session data available</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Session & Token Details</h2>
      
      <div className="grid gap-6">
        {/* Session Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Session Information</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Token Type:</strong> {tokenData.tokenType}</div>
            <div><strong>Expires At:</strong> {new Date(tokenData.expiresAt * 1000).toLocaleString()}</div>
            <div><strong>Expires In:</strong> {tokenData.expiresIn} seconds</div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">User Information</h3>
          <div className="space-y-2 text-sm">
            <div><strong>ID:</strong> {tokenData.user.id}</div>
            <div><strong>Email:</strong> {tokenData.user.email}</div>
            <div><strong>Email Verified:</strong> {tokenData.user.emailVerified ? 'Yes' : 'No'}</div>
            <div><strong>Created:</strong> {new Date(tokenData.user.createdAt).toLocaleString()}</div>
            <div><strong>Last Sign In:</strong> {new Date(tokenData.user.lastSignIn).toLocaleString()}</div>
          </div>
        </div>

        {/* Access Token */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Access Token</h3>
          <div className="bg-white p-3 rounded border text-xs font-mono break-all">
            {tokenData.accessToken}
          </div>
        </div>

        {/* Refresh Token */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Refresh Token</h3>
          <div className="bg-white p-3 rounded border text-xs font-mono break-all">
            {tokenData.refreshToken}
          </div>
        </div>

        {/* User Metadata */}
        {tokenData.user.userMetadata && Object.keys(tokenData.user.userMetadata).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">User Metadata</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-auto">
              {JSON.stringify(tokenData.user.userMetadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Identities */}
        {tokenData.user.identities && tokenData.user.identities.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Identities</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-auto">
              {JSON.stringify(tokenData.user.identities, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
