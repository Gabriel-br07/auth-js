# Scripts para gerenciar Frontend/Backend separadamente

## start-frontend.ps1
# Inicia apenas os serviços de frontend
Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Green
docker-compose up --build

## start-backend.ps1  
# Inicia apenas os serviços de backend
Write-Host "🔧 Iniciando Backend..." -ForegroundColor Blue
docker-compose -f docker-compose.backend.yml up --build

## start-all.ps1
# Inicia tudo em background
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "docker-compose -f docker-compose.backend.yml up --build"

Start-Sleep -Seconds 5

Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Green
docker-compose up --build

## stop-all.ps1
# Para todos os serviços
Write-Host "🛑 Parando Frontend..." -ForegroundColor Yellow
docker-compose down

Write-Host "🛑 Parando Backend..." -ForegroundColor Yellow
docker-compose -f docker-compose.backend.yml down
