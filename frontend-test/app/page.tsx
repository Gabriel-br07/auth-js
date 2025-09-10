'use client'

import { useState, useEffect } from 'react'
import { getSession, getUser } from '@/lib/gotrue'
import dynamic from 'next/dynamic'

// Carregamento dinâmico para evitar problemas de hidratação
const LoginButtons = dynamic(() => import('@/components/LoginButtons'), {
  ssr: false,
  loading: () => <div className="text-center">Loading login options...</div>
})

const TokenView = dynamic(() => import('@/components/TokenView'), {
  ssr: false,
  loading: () => <div className="text-center">Loading token view...</div>
})

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkSession = async () => {
      try {
        const sessionResponse = await getSession()
        const userResponse = await getUser()
        
        setSession(sessionResponse.data.session)
        setUser(userResponse.data.user)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [mounted])

  // Renderização condicional para evitar hidratação
  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Auth Test Frontend</h1>
          <div className="text-center">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Auth Test Frontend</h1>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Auth Test Frontend</h1>
        
        {!session ? (
          <div>
            <p className="text-center mb-8 text-gray-600">
              Sign in using GitHub OAuth to test the authentication flow.
            </p>
            <LoginButtons />
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <p className="text-green-600 mb-4">✅ Successfully authenticated!</p>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/me" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Profile
                </a>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
            <TokenView session={session} user={user} />
          </div>
        )}
      </div>
    </main>
  )
}
