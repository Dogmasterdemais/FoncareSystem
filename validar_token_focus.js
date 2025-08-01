// Teste de validação específico do token Focus NFe
console.log('🔍 Validando novo token Focus NFe...\n');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

async function validarToken() {
  const token = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
  
  console.log('📋 Token configurado:');
  console.log('✅ Token:', token ? `${token.substring(0, 8)}...${token.substring(-4)}` : 'Não encontrado');
  console.log('✅ Ambiente:', process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT);
  console.log('✅ Comprimento:', token?.length || 0);
  console.log('');
  
  if (!token) {
    console.log('❌ Token não configurado!');
    return;
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Teste 1: Consultar empresa (valida o token)
    console.log('🏢 Teste 1: Consultando informações da empresa...');
    const empresaResponse = await fetch('https://homologacao.focusnfe.com.br/v2/empresas', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', empresaResponse.status);
    
    if (empresaResponse.status === 200) {
      const empresaData = await empresaResponse.json();
      console.log('✅ Token válido! Empresa configurada');
      console.log('🏢 Empresa:', empresaData.razao_social || 'Informação não disponível');
    } else if (empresaResponse.status === 401) {
      console.log('❌ Token inválido ou sem permissão');
    } else {
      console.log('⚠️  Status inesperado:', empresaResponse.status, empresaResponse.statusText);
    }
    
    console.log('');
    
    // Teste 2: Listar NFSes (verifica API NFSe)
    console.log('📄 Teste 2: Testando endpoint de NFSe...');
    const nfseResponse = await fetch('https://homologacao.focusnfe.com.br/v2/nfse?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status NFSe:', nfseResponse.status);
    
    if (nfseResponse.status === 200) {
      console.log('✅ Endpoint NFSe acessível');
    } else if (nfseResponse.status === 401) {
      console.log('❌ Token sem permissão para NFSe');
    } else {
      console.log('⚠️  Status NFSe:', nfseResponse.status, nfseResponse.statusText);
    }
    
    console.log('');
    console.log('🎉 RESULTADO FINAL:');
    if (empresaResponse.status === 200) {
      console.log('✅ Token Focus NFe configurado e funcionando corretamente!');
      console.log('✅ Pronto para emitir NFSe de homologação');
    } else {
      console.log('❌ Há problemas com o token. Verifique com o Focus NFe');
    }
    
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
  }
}

validarToken();
