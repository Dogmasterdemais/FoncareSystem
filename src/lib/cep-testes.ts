// Exemplo de teste da funcionalidade de busca CEP
// Para testar, use estes CEPs válidos:

export const CEPsParaTeste = {
  // CEP da Avenida Paulista - São Paulo/SP
  "01310100": {
    esperado: {
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista", 
      cidade: "São Paulo",
      uf: "SP"
    }
  },
  
  // CEP do Copacabana - Rio de Janeiro/RJ  
  "22070900": {
    esperado: {
      logradouro: "Avenida Atlântica",
      bairro: "Copacabana",
      cidade: "Rio de Janeiro", 
      uf: "RJ"
    }
  },
  
  // CEP de Brasília/DF
  "70040010": {
    esperado: {
      logradouro: "SBN Quadra 1",
      bairro: "Asa Norte",
      cidade: "Brasília",
      uf: "DF"
    }
  }
};

// Instruções para testar:
// 1. Acesse: http://localhost:3003/nac/cadastrar-paciente
// 2. Vá para o passo 3 (Endereço)
// 3. Digite um dos CEPs acima no campo CEP
// 4. Observe os campos sendo preenchidos automaticamente
// 5. Veja a mensagem de sucesso aparecer

console.log("CEPs para teste:", Object.keys(CEPsParaTeste));
