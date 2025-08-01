@echo off
echo 🚀 Iniciando deploy do FoncareSystem...
echo.

:: Verificar status
echo 📋 Verificando arquivos modificados...
git status

echo.
echo 📦 Adicionando arquivos modificados...
git add .

echo.
echo 💬 Fazendo commit...
set /p message="Digite a mensagem do commit (ou pressione Enter para usar padrão): "
if "%message%"=="" set message=🔄 Atualização do sistema

git commit -m "%message%"

echo.
echo 📤 Enviando para GitHub...
git push origin main

echo.
echo ✅ Deploy concluído! 
echo 🌐 Aguarde alguns minutos para o deploy automático na Vercel/Netlify
echo.
pause
