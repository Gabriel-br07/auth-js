const path = require('path')

module.exports = {
  server: {
    port: 3000,
    host: true,
    cors: true
  },
  resolve: {
    alias: {
      '@supabase/auth-js': path.resolve(__dirname, '../src/index.ts')
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  define: {
    global: 'globalThis',
  }
}
