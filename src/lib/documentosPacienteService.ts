import { supabase } from './supabaseClient';

// Tipos de documentos permitidos
export const TIPOS_DOCUMENTOS_PACIENTE = {
  rg: {
    nome: 'RG (Registro Geral)',
    descricao: 'Documento de identidade do paciente',
    obrigatorio: true,
    vencimento: false,
    icone: '🆔'
  },
  carteirinha_convenio: {
    nome: 'Carteirinha do Convênio',
    descricao: 'Carteirinha do plano de saúde',
    obrigatorio: true,
    vencimento: true,
    icone: '💳'
  },
  pedido_medico: {
    nome: 'Pedido Médico Atualizado',
    descricao: 'Prescrição médica ou pedido de exames',
    obrigatorio: true,
    vencimento: false,
    icone: '📋'
  },
  comprovante_endereco: {
    nome: 'Comprovante de Endereço',
    descricao: 'Comprovante de residência atual',
    obrigatorio: true,
    vencimento: false,
    icone: '🏠'
  }
} as const;

export type TipoDocumentoPaciente = keyof typeof TIPOS_DOCUMENTOS_PACIENTE;

export interface DocumentoPaciente {
  id: string;
  paciente_id: string;
  tipo_documento: TipoDocumentoPaciente;
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_arquivo: number;
  tipo_mime: string; // Usando nome real da coluna
  data_vencimento?: string;
  observacoes?: string;
  ativo: boolean; // Usando nome real da coluna
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface StatusDocumentosPaciente {
  documentos_pendentes: string[];
  documentos_vencidos: string[];
  documentos_ok: string[];
  porcentagem_completa: number;
}

class DocumentosPacienteService {
  private readonly bucketName = 'pacientes-documentos';

  // Gerar caminho do arquivo
  private async gerarCaminhoArquivo(
    pacienteId: string,
    pacienteNome: string,
    tipoDocumento: TipoDocumentoPaciente,
    nomeArquivo: string
  ): Promise<string> {
    // Buscar informações da unidade do paciente
    const { data: pacienteData, error } = await supabase
      .from('pacientes')
      .select(`
        unidade_id,
        unidades(nome)
      `)
      .eq('id', pacienteId)
      .single();

    let unidadeNome = 'sem-unidade';
    
    if (!error && pacienteData) {
      // Verificar se tem unidade associada
      if (pacienteData.unidades && (pacienteData.unidades as any).nome) {
        unidadeNome = (pacienteData.unidades as any).nome;
      } else if (pacienteData.unidade_id) {
        // Se tem unidade_id mas não carregou os dados, usar o ID
        unidadeNome = `unidade-${pacienteData.unidade_id.substring(0, 8)}`;
      }
    } else {
      console.warn('Não foi possível buscar unidade do paciente, usando estrutura padrão');
    }

    // Limpar nomes para uso em caminhos de arquivo
    const unidadeClean = unidadeNome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 40);
    const pacienteClean = pacienteNome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
    
    const timestamp = Date.now();
    const extensao = nomeArquivo.split('.').pop();
    const tipoConfig = TIPOS_DOCUMENTOS_PACIENTE[tipoDocumento];
    const tipoNome = tipoConfig.nome.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    
    return `${unidadeClean}/${pacienteClean}/${tipoNome}_${timestamp}.${extensao}`;
  }

  // Upload de documento
  async uploadDocumento(
    file: File,
    pacienteId: string,
    pacienteNome: string,
    tipoDocumento: TipoDocumentoPaciente,
    dataVencimento?: string,
    observacoes?: string
  ): Promise<DocumentoPaciente> {
    try {
      // Validar arquivo
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Máximo permitido: 50MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use: JPG, PNG, PDF, HEIC');
      }

      // Gerar caminho único
      const caminhoArquivo = await this.gerarCaminhoArquivo(
        pacienteId,
        pacienteNome,
        tipoDocumento,
        file.name
      );

      console.log('📤 Fazendo upload do arquivo:', {
        arquivo: file.name,
        tipo: tipoDocumento,
        caminho: caminhoArquivo,
        tamanho: file.size
      });

      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(caminhoArquivo, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Salvar registro no banco - usando as colunas que realmente existem
      const documento: any = {
        paciente_id: pacienteId,
        tipo_documento: tipoDocumento,
        nome_arquivo: file.name,
        caminho_arquivo: caminhoArquivo,
        tamanho_arquivo: file.size,
        tipo_mime: file.type, // Usando 'tipo_mime' que existe na tabela
        data_vencimento: dataVencimento,
        observacoes: observacoes,
        ativo: true // Usando 'ativo' em vez de 'status'
      };

      const { data, error } = await supabase
        .from('pacientes_documentos')
        .insert(documento)
        .select()
        .single();

      if (error) {
        // Se falhou no banco, tentar remover arquivo do storage
        await supabase.storage
          .from(this.bucketName)
          .remove([caminhoArquivo]);
        throw error;
      }

      console.log('✅ Documento salvo com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no upload do documento:', error);
      throw error;
    }
  }

