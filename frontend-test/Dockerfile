# Dockerfile para o Frontend Next.js
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências (isso criará um novo package-lock.json)
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]
