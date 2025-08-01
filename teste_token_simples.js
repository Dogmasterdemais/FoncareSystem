// Teste simples do token Focus NFe
console.log('🔍 Verificando configuração do token Focus NFe...\n');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

console.log('📋 Configurações atuais:');
console.log('NEXT_PUBLIC_FOCUS_NFE_TOKEN:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN ? '✅ Configurado' : '❌ Não encontrado');
console.log('NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT:', process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'Não definido');

if (process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN) {
  console.log('\n🔑 Detalhes do Token:');
  console.log('Comprimento:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN.length);
  console.log('Prévia:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN.substring(0, 10) + '...' + process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN.substring(-4));
  console.log('Novo token:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN === 'xWBoOr4HPJbVPxxSR9e8vCUkUnJt2u4G' ? '✅ Atualizado' : '❌ Antigo');
}

// Teste básico de conectividade com a API Focus NFe
async function testeConectividade() {
  console.log('\n🌐 Testando conectividade com Focus NFe...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://homologacao.focusnfe.com.br/v2/nfse', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status da resposta:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Token válido! Conectividade OK');
    } else if (response.status === 401) {
      console.log('❌ Token inválido ou expirado');
    } else {
      console.log('⚠️  Resposta inesperada:', response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Erro na conectividade:', error.message);
  }
}

testeConectividade();
