// Teste simples da API Focus NFe para NFCe
// Execute: node teste-nfce-simples.js

const token = 'xWBoOr4HPJbVPxxSR9e8vCUkUnJt2u4G';
const baseUrl = 'https://homologacao.focusnfe.com.br/v2';

async function testarNFCeSimples() {
  console.log('🚀 Testando NFCe com Focus NFe...');
  console.log('🔑 Token:', token.substring(0, 10) + '...');
  console.log('🌐 Base URL:', baseUrl);
  
  // Dados mínimos para NFCe conforme documentação
  const dadosNFCe = {
    "natureza_operacao": "Venda",
    "data_emissao": "2025-01-30T15:00:00-03:00",
    "cnpj_cpf_destinatario": "123.456.789-00",
    "nome_destinatario": "João da Silva",
    "itens": [
      {
        "numero_item": 1,
        "codigo_produto": "SERV001",
        "descricao": "Consulta médica",
        "cfop": "5933",
        "unidade_comercial": "UN",
        "quantidade_comercial": 1,
        "valor_unitario_comercial": 150.00,
        "unidade_tributavel": "UN",
        "quantidade_tributavel": 1,
        "valor_unitario_tributavel": 150.00,
        "ncm": "00000000",
        "icms_situacao_tributaria": "103",
        "icms_origem": 0,
        "pis_situacao_tributaria": "07",
        "cofins_situacao_tributaria": "07"
      }
    ],
    "formas_pagamento": [
      {
        "forma_pagamento": "01",
        "valor_pagamento": 150.00
      }
    ]
  };
  
  try {
    const referencia = `TESTE_${Date.now()}`;
    const url = `${baseUrl}/nfce?ref=${referencia}`;
    
    console.log(`🌐 URL: ${url}`);
    console.log(`📋 Dados:`, JSON.stringify(dadosNFCe, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosNFCe)
    });
    
    console.log(`📡 Status: ${response.status}`);
    console.log(`📡 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📄 Resposta raw:`, responseText);
    
    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ JSON válido:', data);
        
        if (response.ok) {
          console.log('🎉 SUCESSO: NFCe processada!');
        } else {
          console.log('❌ ERRO:', data);
        }
      } catch (e) {
        console.log('❌ Não é JSON válido');
      }
    }
    
  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

testarNFCeSimples();