  // Listar documentos de um paciente
  async listarDocumentos(pacienteId: string): Promise<DocumentoPaciente[]> {
    console.log('📋 Buscando documentos do paciente:', pacienteId);
    
    const { data, error } = await supabase
      .from('pacientes_documentos')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('ativo', true) // Usando coluna 'ativo' em vez de 'status'
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar documentos:', error);
      throw error;
    }

    console.log('📄 Documentos encontrados:', data?.length || 0);
    return data || [];
  }

  // Obter URL para visualizar documento
  async obterUrlDocumento(caminhoArquivo: string): Promise<string> {
    const { data } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(caminhoArquivo, 3600); // URL válida por 1 hora

    if (!data?.signedUrl) {
      throw new Error('Erro ao gerar URL do documento');
    }

    return data.signedUrl;
  }

  // Excluir documento
  async excluirDocumento(documentoId: string): Promise<void> {
    try {
      // Buscar o documento
      const { data: documento, error: fetchError } = await supabase
        .from('pacientes_documentos')
        .select('*')
        .eq('id', documentoId)
        .single();

      if (fetchError) throw fetchError;
      if (!documento) throw new Error('Documento não encontrado');

      // Marcar como excluído no banco (soft delete)
      const { error: updateError } = await supabase
        .from('pacientes_documentos')
        .update({ ativo: false }) // Usando coluna 'ativo' em vez de 'status'
        .eq('id', documentoId);

      if (updateError) throw updateError;

      // Remover arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from(this.bucketName)
        .remove([documento.caminho_arquivo]);

      if (deleteError) {
        console.warn('Aviso: Erro ao remover arquivo do storage:', deleteError);
      }

      console.log('🗑️ Documento excluído com sucesso:', documentoId);
    } catch (error) {
      console.error('❌ Erro ao excluir documento:', error);
      throw error;
    }
  }

  // Verificar status dos documentos obrigatórios
  async verificarStatusDocumentos(pacienteId: string): Promise<StatusDocumentosPaciente> {
    console.log('🔍 Verificando status dos documentos do paciente:', pacienteId);

    const documentosExistentes = await this.listarDocumentos(pacienteId);
    const tiposObrigatorios = Object.keys(TIPOS_DOCUMENTOS_PACIENTE) as TipoDocumentoPaciente[];

    const resultado: StatusDocumentosPaciente = {
      documentos_pendentes: [],
      documentos_vencidos: [],
      documentos_ok: [],
      porcentagem_completa: 0
    };

    const hoje = new Date();

    tiposObrigatorios.forEach(tipo => {
      const config = TIPOS_DOCUMENTOS_PACIENTE[tipo];
      const docExistente = documentosExistentes.find(
        doc => doc.tipo_documento === tipo && doc.ativo === true
      );

      if (!docExistente) {
        resultado.documentos_pendentes.push(config.nome);
      } else if (config.vencimento && docExistente.data_vencimento) {
        const dataVencimento = new Date(docExistente.data_vencimento);
        if (dataVencimento < hoje) {
          resultado.documentos_vencidos.push(config.nome);
        } else {
          resultado.documentos_ok.push(config.nome);
        }
      } else {
        resultado.documentos_ok.push(config.nome);
      }
    });

    const totalObrigatorios = tiposObrigatorios.length;
    const totalOk = resultado.documentos_ok.length;
    resultado.porcentagem_completa = Math.round((totalOk / totalObrigatorios) * 100);

    console.log('📊 Status dos documentos:', resultado);
    return resultado;
  }

  // Atualizar documento
  async atualizarDocumento(
    documentoId: string,
    dados: Partial<Pick<DocumentoPaciente, 'data_vencimento' | 'observacoes'>>
  ): Promise<DocumentoPaciente> {
    const { data, error } = await supabase
      .from('pacientes_documentos')
      .update(dados)
      .eq('id', documentoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Substituir documento (fazer upload de uma nova versão)
  async substituirDocumento(
    documentoId: string,
    novoFile: File,
    pacienteNome: string,
    dataVencimento?: string,
    observacoes?: string
  ): Promise<DocumentoPaciente> {
    try {
      // Buscar documento existente
      const { data: documentoAntigo, error: fetchError } = await supabase
        .from('pacientes_documentos')
        .select('*')
        .eq('id', documentoId)
        .single();

      if (fetchError) throw fetchError;
      if (!documentoAntigo) throw new Error('Documento não encontrado');

      // Fazer upload do novo arquivo
      const novoDocumento = await this.uploadDocumento(
        novoFile,
        documentoAntigo.paciente_id,
        pacienteNome,
        documentoAntigo.tipo_documento,
        dataVencimento,
        observacoes
      );

      // Marcar documento antigo como inativo
      await supabase
        .from('pacientes_documentos')
        .update({ ativo: false }) // Usando coluna 'ativo' em vez de 'status'
        .eq('id', documentoId);

      // Remover arquivo antigo do storage
      await supabase.storage
        .from(this.bucketName)
        .remove([documentoAntigo.caminho_arquivo]);

      return novoDocumento;
    } catch (error) {
      console.error('❌ Erro ao substituir documento:', error);
      throw error;
    }
  }
}

export const documentosPacienteService = new DocumentosPacienteService();
export default documentosPacienteService;
