# Supabase Auth Demo

Esta é uma interface de teste elegante para demonstrar os fluxos de autenticação OAuth da biblioteca `@supabase/auth-js`.

## 🚀 Funcionalidades

- **Interface moderna e responsiva** com design gradiente
- **Suporte a múltiplos provedores OAuth**: Google, GitHub, Discord
- **Gerenciamento de sessão** automático
- **Feedback visual** em tempo real do status de autenticação
- **Informações do usuário** exibidas após login
- **Logout** com limpeza de sessão

## 🛠️ Configuração

### Pré-requisitos

1. **Backend de autenticação** rodando em `localhost:9999` (via Docker Compose)
2. **PostgreSQL** rodando em `localhost:5432`
3. **Node.js** instalado (versão 18+ recomendada)

### Passo a passo

1. **Primeiro, certifique-se que o backend está rodando:**
```bash
# No diretório do seu projeto backend com o docker-compose.yml
docker-compose up -d
```

2. **Construa a biblioteca principal (se necessário):**
```bash
# No diretório raiz do auth-js
npm install
npm run build
```

3. **Instale as dependências da demo:**
```bash
cd demo
npm install
```

4. **Execute a demo:**
```bash
npm run dev
```

5. **Acesse a aplicação:**
```
http://localhost:3000
```

## 🏗️ Arquitetura

### Estrutura dos arquivos:
```
demo/
├── index.html          # Interface HTML com estilos CSS inline
├── src/
│   └── main.ts          # Lógica TypeScript principal
├── package.json         # Dependências do projeto
├── tsconfig.json        # Configuração TypeScript
├── vite.config.js       # Configuração do Vite (JavaScript)
└── README.md           # Este arquivo
```

### Fluxo de autenticação:

1. **Inicialização**: Cliente conecta com servidor em `localhost:9999`
2. **OAuth**: Usuário clica em provider → redirecionamento → callback
3. **Sessão**: Token JWT salvo e gerenciado automaticamente
4. **Estado**: Interface atualizada conforme mudanças de autenticação

## 🔧 Configuração dos Provedores OAuth

Para testar os provedores OAuth, configure no seu backend:

### Google OAuth
- **Client ID** e **Client Secret** nas variáveis de ambiente
- **Redirect URI**: `http://localhost:3000`

### GitHub OAuth  
- **Client ID** e **Client Secret** nas configurações da aplicação
- **Authorization callback URL**: `http://localhost:3000`

### Discord OAuth
- **Client ID** e **Client Secret** nas configurações da aplicação Discord
- **Redirect URIs**: `http://localhost:3000`

## 🎨 Personalização

### Cores e estilos
Todas as cores e estilos estão definidos no CSS inline do `index.html`, incluindo:
- Gradientes de fundo
- Cores dos botões por provider
- Animações de hover
- Feedbacks visuais de status

### Adicionar novos provedores
1. Adicione o botão no HTML com `data-provider="nome"`
2. O TypeScript automaticamente detectará o novo provider

## 🐛 Debug

Acesse o console do navegador para:
- Verificar logs detalhados de autenticação
- Acessar `window.authDemo` para métodos de debug
- Testar manualmente `authDemo.getSession()` e `authDemo.getUser()`

## 📦 Dependências

- **@supabase/auth-js**: Biblioteca principal (link local)
- **Vite**: Build tool e dev server
- **TypeScript**: Tipagem estática
- **CSS puro**: Sem frameworks CSS externos
