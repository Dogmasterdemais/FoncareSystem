interface FocusNFeConfig {
  token: string;
  environment: 'homologacao' | 'producao';
}

// Interface para dados de entrada (compatível com nossa aplicação)
interface DadosNFeEntrada {
  // Dados do tomador (cliente)
  natureza_operacao: string;
  data_emissao: string;
  data_competencia?: string;
  discriminacao?: string;
  discriminacao_servicos?: string;
  cpf_cnpj_tomador: string;
  destinatario_documento?: string;
  razao_social_tomador: string;
  destinatario_nome?: string;
  logradouro_tomador: string;
  destinatario_endereco?: string;
  numero_tomador: string;
  bairro_tomador: string;
  codigo_municipio_tomador: string;
  uf_tomador: string;
  cep_tomador: string;
  email_tomador?: string;
  destinatario_email?: string;
  telefone_tomador?: string;
  destinatario_telefone?: string;
  
  // Dados do prestador (emitente)
  cnpj_prestador?: string;
  inscricao_municipal_prestador?: string;
  codigo_municipio_prestador?: string;
  
  // Dados do serviço
  valor_servicos: number;
  item_lista_servico?: string;
  codigo_cnae?: string;
  aliquota_iss?: number;
  
  // Outros
  observacoes?: string;
}

// Interface para NFCe da Focus NFe (estrutura correta)
interface FocusNFeRequest {
  // Dados da NFCe
  natureza_operacao: string;
  serie?: string;
  numero?: string;
  data_emissao: string;
  
  // Campos específicos da NFCe
  consumidor_final?: number;
  presenca_comprador?: number;
  finalidade_emissao?: number;
  
  // Dados do destinatário (opcional para NFCe - venda balcão)
  cnpj_cpf_destinatario?: string;
  nome_destinatario?: string;
  logradouro_destinatario?: string;
  numero_destinatario?: string;
  bairro_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  cep_destinatario?: string;
  telefone_destinatario?: string;
  email_destinatario?: string;
  
  // Itens da NFCe
  itens: Array<{
    numero_item: number;
    codigo_produto: string;
    descricao: string;
    cfop: string;
    unidade_comercial: string;
    quantidade_comercial: number;
    valor_unitario_comercial: number;
    valor_bruto_produtos: number;
    unidade_tributavel: string;
    quantidade_tributavel: number;
    valor_unitario_tributavel: number;
    ncm: string;
    
    // Impostos
    icms_situacao_tributaria: string;
    icms_origem: number;
    
    pis_situacao_tributaria: string;
    cofins_situacao_tributaria: string;
  }>;
  
  // Formas de pagamento (obrigatório para NFCe)
  formas_pagamento?: Array<{
    forma_pagamento: string;
    valor_pagamento: number;
  }>;
  
  observacoes?: string;
}

interface FocusNFeResponse {
  id: string;
  numero: number;
  serie: string;
  status: string;
  url_danfe?: string;
  url_xml?: string;
  chave_nfe?: string;
  protocolo?: string;
  data_emissao: string;
  numero_rps?: number;
  serie_rps?: string;
  mensagem_retorno?: string;
  codigo_retorno?: string;
}

interface TransmissaoResult {
  sucesso: boolean;
  nfeId?: string;
  numeroNfe?: string;
  chaveAcesso?: string;
  protocolo?: string;
  mensagem: string;
  urlDanfe?: string;
  urlXml?: string;
}

