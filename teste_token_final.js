// Teste final do token Focus NFe com endpoints corretos
console.log('🔍 Teste final do token Focus NFe...\n');

require('dotenv').config({ path: '.env.local' });

async function testeTokenFinal() {
  const token = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
  
  console.log('📋 Configuração atual:');
  console.log('Token:', token ? `✅ ${token.substring(0, 8)}...${token.substring(-4)}` : '❌ Não encontrado');
  console.log('Ambiente:', process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT);
  console.log('');
  
  if (!token) {
    console.log('❌ Token não configurado!');
    return;
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Teste com endpoint básico da API NFSe
    console.log('🧪 Testando autenticação do token...');
    
    const testResponse = await fetch('https://homologacao.focusnfe.com.br/v2/nfse', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Teste básico de autenticação - não vai criar NFSe real
        prestador: {
          cnpj: "00000000000000" // CNPJ de teste
        }
      })
    });
    
    console.log('Status da resposta:', testResponse.status);
    
    if (testResponse.status === 422) {
      console.log('✅ Token VÁLIDO! (422 = dados inválidos, mas token autenticado)');
      console.log('✅ Pronto para usar a API Focus NFe');
    } else if (testResponse.status === 401) {
      console.log('❌ Token INVÁLIDO! (401 = não autorizado)');
    } else if (testResponse.status === 403) {
      console.log('⚠️  Token válido mas sem permissões (403 = proibido)');
    } else if (testResponse.status === 200 || testResponse.status === 201) {
      console.log('✅ Token VÁLIDO e funcionando perfeitamente!');
    } else {
      console.log(`⚠️  Status inesperado: ${testResponse.status} ${testResponse.statusText}`);
      
      // Tentar ler a resposta para mais detalhes
      try {
        const responseText = await testResponse.text();
        console.log('Resposta:', responseText.substring(0, 200));
      } catch (e) {
        console.log('Não foi possível ler a resposta');
      }
    }
    
    console.log('');
    console.log('🎯 CONCLUSÃO:');
    
    if ([200, 201, 422].includes(testResponse.status)) {
      console.log('✅ SUCESSO! Token Focus NFe atualizado e funcionando');
      console.log('✅ Sistema pronto para emitir NFSe de homologação');
      console.log('');
      console.log('📝 PRÓXIMOS PASSOS:');
      console.log('1. Acesse: localhost:3000/financeiro');
      console.log('2. Clique em "Nova NFe"');
      console.log('3. Teste a emissão de uma NFSe');
    } else if (testResponse.status === 401) {
      console.log('❌ ERRO: Token inválido ou expirado');
      console.log('💡 Verifique se o token está correto no Focus NFe');
    } else {
      console.log('⚠️  AVISO: Status inesperado, mas token pode estar correto');
      console.log('💡 Tente usar o sistema normalmente');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.log('💡 Verifique sua conexão com a internet');
  }
}

testeTokenFinal();
