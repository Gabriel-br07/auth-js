'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goTrueClient } from '@/lib/gotrue'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL
        const errorParam = searchParams.get('error')
        if (errorParam) {
          throw new Error(errorParam)
        }

        // Check if we have auth tokens in the URL hash
        const hashFragment = window.location.hash.substring(1)
        if (!hashFragment) {
          throw new Error('No authentication data found in URL')
        }

        // Parse the hash fragment
        const urlParams = new URLSearchParams(hashFragment)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const expiresIn = urlParams.get('expires_in')
        const tokenType = urlParams.get('token_type')

        if (!accessToken) {
          throw new Error('No access token found in callback')
        }

        // Set the session manually using the tokens from URL
        const { data, error } = await goTrueClient.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })
        
        if (error) {
          throw error
        }

        if (data?.session) {
          setStatus('success')
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          // Redirect to home page after successful authentication
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          throw new Error('Failed to establish session')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Processing authentication...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xl mb-4 text-red-600">Authentication Failed</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl mb-4 text-green-600">✅ Authentication Successful!</div>
        <div className="text-gray-600 mb-4">Redirecting you to the home page...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    </div>
  )
}
