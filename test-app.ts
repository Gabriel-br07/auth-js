import { GoTrueClient, AuthClient } from './src/index'

console.log('🚀 Aplicação carregada com sucesso!')
console.log('GoTrueClient:', typeof GoTrueClient)
console.log('AuthClient:', typeof AuthClient)

// Teste básico de instanciação
try {
  const client = new GoTrueClient({
    url: 'https://test.supabase.co/auth/v1',
    headers: {
      'apikey': 'test-key'
    }
  })
  console.log('✅ GoTrueClient instanciado com sucesso')
} catch (error) {
  console.error('❌ Erro ao instanciar GoTrueClient:', error)
}
