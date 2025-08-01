# Script de Inicialização do Módulo Financeiro - PowerShell
# FoncareSystem

Write-Host "🏥 FoncareSystem - Inicialização do Módulo Financeiro" -ForegroundColor Cyan
Write-Host "=" * 55 -ForegroundColor Gray

# Verificar se o Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado. Instale o Python 3.8+ primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se existe arquivo de configuração .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ Arquivo .env não encontrado. Criando template..." -ForegroundColor Yellow
    
    $envTemplate = @"
# Configuração do Banco de Dados
SUPABASE_DB_HOST=db.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=sua_senha_aqui
SUPABASE_DB_PORT=5432

# URLs do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_servico_aqui

# Configurações do Sistema
ENVIRONMENT=development
DEBUG=true
"@
    
    Set-Content -Path ".env" -Value $envTemplate -Encoding UTF8
    Write-Host "📝 Template .env criado. Configure suas credenciais antes de continuar." -ForegroundColor Yellow
    Write-Host "Pressione qualquer tecla para continuar após configurar..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Carregar variáveis de ambiente
Write-Host "`n🔧 Carregando configurações..." -ForegroundColor Cyan

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#].*)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✅ Variáveis de ambiente carregadas" -ForegroundColor Green
}

# Verificar se existe diretório scripts
if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" -Force | Out-Null
    Write-Host "📁 Diretório scripts criado" -ForegroundColor Green
}

# Executar script Python de inicialização
Write-Host "`n🐍 Executando inicialização Python..." -ForegroundColor Cyan

if (Test-Path "scripts\init_modulo_financeiro.py") {
    try {
        python "scripts\init_modulo_financeiro.py"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n🎉 Módulo Financeiro inicializado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Erro na inicialização do módulo" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Erro ao executar script Python: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Script Python não encontrado: scripts\init_modulo_financeiro.py" -ForegroundColor Red
    exit 1
}

# Verificar se o Next.js está configurado
Write-Host "`n🔍 Verificando configuração Next.js..." -ForegroundColor Cyan

if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    
    # Verificar se node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    # Verificar se as dependências necessárias estão instaladas
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $requiredDeps = @("@supabase/supabase-js", "lucide-react", "tailwindcss")
    
    foreach ($dep in $requiredDeps) {
        if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
            Write-Host "✅ $dep instalado" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $dep não encontrado" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️ package.json não encontrado" -ForegroundColor Yellow
}

# Verificar estrutura de arquivos do módulo financeiro
Write-Host "`n📁 Verificando estrutura do módulo..." -ForegroundColor Cyan

$estruturaEsperada = @(
    "app\financeiro\page.tsx",
    "components\financeiro\ContasPagarManager.tsx",
    "components\financeiro\ContasReceberManager.tsx",
    "modulo_financeiro_estrutura.sql",
    "scripts\analise_financeira.py",
    "MODULO_FINANCEIRO_DOCUMENTACAO.md"
)

foreach ($arquivo in $estruturaEsperada) {
    if (Test-Path $arquivo) {
        Write-Host "✅ $arquivo" -ForegroundColor Green
    } else {
        Write-Host "❌ $arquivo não encontrado" -ForegroundColor Red
    }
}

# Informações finais
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse http://localhost:3000/financeiro" -ForegroundColor White
Write-Host "2. Configure suas unidades no sistema" -ForegroundColor White
Write-Host "3. Execute: python scripts\analise_financeira.py" -ForegroundColor White
Write-Host "4. Consulte: MODULO_FINANCEIRO_DOCUMENTACAO.md" -ForegroundColor White

Write-Host "`n🚀 Para iniciar o servidor de desenvolvimento:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor Yellow

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
