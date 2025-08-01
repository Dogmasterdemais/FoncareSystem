// Teste de NFSe Focus NFe - testando estrutura correta para serviços
// Execute: node teste-nfse-focus.js

const token = 'xWBoOr4HPJbVPxxSR9e8vCUkUnJt2u4G';
const baseUrl = 'https://homologacao.focusnfe.com.br/v2';

async function testarNFSe() {
  console.log('🔍 Testando emissão de NFSe...');
  
  // Dados específicos para NFSe (Nota Fiscal de Serviço Eletrônica)
  const nfseData = {
    "data_emissao": new Date().toISOString(),
    "data_competencia": new Date().toISOString().split('T')[0],
    
    // Prestador (obrigatório para NFSe)
    "prestador": {
      "cnpj": "07504505000132",
      "inscricao_municipal": "12345",
      "codigo_municipio": 4106902
    },
    
    // Tomador
    "tomador": {
      "cpf": "12345678901",
      "razao_social": "João da Silva",
      "endereco": {
        "logradouro": "Rua Teste",
        "numero": "123",
        "bairro": "Centro",
        "codigo_municipio": 4106902,
        "uf": "PR",
        "cep": "80000000"
      },
      "telefone": "41999999999",
      "email": "teste@teste.com"
    },
    
    // Serviço
    "servico": {
      "valor_servicos": 150.00,
      "item_lista_servico": "04.01",
      "codigo_cnae": "8650100",
      "discriminacao": "Sessão de fisioterapia",
      "codigo_municipio": 4106902,
      "aliquota": 2.00,
      "valor_iss": 3.00,
      "valor_pis": 0.975,
      "valor_cofins": 4.50,
      "valor_ir": 2.25,
      "valor_csll": 1.50,
      "iss_retido": false
    },
    
    "observacoes": "Teste de emissão NFSe - Ambiente de homologação"
  };
  
  try {
    const referencia = `TESTE_NFSE_${Date.now()}`;
    const url = `${baseUrl}/nfse?ref=${referencia}`;
    
    console.log(`🌐 URL: ${url}`);
    console.log(`📤 Dados:`, JSON.stringify(nfseData, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nfseData)
    });
    
    console.log(`📡 Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`📄 Resposta completa: ${text}`);
    
    if (response.status === 200 || response.status === 202) {
      console.log('✅ SUCESSO! NFSe aceita para processamento!');
    } else if (response.status === 422) {
      console.log('⚠️ Erro de validação - verifique os dados enviados');
    } else {
      console.log(`❌ Erro ${response.status}`);
    }
    
  } catch (error) {
    console.error(`💥 Erro: ${error.message}`);
  }
}

// Testar também um GET simples para verificar conectividade
async function testarConectividadeNFSe() {
  console.log('\n🌐 Testando conectividade NFSe...');
  
  try {
    const response = await fetch(`${baseUrl}/nfse`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`
      }
    });
    
    console.log(`📡 Status conectividade: ${response.status}`);
    
    if (response.status === 401) {
      console.log('❌ 401 - Problemas de autenticação');
    } else if (response.status === 404) {
      console.log('🤔 404 - Endpoint não encontrado (normal sem referência)');
    } else if (response.status === 400) {
      console.log('✅ 400 - Servidor acessível, falta dados (normal)');
    } else {
      console.log('✅ Conectividade OK');
    }
    
  } catch (error) {
    console.error(`💥 Erro de conectividade: ${error.message}`);
  }
}

async function executarTestes() {
  await testarConectividadeNFSe();
  await testarNFSe();
}

executarTestes().catch(console.error);
