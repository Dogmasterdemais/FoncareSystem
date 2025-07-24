#!/usr/bin/env pwsh

Write-Host "🚀 Iniciando deploy do FoncareSystem..." -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "📋 Verificando arquivos modificados..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📦 Adicionando arquivos modificados..." -ForegroundColor Yellow
git add .

Write-Host ""
$message = Read-Host "💬 Digite a mensagem do commit (ou pressione Enter para usar padrão)"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "🔄 Atualização do sistema"
}

Write-Host "📝 Fazendo commit: $message" -ForegroundColor Yellow
git commit -m $message

Write-Host ""
Write-Host "📤 Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Aguarde alguns minutos para o deploy automático na Vercel/Netlify" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para continuar"
