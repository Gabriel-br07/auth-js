/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AUTH_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_REDIRECT_URI: string
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_GITHUB_CLIENT_SECRET: string
  readonly VITE_GITHUB_REDIRECT_URI: string
  readonly VITE_REDIRECT_URL: string
  readonly VITE_CALLBACK_URL: string
  readonly VITE_ENV: string
  readonly VITE_DEBUG: string
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_REFRESH_TOKEN_THRESHOLD: string
  readonly VITE_CORS_ORIGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
