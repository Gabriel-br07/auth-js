# Auth.js Demo - Sistema de Autenticação

Este projeto é uma demonstração completa de um sistema de autenticação construído com TypeScript vanilla, utilizando a biblioteca `@supabase/auth-js`. O sistema implementa autenticação com email/senha, OAuth social (Google, GitHub), gerenciamento de sessões e controle de acesso baseado em roles.

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura modular baseada em componentes, contexts, services e routing, separando claramente as responsabilidades:

```
demo/
├── src/
│   ├── components/         # Componentes de UI
│   ├── contexts/          # Gerenciamento de estado global
│   ├── router/            # Sistema de rotas
│   ├── services/          # Camada de API e serviços
│   ├── types/             # Definições de tipos TypeScript
│   └── styles/            # Estilos CSS
├── .env                   # Variáveis de ambiente
├── package.json
├── vite.config.ts
└── index.html
```

## 📁 Estrutura Detalhada

### 🎯 **main.ts** - Ponto de Entrada
O arquivo principal da aplicação que:
- Inicializa o sistema de autenticação
- Configura o router principal
- Gerencia tratamento global de erros
- Expõe ferramentas de debug no ambiente de desenvolvimento

### 📂 **contexts/** - Gerenciamento de Estado

#### **AuthSystem.ts**
Sistema centralizado de autenticação que implementa:
- **Singleton Pattern**: Garante uma única instância do sistema
- **Event System**: Notifica componentes sobre mudanças de estado
- **Token Management**: Armazena e renova tokens automaticamente
- **Session Management**: Controla sessões ativas e timeouts
- **Error Handling**: Trata erros de autenticação de forma consistente

**Funcionalidades principais:**
```typescript
// Métodos de autenticação
login(email, password)     // Login com email/senha
signup(userData)           // Cadastro de novos usuários  
logout()                   // Logout e limpeza de sessão
refreshToken()             // Renovação automática de tokens

// OAuth providers
loginWithGoogle()          // Login com Google
loginWithGitHub()         // Login com GitHub

// Gerenciamento de estado
getState()                // Estado atual da autenticação
onStateChange(callback)   // Observador de mudanças
```

#### **AuthContext.tsx** (Opcional)
Context React para integração futura com React, permitindo reuso dos componentes.

### 🧭 **router/** - Sistema de Navegação

#### **AppRouter.ts**
Roteador SPA personalizado que:
- Gerencia navegação entre páginas
- Implementa proteção de rotas (auth guards)
- Controla acesso baseado em roles
- Mantém histórico de navegação
- Redireciona usuários não autenticados

**Rotas disponíveis:**
- `/` - Home (redireciona baseado na autenticação)
- `/login` - Página de login
- `/signup` - Página de cadastro
- `/home` - Página inicial (requer autenticação)
- `/dashboard` - Dashboard do usuário (requer autenticação)
- `/admin` - Painel administrativo (requer role admin)

### 🎨 **components/** - Componentes de Interface

#### **Login.ts**
Componente de autenticação com:
- Formulário de login (email/senha)
- Botões OAuth (Google, GitHub)
- Validação de campos em tempo real
- Tratamento de erros de autenticação
- Loading states e feedback visual

#### **SignUp.ts** 
Componente de cadastro com:
- Formulário completo de registro
- Validação de senha (força, confirmação)
- Integração com OAuth providers
- Verificação de email disponível
- Feedback de progresso

#### **Dashboard.ts**
Página principal do usuário autenticado:
- Informações do perfil do usuário
- Estatísticas de sessão
- Opções de logout
- Links para outras seções

#### **AdminPanel.ts**
Painel administrativo com:
- Lista de usuários registrados
- Controles de gerenciamento de usuários
- Estatísticas do sistema
- Ferramentas de administração

#### **Home.ts**
Página inicial com:
- Apresentação do sistema
- Links de navegação rápida
- Status de autenticação atual

#### **UsersList.ts**
Componente especializado para:
- Listagem de usuários registrados
- Funcionalidades de busca e filtro
- Integração com o dashboard principal

### 🔧 **services/** - Camada de Serviços

#### **authApi.ts**
Serviço de API que gerencia:
- Comunicação HTTP com o backend
- Interceptação de requests/responses
- Refresh automático de tokens
- Tratamento padronizado de erros
- Retry policies para requests falhados

**Endpoints principais:**
```typescript
// Autenticação básica
POST /signup              // Cadastro
POST /signin              // Login
POST /signout            // Logout
POST /refresh            // Renovar token

// OAuth
GET /oauth/google        // Iniciar OAuth Google
GET /oauth/github        // Iniciar OAuth GitHub
POST /oauth/callback     // Callback OAuth

// Gerenciamento
GET /user               // Dados do usuário
PUT /user               // Atualizar perfil
DELETE /user            // Deletar conta
```

