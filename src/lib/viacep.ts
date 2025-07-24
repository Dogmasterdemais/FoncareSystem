// Utilitário para buscar CEP na API do ViaCEP
export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Função para formatar CEP (adicionar hífen)
export const formatarCEP = (cep: string): string => {
  const apenasNumeros = cep.replace(/\D/g, '');
  if (apenasNumeros.length <= 5) {
    return apenasNumeros;
  }
  return apenasNumeros.replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

// Função para validar CEP
export const validarCEP = (cep: string): boolean => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
};

// Função para buscar endereço pelo CEP
export const buscarEnderecoPorCEP = async (cep: string): Promise<EnderecoViaCEP | null> => {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (!validarCEP(cepLimpo)) {
      throw new Error('CEP inválido');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const endereco: EnderecoViaCEP = await response.json();

    if (endereco.erro) {
      throw new Error('CEP não encontrado');
    }

    return endereco;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

// Função para converter dados do ViaCEP para formato do formulário
export const converterEnderecoViaCEP = (endereco: EnderecoViaCEP) => {
  return {
    cep: formatarCEP(endereco.cep),
    logradouro: endereco.logradouro,
    bairro: endereco.bairro,
    cidade: endereco.localidade,
    uf: endereco.uf,
    complemento: endereco.complemento || ''
  };
};
