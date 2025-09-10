import { GoTrueClient } from '@supabase/gotrue-js'

export const goTrueClient = new GoTrueClient({
  url: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:9998',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const OAUTH_PROVIDERS = ['github'] as const
export type OAuthProvider = typeof OAUTH_PROVIDERS[number]

export const signInWithOAuth = async (provider: OAuthProvider) => {
  const { data, error } = await goTrueClient.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) {
    console.error('OAuth sign in error:', error)
    throw error
  }
  
  return data
}

export const signOut = async () => {
  const { error } = await goTrueClient.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export const getSession = () => {
  return goTrueClient.getSession()
}

export const getUser = () => {
  return goTrueClient.getUser()
}

export const refreshSession = async () => {
  const { data, error } = await goTrueClient.refreshSession()
  
  if (error) {
    console.error('Refresh session error:', error)
    throw error
  }
  
  return data
}