#### **userService.ts**
Serviço específico para operações de usuário:
- Gerenciamento de perfis
- Upload de avatares
- Preferências do usuário
- Histórico de atividades

### 📝 **types/** - Definições de Tipos

#### **auth.ts**
Tipos TypeScript essenciais:

```typescript
interface User {
  id: string;
  email: string;
  role: 'authenticated' | 'supabase_admin';
  user_metadata: UserMetadata;
  created_at: string;
  // ... outros campos
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'bearer';
  user: User;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  redirectTo?: string;
}
```

### 🎨 **styles/** - Estilos

#### **auth.css**
Estilos organizados em:
- **Reset e Base**: Normalização de estilos
- **Layout**: Grid e flexbox layouts
- **Componentes**: Estilos específicos por componente
- **Estados**: Loading, error, success states
- **Responsividade**: Media queries para mobile

## 🔄 Fluxo de Funcionamento

### 1. **Inicialização da Aplicação**
```
main.ts → AuthSystem.getInstance() → Verificar tokens salvos → 
Token válido? → [Sim: Carregar estado do usuário | Não: Estado não autenticado] →
Inicializar Router → Renderizar componente inicial
```

### 2. **Fluxo de Login**
```
Login.ts → Tipo de login?
├── Email/Senha → authSystem.login() → authApi.signin() → Sucesso? → Salvar tokens → Atualizar estado → Redirecionar
└── OAuth → authSystem.loginWithProvider() → Redirect OAuth → Callback → Processar tokens → Salvar tokens
```

### 3. **Fluxo de Proteção de Rotas**
```
Navegação → AppRouter.navigate() → Rota protegida? → 
[Não: Renderizar] → [Sim: Usuário autenticado?] →
[Não: Redirecionar /login] → [Sim: Requer admin?] →
[Não: Renderizar] → [Sim: Usuário admin?] → [Sim: Renderizar | Não: Erro 403]
```

### 4. **Fluxo de Renovação de Token**
```
Request com token expirado → Interceptor detecta 401 → authSystem.refreshToken() →
authApi.refresh() → Refresh bem-sucedido? → 
[Sim: Atualizar tokens → Repetir request] → [Não: Logout automático → Redirecionar login]
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Yarn ou npm
- Backend de autenticação rodando na porta 9999

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Configuração do Backend
Certifique-se de que o backend esteja configurado com:
- Endpoints de autenticação em `http://localhost:9999`
- CORS habilitado para `http://localhost:5173`
- OAuth apps configuradas (Google, GitHub)

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# URLs base
VITE_API_URL=http://localhost:9999
VITE_AUTH_URL=http://localhost:9999/auth

# OAuth Google
VITE_GOOGLE_CLIENT_ID=seu-client-id
VITE_GOOGLE_REDIRECT_URI=http://localhost:9999/callback

# OAuth GitHub  
VITE_GITHUB_CLIENT_ID=seu-client-id
VITE_GITHUB_CLIENT_SECRET=seu-client-secret
VITE_GITHUB_REDIRECT_URI=http://localhost:9999/callback

# Configurações de sessão
VITE_SESSION_TIMEOUT=3600000          # 1 hora
VITE_REFRESH_TOKEN_THRESHOLD=300000   # 5 minutos
```

## 🧪 Testing

O projeto está preparado para testes com:
- Unit tests para services e utilities
- Integration tests para fluxos de autenticação
- E2E tests para fluxos completos de usuário

## 🔒 Segurança

Implementações de segurança:
- **Tokens JWT**: Armazenamento seguro de tokens
- **Refresh automático**: Renovação transparente de tokens
- **CORS**: Configuração adequada de CORS
- **Sanitização**: Sanitização de inputs do usuário
- **Rate limiting**: Proteção contra ataques de força bruta
- **Logout automático**: Logout em caso de tokens inválidos

## 📚 Conceitos Utilizados

### Padrões de Design
- **Singleton**: AuthSystem para estado global único
- **Observer**: Event system para notificações
- **Factory**: Criação de componentes
- **Strategy**: Diferentes providers OAuth

### Tecnologias
- **TypeScript**: Tipagem estática
- **Vite**: Build tool moderno
- **Vanilla JS**: Sem dependências de framework
- **CSS3**: Layouts modernos e responsivos
- **Local Storage**: Persistência de tokens

## 🤝 Contribuição

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Adicione testes se necessário
5. Faça commit das mudanças
6. Abra um Pull Request

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Nota**: Este é um projeto de demonstração. Em produção, considere implementar medidas adicionais de segurança e otimização de performance.