export class FocusNFeService {
  private config: FocusNFeConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      token: process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN || '',
      environment: (process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT as 'homologacao' | 'producao') || 'homologacao'
    };

    // Corrigido: Para NFe, sempre usar api.focusnfe.com.br (tanto homologação quanto produção)
    this.baseUrl = 'https://api.focusnfe.com.br/v2';

  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(this.config.token + ':').toString('base64')}`
    };
  }

  /**
   * Emite uma NFSe através da Focus NFe
   */
  async emitirNFSe(dadosNFe: Partial<DadosNFeEntrada>): Promise<TransmissaoResult> {
    try {
      console.log('🚀 Iniciando emissão de NFSe...');
      console.log('🔑 Token disponível:', this.config.token ? `${this.config.token.substring(0, 10)}...` : 'NÃO DEFINIDO');
      console.log('🌍 Ambiente:', this.config.environment);
      console.log('🌐 Base URL:', this.config.environment === 'producao' ? 'https://api.focusnfe.com.br/v2' : 'https://homologacao.focusnfe.com.br/v2');
      console.log('📋 Dados recebidos:', dadosNFe);
      
      if (!this.config.token) {
        throw new Error('Token Focus NFe não configurado. Verifique as variáveis de ambiente.');
      }

      // Converter dados de entrada para formato da Focus NFSe (Nota Fiscal de Serviço Eletrônica)
      const nfseRequest = {
        data_emissao: dadosNFe.data_emissao || new Date().toISOString(),
        data_competencia: dadosNFe.data_competencia || new Date().toISOString().split('T')[0],
        
        // Prestador (emitente) - obrigatório para NFSe
        prestador: {
          cnpj: dadosNFe.cnpj_prestador || '07504505000132', // CNPJ configurado
          inscricao_municipal: dadosNFe.inscricao_municipal_prestador || '12345',
          codigo_municipio: dadosNFe.codigo_municipio_prestador || 4106902 // Curitiba
        },
        
        // Tomador (cliente)
        tomador: {
          cnpj: dadosNFe.destinatario_documento?.replace(/[^\d]/g, '').length === 14 ? dadosNFe.destinatario_documento?.replace(/[^\d]/g, '') : undefined,
          cpf: dadosNFe.destinatario_documento?.replace(/[^\d]/g, '').length === 11 ? dadosNFe.destinatario_documento?.replace(/[^\d]/g, '') : undefined,
          razao_social: dadosNFe.destinatario_nome || 'Cliente',
          endereco: {
            logradouro: dadosNFe.destinatario_endereco || 'Rua Principal',
            numero: '100',
            bairro: 'Centro',
            codigo_municipio: 4106902,
            uf: 'PR',
            cep: '80000000'
          },
          telefone: dadosNFe.destinatario_telefone || '',
          email: dadosNFe.destinatario_email || ''
        },
        
        // Serviço prestado
        servico: {
          valor_servicos: dadosNFe.valor_servicos || 0,
          item_lista_servico: dadosNFe.item_lista_servico || '04.01', // Serviços de saúde
          codigo_cnae: dadosNFe.codigo_cnae || '8650100', // Atividades de fisioterapia
          discriminacao: dadosNFe.discriminacao_servicos || 'Serviços de Terapia',
          codigo_municipio: 4106902, // Município da prestação
          
          // Impostos conforme especificação
          aliquota: dadosNFe.aliquota_iss || 2.00, // ISS 2%
          valor_iss: ((dadosNFe.valor_servicos || 0) * 0.02),
          
          // Valores de retenção
          valor_pis: ((dadosNFe.valor_servicos || 0) * 0.0065), // PIS 0.65%
          valor_cofins: ((dadosNFe.valor_servicos || 0) * 0.03), // COFINS 3%
          valor_ir: ((dadosNFe.valor_servicos || 0) * 0.015), // IRRF 1.5%
          valor_csll: ((dadosNFe.valor_servicos || 0) * 0.01), // CSLL 1%
          
          iss_retido: false
        },
        
        observacoes: dadosNFe.observacoes
      };

      // Gerar referência única para a NFSe
      const referencia = `NFSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // URL correta baseada no ambiente - USAR NFSE
      const baseUrl = this.config.environment === 'producao' 
        ? 'https://api.focusnfe.com.br/v2' 
        : 'https://homologacao.focusnfe.com.br/v2';
        
      const urls = [
        `${baseUrl}/nfse?ref=${referencia}`, // NFSe endpoint correto
        `/api/focus-nfe` // Proxy API Route
      ];
      
      console.log('🔗 URLs que serão testadas:', urls);

      let lastError: Error | null = null;

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const isProxy = url.startsWith('/api/');

        try {
          console.log(`🌐 Tentando URL: ${url} (${isProxy ? 'via proxy' : 'direto'})`);
          console.log(`📤 Dados da requisição:`, isProxy ? { path: `/nfse?ref=${referencia}`, method: 'POST', data: nfseRequest } : nfseRequest);
          
          const headers = isProxy 
            ? { 'Content-Type': 'application/json' } 
            : this.getHeaders();
            
          console.log(`📋 Headers da requisição:`, headers);

          const body = isProxy 
            ? JSON.stringify({
                path: `/nfse?ref=${referencia}`, // NFSe endpoint
                method: 'POST',
                data: nfseRequest
              })
            : JSON.stringify(nfseRequest);

          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
          });

          console.log(`📡 Status da resposta (${isProxy ? 'Proxy' : 'Direto'}):`, response.status);
          console.log(`📡 Headers da resposta:`, Object.fromEntries(response.headers.entries()));

          let responseData;
          let responseText;
          
          try {
            responseText = await response.text();
            console.log(`📄 Resposta raw completa:`, responseText);
            
            if (!responseText.trim()) {
              throw new Error('Resposta vazia da API Focus NFe');
            }
            
            // Verificar se a resposta parece ser JSON válido
            if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
              throw new Error(`Resposta não é JSON válido. Conteúdo: ${responseText}`);
            }
            
            // Tentar fazer parse do JSON
            responseData = JSON.parse(responseText);
            console.log('✅ Parse JSON bem-sucedido:', responseData);
            
          } catch (jsonError) {
            console.error('❌ Erro no parse JSON:', jsonError);
            console.log('📄 Resposta completa:', responseText);
            
            // Criar erro mais específico baseado no tipo de resposta
            let errorMessage = 'Erro no parse JSON da resposta Focus NFe';
            
            if (responseText && responseText.toLowerCase().includes('<html')) {
              errorMessage = 'API Focus NFe retornou HTML em vez de JSON - possível erro de proxy/firewall';
            } else if (!responseText || !responseText.trim()) {
              errorMessage = 'API Focus NFe retornou resposta vazia';
            } else if (responseText && (!responseText.startsWith('{') && !responseText.startsWith('['))) {
              errorMessage = `API Focus NFe retornou formato inválido. Conteúdo: ${responseText.substring(0, 200)}`;
            } else {
              errorMessage = `Erro no parse JSON: ${jsonError instanceof Error ? jsonError.message : 'Erro desconhecido'}`;
            }
            
            // Se o status é de erro HTTP, incluir isso na mensagem
            if (!response.ok) {
              errorMessage += ` (HTTP ${response.status})`;
            }
            
            throw new Error(errorMessage);
          }

          if (!response.ok) {
            console.error(`❌ Erro HTTP ${response.status}:`, responseData);
            
            // Tratar diferentes tipos de erro
            let errorMessage = 'Erro na API Focus NFe';
            
            if (response.status === 401) {
              errorMessage = 'Token Focus NFe inválido ou expirado. Verifique as credenciais.';
            } else if (response.status === 403) {
              errorMessage = 'Acesso negado pela API Focus NFe. Verifique as permissões do token.';
            } else if (response.status === 422) {
              // Erro de validação - extrair detalhes
              if (responseData.erros && Array.isArray(responseData.erros)) {
                errorMessage = `Dados inválidos: ${responseData.erros.join(', ')}`;
              } else if (responseData.mensagem) {
                errorMessage = `Erro de validação: ${responseData.mensagem}`;
              } else {
                errorMessage = 'Dados da NFSe são inválidos. Verifique os campos obrigatórios.';
              }
            } else if (response.status === 500) {
              errorMessage = 'Erro interno da API Focus NFe. Tente novamente em alguns minutos.';
            } else {
              // Tentar extrair mensagem de erro específica
              if (responseData.mensagem) {
                errorMessage = responseData.mensagem;
              } else if (responseData.erros && Array.isArray(responseData.erros)) {
                errorMessage = responseData.erros.join(', ');
              } else if (responseData.error) {
                errorMessage = responseData.error;
              } else {
                errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
              }
            }
            
            // Se é erro de autenticação ou configuração, não tentar proxy
            if (response.status === 401 || response.status === 403) {
              throw new Error(errorMessage);
            }
            
            // Para outros erros, tentar próxima URL
            lastError = new Error(errorMessage);
            console.log(`⚠️ Tentando próxima URL devido ao erro: ${errorMessage}`);
            continue;
          }

          console.log(`✅ NFe emitida com sucesso via ${isProxy ? 'Proxy' : 'Direto'}!`);
          return {
            sucesso: true,
            nfeId: responseData.id,
            numeroNfe: responseData.numero?.toString(),
            chaveAcesso: responseData.chave_nfe,
            protocolo: responseData.protocolo,
            mensagem: `NFSe emitida com sucesso via ${isProxy ? 'Proxy' : 'Direto'}`,
            urlDanfe: responseData.url_danfe,
            urlXml: responseData.url_xml
          };

        } catch (error) {
          console.error(`💥 Erro na tentativa ${i + 1} (${isProxy ? 'Proxy' : 'Direto'}):`, error);
          lastError = error instanceof Error ? error : new Error('Erro desconhecido');
          
          // Se é erro de CORS, tentar proxy
          if (error instanceof TypeError && error.message.includes('Failed to fetch') && !isProxy) {
            continue;
          }
          
          // Para outros erros, não continuar
          break;
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      throw lastError || new Error('Todas as tentativas de emissão falharam');

    } catch (error) {
      // Detectar tipos específicos de erro
      let mensagemErro = 'Erro desconhecido ao emitir NFSe';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        mensagemErro = 'Erro de conectividade. Verifique sua conexão com a internet e se a API Focus NFe está acessível. Tentamos usar proxy mas também falhou.';
      } else if (error instanceof Error) {
        mensagemErro = error.message;
      }

      return {
        sucesso: false,
        mensagem: mensagemErro
      };
    }
  }

  /**
   * Consulta o status de uma NFSe
   */
  async consultarNFSe(referencia: string): Promise<FocusNFeResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/nfce/${referencia}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar NFSe:', error);
      return null;
    }
  }

  /**
   * Cancela uma NFSe
   */
  async cancelarNFSe(referencia: string, justificativa: string): Promise<TransmissaoResult> {
    try {
      const response = await fetch(`${this.baseUrl}/nfce/${referencia}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ justificativa })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.mensagem || `Erro HTTP: ${response.status}`);
      }

      return {
        sucesso: true,
        mensagem: 'NFSe cancelada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao cancelar NFSe:', error);
      return {
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido ao cancelar NFSe'
      };
    }
  }

  /**
   * Baixa o DANFE (PDF) de uma NFSe
   */
  async baixarDANFE(referencia: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/nfce/${referencia}.pdf`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao baixar DANFE:', error);
      return null;
    }
  }

  /**
   * Baixa o XML de uma NFSe
   */
  async baixarXML(referencia: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/nfce/${referencia}.xml`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Erro ao baixar XML:', error);
      return null;
    }
  }

  /**
   * Envia NFe por email usando referência
   */
  async enviarPorEmail(referencia: string, emails: string[]): Promise<TransmissaoResult> {
    try {
      console.log('📧 Enviando NFe por email...', { referencia, emails });

      // Primeiro tentar diretamente
      try {
        const response = await fetch(`${this.baseUrl}/nfce/${referencia}/email`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ emails })
        });

        const responseData = await response.json();

        if (response.ok) {
          return {
            sucesso: true,
            mensagem: 'NFe enviada por email com sucesso'
          };
        }
      } catch (error) {
        console.log('⚠️ Envio direto falhou, tentando via proxy...');
      }

      // Tentar via proxy
      const proxyResponse = await fetch('/api/focus-nfe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/nfce/${referencia}/email`,
          method: 'POST',
          data: { emails }
        })
      });

      const result = await proxyResponse.json();

      if (proxyResponse.ok) {
        return {
          sucesso: true,
          mensagem: 'NFe enviada por email com sucesso via proxy'
        };
      }

      throw new Error(result.mensagem || 'Erro ao enviar email');

    } catch (error) {
      console.error('💥 Erro ao enviar NFe por email:', error);
      return {
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido ao enviar NFe por email'
      };
    }
  }

  /**
   * Consulta NFe usando referência
   */
  async consultarNFe(referencia: string): Promise<any> {
    try {
      console.log('🔍 Consultando NFe...', referencia);

      // Primeiro tentar diretamente
      try {
        const response = await fetch(`${this.baseUrl}/nfce/${referencia}`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log('⚠️ Consulta direta falhou, tentando via proxy...');
      }

      // Tentar via proxy
      const proxyResponse = await fetch('/api/focus-nfe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `/nfce/${referencia}`,
          method: 'GET'
        })
      });

      if (proxyResponse.ok) {
        return await proxyResponse.json();
      }

      throw new Error('Erro ao consultar NFe');

    } catch (error) {
      console.error('💥 Erro ao consultar NFe:', error);
      return null;
    }
  }

  /**
   * Verifica se o serviço está configurado corretamente
   */
  isConfigured(): boolean {
    const isValid = !!this.config.token && this.config.token.length > 10;
    
    if (!isValid) {
      console.error('❌ Focus NFe não configurado:', {
        hasToken: !!this.config.token,
        tokenLength: this.config.token.length,
        environment: this.config.environment,
        expectedToken: 'NEXT_PUBLIC_FOCUS_NFE_TOKEN deve estar no .env.local'
      });
    }
    
    return isValid;
  }

  /**
   * Testa a conectividade com a API Focus NFe
   */
  async testarConectividade(): Promise<TransmissaoResult> {
    try {
      console.log('🔍 Testando conectividade Focus NFe...');
      
      if (!this.isConfigured()) {
        return {
          sucesso: false,
          mensagem: 'Serviço não configurado. Token ausente ou inválido.'
        };
      }

      // Tentar primeiro requisição direta, depois proxy
      const urls = [
        `${this.baseUrl}/nfse`, // Requisição direta - CORRIGIDO: /nfse
        `/api/focus-nfe` // Proxy API Route
      ];

      let lastError: Error | null = null;

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const isProxy = url.startsWith('/api/');

        try {
          console.log(`🔍 Teste ${i + 1}: ${isProxy ? 'Proxy' : 'Direto'} - ${url}`);

          const headers = isProxy 
            ? {} // Para proxy, não precisa de headers especiais no teste
            : this.getHeaders(); // Para requisição direta, usar headers com token

          const response = await fetch(url, {
            method: 'GET',
            headers: headers
          });

          console.log(`📡 Status do teste (${isProxy ? 'Proxy' : 'Direto'}):`, response.status);

          if (response.status === 401) {
            return {
              sucesso: false,
              mensagem: 'Token inválido ou expirado. Verifique suas credenciais Focus NFe.'
            };
          }

          if (response.status >= 200 && response.status < 500) {
            return {
              sucesso: true,
              mensagem: `Conectividade com Focus NFe OK via ${isProxy ? 'Proxy' : 'Direto'}!`
            };
          }

          lastError = new Error(`Erro de conectividade: HTTP ${response.status}`);

        } catch (error) {
          console.error(`❌ Erro no teste ${i + 1} (${isProxy ? 'Proxy' : 'Direto'}):`, error);
          lastError = error instanceof Error ? error : new Error('Erro desconhecido');
          
          // Se é erro de CORS, tentar proxy
          if (error instanceof TypeError && error.message.includes('Failed to fetch') && !isProxy) {
            console.log('🔄 Erro de CORS no teste, tentando proxy...');
            continue;
          }
          
          // Para outros erros, não continuar
          break;
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      if (lastError instanceof TypeError && lastError.message.includes('Failed to fetch')) {
        return {
          sucesso: false,
          mensagem: 'Falha na conexão. Verifique sua internet, firewall ou se o servidor Focus NFe está acessível. Problemas de CORS detectados - proxy também falhou.'
        };
      }

      return {
        sucesso: false,
        mensagem: lastError?.message || 'Erro desconhecido na conectividade'
      };

    } catch (error) {
      console.error('❌ Erro geral no teste de conectividade:', error);
      
      return {
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido na conectividade'
      };
    }
  }

  /**
   * Obtém informações sobre a configuração atual
   */
  getConfigInfo() {
    return {
      environment: this.config.environment,
      hasToken: !!this.config.token,
      baseUrl: this.baseUrl
    };
  }
}

// Função helper para extrair endereço completo
export function extrairEnderecoCompleto(enderecoCompleto: string) {
  // Parse básico do endereço - você pode melhorar esta lógica
  const partes = enderecoCompleto.split(',').map(p => p.trim());
  
  return {
    logradouro: partes[0] || '',
    numero: partes[1] || 'S/N',
    bairro: partes[2] || '',
    cep: partes[3] || '',
    municipio: partes[4] || '',
    uf: partes[5] || 'PR'
  };
}

// Função helper para formatar documento
export function formatarDocumento(documento: string): string {
  return documento.replace(/\D/g, '');
}

// Função helper para calcular ISS
export function calcularISS(valorServicos: number, aliquota: number): number {
  return (valorServicos * aliquota) / 100;
}

export { FocusNFeService as default };
