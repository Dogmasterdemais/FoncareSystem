// Teste manual do token Focus NFe
// Execute este script no console do navegador para testar diretamente

async function testeTokenFocusNFe() {
  const token = 'pJgBFl5J8taKrbaUmVRfxgAf3S1QhYjT';
  
  console.log('🔍 Testando token Focus NFe...');
  console.log('🔑 Token:', token.substring(0, 10) + '...');
  
  try {
    // Teste 1: Listar NFes existentes (GET)
    console.log('\n📋 Teste 1: Listando NFes...');
    const response = await fetch('https://api.focusnfe.com.br/v2/nfe', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📄 Headers:', Object.fromEntries(response.headers.entries()));
    console.log('🔍 Content-Type:', response.headers.get('content-type'));
    
    const responseText = await response.text();
    console.log('📄 Resposta:', responseText);
    
    if (response.status === 401) {
      console.error('❌ Token inválido ou expirado');
      return false;
    }
    
    if (response.status === 200) {
      console.log('✅ Token válido - API respondeu corretamente');
      return true;
    }
    
    console.warn('⚠️ Status inesperado:', response.status);
    return false;
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
    return false;
  }
}

// Execute o teste
testeTokenFocusNFe();
