'use client'

import { OAUTH_PROVIDERS, signInWithOAuth, type OAuthProvider } from '@/lib/gotrue'
import { useState } from 'react'

export default function LoginButtons() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      setLoading(provider)
      await signInWithOAuth(provider)
    } catch (error) {
      console.error(`Failed to sign in with ${provider}:`, error)
      alert(`Failed to sign in with ${provider}. Check console for details.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-center mb-4">Sign In with GitHub</h2>
      {OAUTH_PROVIDERS.map((provider) => (
        <button
          key={provider}
          onClick={() => handleOAuthLogin(provider)}
          disabled={loading === provider}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
        >
          {loading === provider ? 'Signing in...' : `Sign in with ${provider}`}
        </button>
      ))}
    </div>
  )
}
