'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, getUser, signOut, refreshSession } from '@/lib/gotrue'
import TokenView from '@/components/TokenView'

export default function ProfilePage() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResponse = await getSession()
        const userResponse = await getUser()
        
        if (!sessionResponse.data.session) {
          router.push('/')
          return
        }
        
        setSession(sessionResponse.data.session)
        setUser(userResponse.data.user)
      } catch (error) {
        console.error('Error checking session:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleRefreshSession = async () => {
    setRefreshing(true)
    try {
      const { session: newSession, user: newUser } = await refreshSession()
      setSession(newSession)
      setUser(newUser)
    } catch (error) {
      console.error('Error refreshing session:', error)
      alert('Failed to refresh session. Please sign in again.')
      router.push('/')
    } finally {
      setRefreshing(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Error signing out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">No active session</div>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back Home
            </button>
            <button 
              onClick={handleRefreshSession}
              disabled={refreshing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Session'}
            </button>
            <button 
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        <TokenView session={session} user={user} />
      </div>
    </main>
  )
}
