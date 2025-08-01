// Script para testar conectividade Focus NFe
// Execute: node testar-focus-nfe.js

const token = 'xWBoOr4HPJbVPxxSR9e8vCUkUnJt2u4G';
const baseUrl = 'https://homologacao.focusnfe.com.br/v2';

async function testarConectividade() {
  console.log('🚀 Testando conectividade com Focus NFe...');
  console.log('🔑 Token:', token.substring(0, 10) + '...');
  console.log('🌐 Base URL:', baseUrl);
  
  try {
    // Teste simples de conectividade
    const response = await fetch(`${baseUrl}/empresas`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Resposta:', responseText);
    
    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ JSON válido:', data);
      } catch (e) {
        console.log('❌ Não é JSON válido');
      }
    }
    
  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

// Teste específico para NFCe
async function testarNFCe() {
  console.log('\n🧾 Testando endpoint NFCe...');
  
  const dadosTeste = {
    natureza_operacao: "Venda",
    serie: "1",
    data_emissao: "2025-01-30",
    cnpj_cpf_destinatario: "123.456.789-00",
    nome_destinatario: "João da Silva",
    logradouro_destinatario: "Rua das Flores",
    numero_destinatario: "123",
    bairro_destinatario: "Centro",
    municipio_destinatario: "São Paulo",
    uf_destinatario: "SP",
    cep_destinatario: "01234-567",
    items: [{
      codigo_produto: "SERV001",
      descricao: "Consulta médica",
      cfop: "5933",
      unidade_comercial: "UN",
      quantidade_comercial: 1,
      valor_unitario_comercial: 150.00,
      valor_bruto_produtos: 150.00,
      unidade_tributavel: "UN",
      quantidade_tributavel: 1,
      valor_unitario_tributavel: 150.00,
      ncm: "00000000",
      icms_situacao_tributaria: "103",
      icms_origem: 0,
      pis_situacao_tributaria: "07",
      cofins_situacao_tributaria: "07"
    }]
  };
  
  try {
    const referencia = `TEST_${Date.now()}`;
    const response = await fetch(`${baseUrl}/nfce?ref=${referencia}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosTeste)
    });
    
    console.log('📡 Status NFCe:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Resposta NFCe:', responseText);
    
  } catch (error) {
    console.error('💥 Erro NFCe:', error);
  }
}

// Executar testes
testarConectividade().then(() => testarNFCe());
