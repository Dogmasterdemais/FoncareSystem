// Teste de autenticação Focus NFe - testando diferentes formatos
// Execute: node teste-auth-focus.js

const token = 'xWBoOr4HPJbVPxxSR9e8vCUkUnJt2u4G';
const baseUrl = 'https://homologacao.focusnfe.com.br/v2';

async function testarAutenticacao() {
  console.log('🔍 Testando diferentes formatos de autenticação...');
  
  const testData = {
    "natureza_operacao": "Venda",
    "cnpj_cpf_destinatario": "123.456.789-00",
    "nome_destinatario": "João da Silva",
    "itens": [{
      "codigo_produto": "SERV001",
      "descricao": "Teste",
      "cfop": "5933",
      "unidade_comercial": "UN",
      "quantidade_comercial": 1,
      "valor_unitario_comercial": 150.00
    }],
    "formas_pagamento": [{
      "forma_pagamento": "01",
      "valor_pagamento": 150.00
    }]
  };
  
  const authFormats = [
    {
      name: 'Token Header',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Basic Auth (token:)',
      headers: {
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Basic Auth (:token)',
      headers: {
        'Authorization': `Basic ${Buffer.from(':' + token).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Bearer Token',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  ];
  
  for (const auth of authFormats) {
    console.log(`\n🧪 Testando: ${auth.name}`);
    
    try {
      const url = `${baseUrl}/nfce?ref=TEST_${Date.now()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: auth.headers,
        body: JSON.stringify(testData)
      });
      
      console.log(`📡 Status: ${response.status}`);
      
      if (response.status !== 401) {
        const text = await response.text();
        console.log(`📄 Resposta: ${text.substring(0, 200)}...`);
        
        if (response.status === 200 || response.status === 202) {
          console.log('✅ SUCESSO! Este formato de autenticação funciona!');
          break;
        }
      } else {
        console.log('❌ 401 - Não autorizado');
      }
      
    } catch (error) {
      console.error(`💥 Erro: ${error.message}`);
    }
  }
}

// Também testar um endpoint simples para verificar conectividade
async function testarConectividade() {
  console.log('\n🌐 Testando conectividade básica...');
  
  try {
    // Tentar um GET simples sem autenticação
    const response = await fetch(`${baseUrl}/`);
    console.log(`📡 Status raiz: ${response.status}`);
    
    const text = await response.text();
    console.log(`📄 Resposta: ${text.substring(0, 100)}...`);
    
  } catch (error) {
    console.error(`💥 Erro de conectividade: ${error.message}`);
  }
}

async function executarTestes() {
  await testarConectividade();
  await testarAutenticacao();
}

executarTestes();
