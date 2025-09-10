/** @type {import('next').NextConfig} */
const nextConfig = {
  // Melhorar estabilidade da hidratação
  reactStrictMode: false, // Desabilitar temporariamente para evitar problemas de hidratação
  
  // Configurações para desenvolvimento
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:9998/:path*', // Proxy para o backend
      },
    ]
  },
  
  // Headers para CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
