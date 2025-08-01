# Script de Instalação de Dependências Python
# FoncareSystem - Módulo Financeiro

Write-Host "🐍 Instalando dependências Python para o Módulo Financeiro..." -ForegroundColor Cyan
Write-Host "=" * 55 -ForegroundColor Gray

# Verificar se o Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado. Instale o Python 3.8+ primeiro." -ForegroundColor Red
    Write-Host "Download: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Verificar se o pip está disponível
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ pip encontrado: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip não encontrado. Reinstale o Python com pip." -ForegroundColor Red
    exit 1
}

# Atualizar pip
Write-Host "`n🔄 Atualizando pip..." -ForegroundColor Cyan
try {
    python -m pip install --upgrade pip
    Write-Host "✅ pip atualizado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível atualizar o pip, continuando..." -ForegroundColor Yellow
}

# Verificar se existe requirements.txt
if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ Arquivo requirements.txt não encontrado" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretório correto do projeto" -ForegroundColor Yellow
    exit 1
}

# Instalar dependências
Write-Host "`n📦 Instalando dependências do requirements.txt..." -ForegroundColor Cyan
try {
    pip install -r requirements.txt
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tentando instalação alternativa..." -ForegroundColor Yellow
    
    # Instalar dependências uma por vez (mais lento mas mais confiável)
    $dependencies = @(
        "psycopg2-binary",
        "pandas",
        "matplotlib", 
        "python-dotenv",
        "openpyxl"
    )
    
    foreach ($dep in $dependencies) {
        try {
            Write-Host "Instalando $dep..." -ForegroundColor Gray
            pip install $dep
            Write-Host "✅ $dep instalado" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Falha ao instalar $dep" -ForegroundColor Yellow
        }
    }
}

# Verificar instalações críticas
Write-Host "`n🔍 Verificando instalações críticas..." -ForegroundColor Cyan

$dependenciasCriticas = @(
    @{nome="psycopg2"; import="psycopg2"; descricao="PostgreSQL adapter"},
    @{nome="pandas"; import="pandas"; descricao="Data analysis"},
    @{nome="matplotlib"; import="matplotlib.pyplot"; descricao="Plotting"},
    @{nome="dotenv"; import="dotenv"; descricao="Environment variables"}
)

foreach ($dep in $dependenciasCriticas) {
    try {
        $testImport = python -c "import $($dep.import); print('OK')" 2>&1
        if ($testImport -eq "OK") {
            Write-Host "✅ $($dep.nome) - $($dep.descricao)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($dep.nome) - $($dep.descricao)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($dep.nome) - $($dep.descricao)" -ForegroundColor Red
    }
}

# Criar ambiente virtual (opcional)
Write-Host "`n🏠 Deseja criar um ambiente virtual? (S/N)" -ForegroundColor Cyan
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host "📁 Criando ambiente virtual..." -ForegroundColor Cyan
    
    try {
        python -m venv venv_financeiro
        Write-Host "✅ Ambiente virtual criado em: venv_financeiro" -ForegroundColor Green
        
        Write-Host "Para ativar o ambiente virtual:" -ForegroundColor Yellow
        Write-Host ".\venv_financeiro\Scripts\Activate.ps1" -ForegroundColor White
        
        Write-Host "Para instalar dependências no ambiente virtual:" -ForegroundColor Yellow
        Write-Host ".\venv_financeiro\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor White
        
    } catch {
        Write-Host "⚠️ Não foi possível criar ambiente virtual" -ForegroundColor Yellow
    }
}

# Informações finais
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: .\init_financeiro.ps1" -ForegroundColor White
Write-Host "2. Configure o arquivo .env com suas credenciais" -ForegroundColor White
Write-Host "3. Execute: python scripts\init_modulo_financeiro.py" -ForegroundColor White
Write-Host "4. Execute: python scripts\analise_financeira.py" -ForegroundColor White

Write-Host "`n✨ Instalação concluída!" -ForegroundColor Green
