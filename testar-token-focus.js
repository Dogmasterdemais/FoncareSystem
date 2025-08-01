// Teste específico para validar token Focus NFe
// Baseado na documentação oficial: https://focusnfe.com.br/doc/

const token = 'xWBoOr4HPJbVPxxSR9e8vCUkUnJt2u4G';

async function testarTokenFocus() {
  console.log('🔍 Validando token Focus NFe...');
  console.log('🔑 Token:', token);
  
  // URLs de teste baseadas na documentação
  const urls = [
    'https://homologacao.focusnfe.com.br/v2/nfse',
    'https://homologacao.focusnfe.com.br/v2/nfce',
    'https://homologacao.focusnfe.com.br/v2/nfe'
  ];
  
  for (const url of urls) {
    console.log(`\n🌐 Testando: ${url}`);
    
    try {
      // Teste com Token auth (recomendado)
      const responseToken = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        }
      });
      
      console.log(`📡 Status (Token): ${responseToken.status}`);
      
      if (responseToken.status !== 401) {
        const text = await responseToken.text();
        console.log(`📄 Resposta (Token): ${text.substring(0, 200)}...`);
      }
      
      // Teste com Basic auth (alternativa)
      const responseBasic = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`,
        }
      });
      
      console.log(`📡 Status (Basic): ${responseBasic.status}`);
      
      if (responseBasic.status !== 401) {
        const text = await responseBasic.text();
        console.log(`📄 Resposta (Basic): ${text.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.error(`💥 Erro: ${error.message}`);
    }
  }
}

testarTokenFocus();
