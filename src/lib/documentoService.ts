import { supabase } from './supabaseClient';

// === INTERFACES PARA DOCUMENTOS ===
export interface DocumentoColaborador {
  id?: string;
  colaborador_id: string;
  tipo_documento: string;
  categoria: 'obrigatorio' | 'complementar' | 'contrato' | 'advertencia';
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_arquivo?: number;
  mime_type?: string;
  data_upload?: string;
  data_vencimento?: string;
  status?: 'ativo' | 'vencido' | 'substituido' | 'excluido';
  observacoes?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para dados específicos CLT
export interface ColaboradorDocumentosCLT {
  id?: string;
  colaborador_id: string;
  ctps_numero?: string;
  ctps_serie?: string;
  ctps_uf?: string;
  ctps_data_emissao?: string;
  pis_nis_nit?: string;
  certidao_nascimento_casamento?: string;
  comprovante_endereco?: string;
  comprovante_escolaridade?: string;
  antecedentes_criminais?: string;
  aso_admissional?: string;
  aso_data_realizacao?: string;
  aso_data_vencimento?: string;
  aso_resultado?: 'apto' | 'inapto' | 'apto_com_restricoes';
  certificado_reservista?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para dados específicos PJ
export interface ColaboradorDocumentosPJ {
  id?: string;
  colaborador_id: string;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  contrato_prestacao_servicos?: string;
  data_inicio_contrato?: string;
  data_fim_contrato?: string;
  valor_contrato?: number;
  certidao_negativa_inss?: string;
  certidao_negativa_fgts?: string;
  certidao_negativa_receita?: string;
  comprovante_iss?: string;
  nfe_configurada?: boolean;
  nfe_ultimo_numero?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Advertencia {
  id?: string;
  colaborador_id: string;
  tipo_advertencia: 'verbal' | 'escrita' | 'suspensao';
  motivo: string;
  descricao?: string;
  data_aplicacao: string;
  documento_path?: string;
  aplicada_por?: string;
  testemunha_1?: string;
  testemunha_2?: string;
  status?: 'ativa' | 'revogada' | 'cumprida';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para perfis de acesso
export interface ColaboradorPerfilAcesso {
  id?: string;
  colaborador_id: string;
  perfil: 'recepcao' | 'terapeuta' | 'financeiro' | 'rh' | 'gestor' | 'admin';
  unidade_id?: string;
  pode_agendar?: boolean;
  pode_cancelar?: boolean;
  pode_faturar?: boolean;
  pode_gerar_relatorios?: boolean;
  pode_gerenciar_usuarios?: boolean;
  data_inicio: string;
  data_fim?: string;
  status?: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

// === CONFIGURAÇÕES DE DOCUMENTOS ===
export const DOCUMENTOS_OBRIGATORIOS = {
  clt: [
    {
      tipo: 'cpf',
      nome: 'CPF',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'rg',
      nome: 'RG',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'ctps',
      nome: 'Carteira de Trabalho (CTPS)',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'pis',
      nome: 'PIS/PASEP',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'comprovante_residencia',
      nome: 'Comprovante de Residência',
      aceita_multiplos: false,
      vencimento: true,
      vencimento_meses: 3
    },
    {
      tipo: 'foto_3x4',
      nome: 'Foto 3x4',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'certidao_nascimento_casamento',
      nome: 'Certidão de Nascimento/Casamento',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'aso',
      nome: 'ASO - Atestado de Saúde Ocupacional',
      aceita_multiplos: true,
      vencimento: true,
      vencimento_meses: 12
    },
    {
      tipo: 'titulo_eleitor',
      nome: 'Título de Eleitor',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'certificado_reservista',
      nome: 'Certificado de Reservista (se aplicável)',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'comprovante_escolaridade',
      nome: 'Comprovante de Escolaridade',
      aceita_multiplos: true,
      vencimento: false
    }
  ],
  pj: [
    {
      tipo: 'cpf',
      nome: 'CPF do Responsável',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'rg',
      nome: 'RG do Responsável',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'cnpj',
      nome: 'CNPJ',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'contrato_social',
      nome: 'Contrato Social',
      aceita_multiplos: false,
      vencimento: false
    },
    {
      tipo: 'comprovante_endereco_empresa',
      nome: 'Comprovante de Endereço da Empresa',
      aceita_multiplos: false,
      vencimento: true,
      vencimento_meses: 3
    },
    {
      tipo: 'certidao_negativa_inss',
      nome: 'CND INSS',
      aceita_multiplos: true,
      vencimento: true,
      vencimento_meses: 6
    },
    {
      tipo: 'certidao_negativa_fgts',
      nome: 'CRF FGTS',
      aceita_multiplos: true,
      vencimento: true,
      vencimento_meses: 6
    },
    {
      tipo: 'certidao_negativa_receita',
      nome: 'CND Receita Federal',
      aceita_multiplos: true,
      vencimento: true,
      vencimento_meses: 6
    },
    {
      tipo: 'alvara_funcionamento',
      nome: 'Alvará de Funcionamento',
      aceita_multiplos: false,
      vencimento: true,
      vencimento_meses: 12
    },
    {
      tipo: 'inscricao_municipal',
      nome: 'Inscrição Municipal',
      aceita_multiplos: false,
      vencimento: false
    }
  ]
};

export const DOCUMENTOS_COMPLEMENTARES = [
  {
    tipo: 'curriculo',
    nome: 'Currículo',
    aceita_multiplos: true,
    vencimento: false
  },
  {
    tipo: 'certificados_cursos',
    nome: 'Certificados de Cursos',
    aceita_multiplos: true,
    vencimento: false
  },
  {
    tipo: 'referencias_profissionais',
    nome: 'Referências Profissionais',
    aceita_multiplos: true,
    vencimento: false
  },
  {
    tipo: 'exames_medicos',
    nome: 'Exames Médicos Complementares',
    aceita_multiplos: true,
    vencimento: true,
    vencimento_meses: 12
  },
  {
    tipo: 'carteira_vacinacao',
    nome: 'Carteira de Vacinação',
    aceita_multiplos: true,
    vencimento: true,
    vencimento_meses: 12
  }
];

// === SERVIÇO DE UPLOAD ===
export const documentoService = {
  // Função para gerar o caminho do arquivo
  gerarCaminhoArquivo(
    unidadeNome: string,
    tipoColaborador: 'clt' | 'pj',
    nomeColaborador: string,
    tipoDocumento: string,
    nomeArquivo: string
  ): string {
    const unidadeLimpa = unidadeNome.replace(/[^a-zA-Z0-9]/g, '_');
    const nomeLimpo = nomeColaborador.replace(/[^a-zA-Z0-9]/g, '_');
    const pasta = tipoColaborador === 'clt' ? 'CLT' : 'Prestadores_PJ';
    
    return `${unidadeLimpa}/${pasta}/${nomeLimpo}/${tipoDocumento}/${nomeArquivo}`;
  },

  // Upload de arquivo
  async uploadDocumento(
    file: File,
    colaboradorId: string,
    tipoDocumento: string,
    categoria: 'obrigatorio' | 'complementar' | 'contrato' | 'advertencia',
    unidadeNome: string,
    tipoColaborador: 'clt' | 'pj',
    nomeColaborador: string,
    dataVencimento?: string,
    observacoes?: string
  ): Promise<DocumentoColaborador> {
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const extensao = file.name.split('.').pop();
      const nomeArquivo = `${tipoDocumento}_${timestamp}.${extensao}`;
      
      // Gerar caminho
      const caminhoArquivo = this.gerarCaminhoArquivo(
        unidadeNome,
        tipoColaborador,
        nomeColaborador,
        tipoDocumento,
        nomeArquivo
      );

      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rh-documentos')
        .upload(caminhoArquivo, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Salvar registro no banco
      const documento: Omit<DocumentoColaborador, 'id'> = {
        colaborador_id: colaboradorId,
        tipo_documento: tipoDocumento,
        categoria,
        nome_arquivo: file.name,
        caminho_arquivo: caminhoArquivo,
        tamanho_arquivo: file.size,
        mime_type: file.type,
        data_vencimento: dataVencimento,
        observacoes,
        status: 'ativo'
      };

      const { data, error } = await supabase
        .from('colaboradores_documentos')
        .insert(documento)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  },

  // Listar documentos de um colaborador
  async listarDocumentos(colaboradorId: string): Promise<DocumentoColaborador[]> {
    console.log('🔍 Buscando documentos para colaborador:', colaboradorId);
    
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .neq('status', 'excluido')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar documentos:', error);
      throw error;
    }
    
    console.log('📄 Documentos encontrados:', data?.length || 0, data);
    return data || [];
  },

  // Obter URL para visualizar documento
  async obterUrlDocumento(caminhoArquivo: string): Promise<string> {
    const { data } = await supabase.storage
      .from('rh-documentos')
      .createSignedUrl(caminhoArquivo, 3600); // URL válida por 1 hora

    return data?.signedUrl || '';
  },

  // Excluir documento
  async excluirDocumento(id: string): Promise<void> {
    // Buscar o documento
    const { data: documento, error: buscarError } = await supabase
      .from('colaboradores_documentos')
      .select('caminho_arquivo')
      .eq('id', id)
      .single();

    if (buscarError) throw buscarError;

    // Remover do storage
    const { error: storageError } = await supabase.storage
      .from('rh-documentos')
      .remove([documento.caminho_arquivo]);

    if (storageError) throw storageError;

    // Marcar como excluído no banco
    const { error: updateError } = await supabase
      .from('colaboradores_documentos')
      .update({ status: 'excluido' })
      .eq('id', id);

    if (updateError) throw updateError;
  },

  // Verificar documentos obrigatórios
  async verificarDocumentosObrigatorios(
    colaboradorId: string,
    tipoColaborador: 'clt' | 'pj'
  ): Promise<{
    documentos_pendentes: string[];
    documentos_vencidos: string[];
    documentos_ok: string[];
  }> {
    console.log('📋 Verificando documentos obrigatórios para:', { colaboradorId, tipoColaborador });
    
    const documentosObrigatorios = DOCUMENTOS_OBRIGATORIOS[tipoColaborador];
    const documentosExistentes = await this.listarDocumentos(colaboradorId);

    console.log('📑 Documentos obrigatórios configurados:', documentosObrigatorios);
    console.log('📄 Documentos existentes:', documentosExistentes);

    const resultado: {
      documentos_pendentes: string[];
      documentos_vencidos: string[];
      documentos_ok: string[];
    } = {
      documentos_pendentes: [],
      documentos_vencidos: [],
      documentos_ok: []
    };

    documentosObrigatorios.forEach(docConfig => {
      const docExistente = documentosExistentes.find(
        doc => doc.tipo_documento === docConfig.tipo && doc.status === 'ativo'
      );

      if (!docExistente) {
        resultado.documentos_pendentes.push(docConfig.nome);
      } else if (docConfig.vencimento && docExistente.data_vencimento) {
        const dataVencimento = new Date(docExistente.data_vencimento);
        const hoje = new Date();
        
        if (dataVencimento < hoje) {
          resultado.documentos_vencidos.push(docConfig.nome);
        } else {
          resultado.documentos_ok.push(docConfig.nome);
        }
      } else {
        resultado.documentos_ok.push(docConfig.nome);
      }
    });

    return resultado;
  }
};

// === SERVIÇO DE ADVERTÊNCIAS ===
export const advertenciaService = {
  // Criar advertência
  async criarAdvertencia(advertencia: Omit<Advertencia, 'id'>): Promise<Advertencia> {
    const { data, error } = await supabase
      .from('colaboradores_advertencias')
      .insert(advertencia)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload de documento de advertência
  async uploadDocumentoAdvertencia(
    file: File,
    advertenciaId: string,
    colaboradorId: string,
    unidadeNome: string,
    nomeColaborador: string
  ): Promise<string> {
    const timestamp = Date.now();
    const extensao = file.name.split('.').pop();
    const nomeArquivo = `advertencia_${advertenciaId}_${timestamp}.${extensao}`;
    
    const unidadeLimpa = unidadeNome.replace(/[^a-zA-Z0-9]/g, '_');
    const nomeLimpo = nomeColaborador.replace(/[^a-zA-Z0-9]/g, '_');
    const caminhoArquivo = `${unidadeLimpa}/CLT/${nomeLimpo}/advertencias/${nomeArquivo}`;

    const { data, error } = await supabase.storage
      .from('rh-documentos')
      .upload(caminhoArquivo, file);

    if (error) throw error;

    // Atualizar advertência com o caminho do documento
    const { error: updateError } = await supabase
      .from('colaboradores_advertencias')
      .update({ documento_path: caminhoArquivo })
      .eq('id', advertenciaId);

    if (updateError) throw updateError;

    return caminhoArquivo;
  },

  // Listar advertências de um colaborador
  async listarAdvertencias(colaboradorId: string): Promise<Advertencia[]> {
    console.log('⚠️ Buscando advertências para colaborador:', colaboradorId);
    
    const { data, error } = await supabase
      .from('colaboradores_advertencias')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .order('data_aplicacao', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar advertências:', error);
      throw error;
    }
    
    console.log('⚠️ Advertências encontradas:', data?.length || 0, data);
    return data || [];
  },

  // Atualizar status da advertência
  async atualizarStatus(
    id: string,
    status: 'ativa' | 'revogada' | 'cumprida',
    observacoes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('colaboradores_advertencias')
      .update({ status, observacoes })
      .eq('id', id);

    if (error) throw error;
  }
};

// === SERVIÇO DE CONTRATOS ===
export const contratoService = {
  // Upload de contrato assinado
  async uploadContratoAssinado(
    file: File,
    colaboradorId: string,
    tipoContrato: string,
    unidadeNome: string,
    tipoColaborador: 'clt' | 'pj',
    nomeColaborador: string,
    dataVencimento?: string
  ): Promise<DocumentoColaborador> {
    return documentoService.uploadDocumento(
      file,
      colaboradorId,
      `contrato_${tipoContrato}`,
      'contrato',
      unidadeNome,
      tipoColaborador,
      nomeColaborador,
      dataVencimento,
      `Contrato ${tipoContrato} assinado`
    );
  },

  // Listar contratos de um colaborador
  async listarContratos(colaboradorId: string): Promise<DocumentoColaborador[]> {
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .eq('categoria', 'contrato')
      .neq('status', 'excluido')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

export { documentoService as default };
