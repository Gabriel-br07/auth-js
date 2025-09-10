# Configuração Separada Frontend/Backend

Este projeto agora está configurado com separação de responsabilidades entre frontend e backend.

## Estrutura

- **docker-compose.yml** - Contém apenas serviços de frontend
- **docker-compose.backend.yml** - Contém os serviços de backend (auth + postgres)
- **frontend-test/Dockerfile** - Dockerfile para o frontend Next.js

## Como usar

### 1. Executar apenas o Backend

```bash
cd infra
docker-compose -f docker-compose.backend.yml up
```

Isso iniciará:
- **Auth API** em `http://localhost:9998`
- **PostgreSQL** em `localhost:5432`

### 2. Executar apenas o Frontend

```bash
cd infra
docker-compose up
```

Isso iniciará:
- **Frontend Next.js** em `http://localhost:3000`
- **Mail Server** (interface web) em `http://localhost:9000`

### 3. Executar tudo junto

```bash
cd infra

# Terminal 1 - Backend
docker-compose -f docker-compose.backend.yml up

# Terminal 2 - Frontend
docker-compose up
```

## Serviços Disponíveis

### Backend
- **API de Auth**: `http://localhost:9998`
- **PostgreSQL**: `localhost:5432`
- **Métricas/Debug**: `http://localhost:9100` (opcional)

### Frontend
- **App Next.js**: `http://localhost:3000`
- **Mail Interface**: `http://localhost:9000` (para ver emails de desenvolvimento)
- **SMTP Server**: `localhost:2500`

## Configurações Importantes

### Variáveis de Backend (docker-compose.backend.yml)
```yaml
GOTRUE_SITE_URL: http://0.0.0.0:3000  # URL do frontend
GOTRUE_EXTERNAL_GITHUB_REDIRECT_URI: http://0.0.0.0:9998/callback
GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:root@postgres:5432/postgres
```

### Variáveis de Frontend (docker-compose.yml)
```yaml
NEXT_PUBLIC_SUPABASE_URL: http://localhost:9998  # URL da API de auth
NODE_ENV: development
```

## Fluxo de Desenvolvimento

1. **Primeiro execute o backend** (para que o banco esteja disponível)
2. **Depois execute o frontend** (que conectará na API do backend)
3. **Acesse** `http://localhost:3000` para ver a aplicação
4. **Use** `http://localhost:9000` para ver emails enviados durante desenvolvimento

## Troubleshooting

- **Erro de conexão**: Certifique-se de que o backend está rodando antes do frontend
- **Erro de build**: Verifique se os Dockerfiles existem nos diretórios corretos
- **Porta ocupada**: Altere as portas no docker-compose se necessário
