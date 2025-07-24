import { supabase } from './supabaseClient';

// === INTERFACES BASEADAS NO SCHEMA REAL ===
export interface Unidade {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
}

export interface StatsRH {
  totalColaboradores: number;
  colaboradoresAtivos: number;
  colaboradoresCLT: number;
  colaboradoresPJ: number;
  folhaMesAtual: number;
}

export interface Colaborador {
  id?: string;
  
  // Dados Pessoais
  nome_completo: string;
  data_nascimento: string;
  genero?: 'masculino' | 'feminino' | 'outro';
  estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  nacionalidade?: string;
  naturalidade_cidade?: string;
  naturalidade_estado?: string;
  nome_mae: string;
  nome_pai?: string;
  
  // Documentos
  cpf: string;
  rg: string;
  rg_orgao_emissor?: string;
  rg_uf?: string;
  titulo_eleitor?: string;
  titulo_zona?: string;
  titulo_secao?: string;
  cnh?: string;
  cnh_categoria?: string;
  cnh_vencimento?: string;
  
  // Endereço
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  
  // Contato
  telefone_celular: string;
  telefone_fixo?: string;
  email_pessoal?: string;
  
  // Dados Bancários
  banco_codigo?: string;
  banco_nome?: string;
  banco_agencia?: string;
  banco_conta?: string;
  banco_tipo_conta?: 'corrente' | 'poupanca';
  banco_cpf_titular?: string;
  
  // Dados Profissionais
  cargo: string;
  departamento?: string;
  unidade_id?: string;
  regime_contratacao: 'clt' | 'pj' | 'autonomo' | 'estagiario';
  jornada_horario_inicio?: string;
  jornada_horario_fim?: string;
  jornada_carga_semanal?: number;
  data_admissao: string;
  data_demissao?: string;
  salario_valor?: number;
  comissao_tipo?: string;
  comissao_percentual?: number;
  
  // Benefícios
  vale_transporte?: boolean;
  vale_alimentacao?: boolean;
  vale_alimentacao_valor?: number;
  plano_saude?: boolean;
  plano_dental?: boolean;
  
  // Status
  status: 'ativo' | 'inativo' | 'afastado' | 'demitido';
  
  // Controle
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ColaboradorDocumentosCLT {
  id?: string;
  colaborador_id: string;
  
  // CTPS
  ctps_numero?: string;
  ctps_serie?: string;
  ctps_uf?: string;
  ctps_data_emissao?: string;
  
  // PIS/NIS/NIT
  pis_nis_nit?: string;
  
  // Certidões (caminhos dos arquivos)
  certidao_nascimento_casamento?: string;
  comprovante_endereco?: string;
  comprovante_escolaridade?: string;
  antecedentes_criminais?: string;
  
  // Saúde Ocupacional
  aso_admissional?: string;
  aso_data_realizacao?: string;
  aso_data_vencimento?: string;
  aso_resultado?: 'apto' | 'inapto' | 'apto_com_restricoes';
  
  // Reservista
  certificado_reservista?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface ColaboradorDocumentosPJ {
  id?: string;
  colaborador_id: string;
  
  // Dados da Empresa
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  
  // Contratos
  contrato_prestacao_servicos?: string;
  data_inicio_contrato?: string;
  data_fim_contrato?: string;
  valor_contrato?: number;
  
  // Certidões
  certidao_negativa_inss?: string;
  certidao_negativa_fgts?: string;
  certidao_negativa_receita?: string;
  comprovante_iss?: string;
  
  // Nota Fiscal
  nfe_configurada?: boolean;
  nfe_ultimo_numero?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface Dependente {
  id?: string;
  colaborador_id: string;
  nome_completo: string;
  grau_parentesco: 'conjuge' | 'filho' | 'enteado' | 'pai' | 'mae' | 'irmao' | 'outro';
  data_nascimento: string;
  cpf?: string;
  
  // Inclusões
  inclusao_irrf?: boolean;
  inclusao_plano_saude?: boolean;
  inclusao_plano_dental?: boolean;
  
  status?: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

export interface PerfilAcesso {
  id?: string;
  colaborador_id: string;
  perfil: 'recepcao' | 'terapeuta' | 'financeiro' | 'rh' | 'gestor' | 'admin';
  unidade_id?: string;
  
  // Permissões específicas
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

export interface FolhaPagamentoCLT {
  id?: string;
  colaborador_id: string;
  
  // Período
  mes_referencia: number;
  ano_referencia: number;
  
  // Vencimentos
  salario_base: number;
  horas_extras?: number;
  valor_horas_extras?: number;
  adicional_noturno?: number;
  comissoes?: number;
  gratificacoes?: number;
  vale_alimentacao?: number;
  vale_transporte?: number;
  outros_vencimentos?: number;
  
  // Descontos
  inss?: number;
  irrf?: number;
  fgts?: number;
  vale_transporte_desconto?: number;
  vale_alimentacao_desconto?: number;
  plano_saude_desconto?: number;
  outros_descontos?: number;
  
  // Totais
  total_vencimentos: number;
  total_descontos: number;
  salario_liquido: number;
  
  // Status
  status?: 'pendente' | 'aprovada' | 'paga';
  data_pagamento?: string;
  
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface FolhaPagamentoPJ {
  id?: string;
  colaborador_id: string;
  
  // Período
  mes_referencia: number;
  ano_referencia: number;
  
  // Valores
  valor_bruto: number;
  quantidade_atendimentos?: number;
  valor_por_atendimento?: number;
  bonus?: number;
  
  // Descontos/Impostos
  iss_percentual?: number;
  iss_valor?: number;
  irrf_percentual?: number;
  irrf_valor?: number;
  outros_descontos?: number;
  
  // Totais
  total_descontos: number;
  valor_liquido: number;
  
  // Nota Fiscal
  nfe_numero?: string;
  nfe_data_emissao?: string;
  nfe_valor?: number;
  
  // Status
  status?: 'pendente' | 'aprovada' | 'paga';
  data_pagamento?: string;
  
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Desconto {
  id?: string;
  colaborador_id: string;
  tipo_desconto: string;
  descricao?: string;
  valor: number;
  tipo_valor: 'fixo' | 'percentual';
  mes_referencia?: number;
  ano_referencia?: number;
  data_inicio?: string;
  data_fim?: string;
  recorrente?: boolean;
  ativo?: boolean;
}

export interface RegistroPonto {
  id?: string;
  colaborador_id: string;
  data_registro: string;
  entrada?: string;
  saida_almoco?: string;
  retorno_almoco?: string;
  saida?: string;
  horas_trabalhadas?: string;
  horas_extras?: string;
  observacoes?: string;
  justificativa?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  aprovado_por?: string;
  data_aprovacao?: string;
  
  // Campos calculados
  nome_completo?: string;
  cargo?: string;
}

export interface BancoHoras {
  id?: string;
  colaborador_id: string;
  mes_referencia: number;
  ano_referencia: number;
  saldo_anterior?: string;
  horas_positivas?: string;
  horas_negativas?: string;
  saldo_atual?: string;
  observacoes?: string;
  
  // Campos calculados
  nome_completo?: string;
  cargo?: string;
}

// === SERVIÇOS DE COLABORADORES ===
export const colaboradorService = {
  // Listar todos os colaboradores
  async listar(filtros?: {
    busca?: string;
    regime?: string;
    status?: string;
    unidade?: string;
  }): Promise<Colaborador[]> {
    let query = supabase
      .from('colaboradores')
      .select('*')
      .order('nome_completo');

    if (filtros?.busca) {
      query = query.or(`nome_completo.ilike.%${filtros.busca}%,cpf.ilike.%${filtros.busca}%,cargo.ilike.%${filtros.busca}%`);
    }

    if (filtros?.regime) {
      query = query.eq('regime_contratacao', filtros.regime);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.unidade) {
      query = query.eq('unidade_id', filtros.unidade);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  },

  // Buscar colaborador por ID
  async buscarPorId(id: string): Promise<Colaborador | null> {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    console.log('Service - Dados carregados do banco:', data);
    console.log('Service - Campos do banco:', data ? Object.keys(data) : 'nenhum');
    
    return data;
  },

  // Criar colaborador
  async criar(colaborador: Omit<Colaborador, 'id'>): Promise<Colaborador> {
    console.log('Service - Dados recebidos para criar:', colaborador);
    console.log('Service - Campos recebidos:', Object.keys(colaborador));
    
    const { data, error } = await supabase
      .from('colaboradores')
      .insert(colaborador)
      .select()
      .single();

    if (error) {
      console.error('Service - Erro do Supabase:', error);
      throw error;
    }
    return data;
  },

  // Atualizar colaborador
  async atualizar(id: string, colaborador: Partial<Colaborador>): Promise<Colaborador> {
    const { data, error } = await supabase
      .from('colaboradores')
      .update({
        ...colaborador,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Excluir colaborador (soft delete)
  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('colaboradores')
      .update({ 
        status: 'inativo',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Calcular estatísticas
  async calcularEstatisticas(): Promise<StatsRH> {
    const { data: colaboradores, error } = await supabase
      .from('colaboradores')
      .select('regime_contratacao, status, salario_valor');

    if (error) throw error;

    const stats = {
      totalColaboradores: colaboradores?.length || 0,
      colaboradoresAtivos: colaboradores?.filter(c => c.status === 'ativo').length || 0,
      colaboradoresCLT: colaboradores?.filter(c => c.regime_contratacao === 'clt').length || 0,
      colaboradoresPJ: colaboradores?.filter(c => c.regime_contratacao === 'pj').length || 0,
      folhaMesAtual: colaboradores
        ?.filter(c => c.status === 'ativo')
        .reduce((acc, c) => acc + (c.salario_valor || 0), 0) || 0
    };

    return stats;
  }
};

// === SERVIÇOS DE DEPENDENTES ===
export const dependenteService = {
  async listarPorColaborador(colaboradorId: string): Promise<Dependente[]> {
    const { data, error } = await supabase
      .from('colaboradores_dependentes')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .order('nome_completo');

    if (error) throw error;
    return data || [];
  },

  async criar(dependente: Omit<Dependente, 'id'>): Promise<Dependente> {
    const { data, error } = await supabase
      .from('colaboradores_dependentes')
      .insert(dependente)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizar(id: string, dependente: Partial<Dependente>): Promise<Dependente> {
    const { data, error } = await supabase
      .from('colaboradores_dependentes')
      .update(dependente)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('colaboradores_dependentes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// === SERVIÇOS DE DOCUMENTOS CLT ===
export const documentosCLTService = {
  async buscarPorColaborador(colaboradorId: string): Promise<ColaboradorDocumentosCLT | null> {
    const { data, error } = await supabase
      .from('colaboradores_documentos_clt')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora erro de "not found"
    return data;
  },

  async criarOuAtualizar(documentos: Omit<ColaboradorDocumentosCLT, 'id'>): Promise<ColaboradorDocumentosCLT> {
    const { data, error } = await supabase
      .from('colaboradores_documentos_clt')
      .upsert(documentos, {
        onConflict: 'colaborador_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// === SERVIÇOS DE DOCUMENTOS PJ ===
export const documentosPJService = {
  async buscarPorColaborador(colaboradorId: string): Promise<ColaboradorDocumentosPJ | null> {
    const { data, error } = await supabase
      .from('colaboradores_documentos_pj')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora erro de "not found"
    return data;
  },

  async criarOuAtualizar(documentos: Omit<ColaboradorDocumentosPJ, 'id'>): Promise<ColaboradorDocumentosPJ> {
    const { data, error } = await supabase
      .from('colaboradores_documentos_pj')
      .upsert(documentos, {
        onConflict: 'colaborador_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// === SERVIÇOS DE DESCONTOS ===
export const descontoService = {
  async listarPorColaborador(colaboradorId: string, mesRef?: number, anoRef?: number): Promise<Desconto[]> {
    let query = supabase
      .from('descontos')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (mesRef && anoRef) {
      query = query.or(`and(mes_referencia.eq.${mesRef},ano_referencia.eq.${anoRef}),recorrente.eq.true`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async criar(desconto: Omit<Desconto, 'id'>): Promise<Desconto> {
    const { data, error } = await supabase
      .from('descontos')
      .insert(desconto)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizar(id: string, desconto: Partial<Desconto>): Promise<Desconto> {
    const { data, error } = await supabase
      .from('descontos')
      .update(desconto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('descontos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;
  }
};

// === SERVIÇOS DE FOLHA DE PAGAMENTO CLT ===
export const folhaCLTService = {
  async listar(mesRef: number, anoRef: number, filtros?: {
    busca?: string;
    status?: string;
  }): Promise<FolhaPagamentoCLT[]> {
    let query = supabase
      .from('folha_pagamento_clt')
      .select(`
        *,
        colaboradores!inner(nome_completo, cpf, cargo)
      `)
      .eq('mes_referencia', mesRef)
      .eq('ano_referencia', anoRef)
      .order('colaboradores.nome_completo');

    if (filtros?.busca) {
      query = query.or(`colaboradores.nome_completo.ilike.%${filtros.busca}%,colaboradores.cpf.ilike.%${filtros.busca}%`);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      nome_completo: item.colaboradores?.nome_completo,
      cpf: item.colaboradores?.cpf,
      cargo: item.colaboradores?.cargo
    }));
  },

  async criarOuAtualizar(folha: Omit<FolhaPagamentoCLT, 'id'>): Promise<FolhaPagamentoCLT> {
    const { data, error } = await supabase
      .from('folha_pagamento_clt')
      .upsert(folha, {
        onConflict: 'colaborador_id,mes_referencia,ano_referencia'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async aprovar(id: string): Promise<void> {
    const { error } = await supabase
      .from('folha_pagamento_clt')
      .update({ 
        status: 'aprovada',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async marcarComoPaga(id: string): Promise<void> {
    const { error } = await supabase
      .from('folha_pagamento_clt')
      .update({ 
        status: 'paga',
        data_pagamento: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }
};

// === SERVIÇOS DE FOLHA DE PAGAMENTO PJ ===
export const folhaPJService = {
  async listar(mesRef: number, anoRef: number, filtros?: {
    busca?: string;
    status?: string;
  }): Promise<FolhaPagamentoPJ[]> {
    let query = supabase
      .from('folha_pagamento_pj')
      .select(`
        *,
        colaboradores!inner(nome_completo, cpf, cargo)
      `)
      .eq('mes_referencia', mesRef)
      .eq('ano_referencia', anoRef)
      .order('colaboradores.nome_completo');

    if (filtros?.busca) {
      query = query.or(`colaboradores.nome_completo.ilike.%${filtros.busca}%,colaboradores.cpf.ilike.%${filtros.busca}%`);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      nome_completo: item.colaboradores?.nome_completo,
      cpf: item.colaboradores?.cpf,
      cargo: item.colaboradores?.cargo
    }));
  },

  async criarOuAtualizar(folha: Omit<FolhaPagamentoPJ, 'id'>): Promise<FolhaPagamentoPJ> {
    const { data, error } = await supabase
      .from('folha_pagamento_pj')
      .upsert(folha, {
        onConflict: 'colaborador_id,mes_referencia,ano_referencia'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async aprovar(id: string): Promise<void> {
    const { error } = await supabase
      .from('folha_pagamento_pj')
      .update({ 
        status: 'aprovada',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async marcarComoPaga(id: string): Promise<void> {
    const { error } = await supabase
      .from('folha_pagamento_pj')
      .update({ 
        status: 'paga',
        data_pagamento: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }
};

// === SERVIÇOS DE REGISTROS DE PONTO ===
export const pontoService = {
  async listar(mesRef: number, anoRef: number, filtros?: {
    busca?: string;
    status?: string;
    colaborador?: string;
  }): Promise<RegistroPonto[]> {
    const dataInicio = new Date(anoRef, mesRef - 1, 1).toISOString().split('T')[0];
    const dataFim = new Date(anoRef, mesRef, 0).toISOString().split('T')[0];

    let query = supabase
      .from('registros_ponto')
      .select(`
        *,
        colaboradores!inner(nome_completo, cargo)
      `)
      .gte('data_registro', dataInicio)
      .lte('data_registro', dataFim)
      .order('data_registro', { ascending: false });

    if (filtros?.busca) {
      query = query.ilike('colaboradores.nome_completo', `%${filtros.busca}%`);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.colaborador) {
      query = query.eq('colaborador_id', filtros.colaborador);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      nome_completo: item.colaboradores?.nome_completo,
      cargo: item.colaboradores?.cargo
    }));
  },

  async criarOuAtualizar(registro: Omit<RegistroPonto, 'id'>): Promise<RegistroPonto> {
    // Calcular horas trabalhadas e extras
    const { horas_trabalhadas, horas_extras } = this.calcularHoras(
      registro.entrada || '',
      registro.saida_almoco || '',
      registro.retorno_almoco || '',
      registro.saida || ''
    );

    const registroCompleto = {
      ...registro,
      horas_trabalhadas,
      horas_extras
    };

    const { data, error } = await supabase
      .from('registros_ponto')
      .upsert(registroCompleto, {
        onConflict: 'colaborador_id,data_registro'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async aprovar(id: string, aprovadoPor: string): Promise<void> {
    const { error } = await supabase
      .from('registros_ponto')
      .update({ 
        status: 'aprovado',
        aprovado_por: aprovadoPor,
        data_aprovacao: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async rejeitar(id: string): Promise<void> {
    const { error } = await supabase
      .from('registros_ponto')
      .update({ status: 'rejeitado' })
      .eq('id', id);

    if (error) throw error;
  },

  calcularHoras(entrada: string, saidaAlmoco: string, retornoAlmoco: string, saida: string) {
    if (!entrada || !saida) {
      return { horas_trabalhadas: '00:00', horas_extras: '00:00' };
    }

    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const entradaMin = parseTime(entrada);
    const saidaMin = parseTime(saida);
    const saidaAlmocoMin = saidaAlmoco ? parseTime(saidaAlmoco) : 0;
    const retornoAlmocoMin = retornoAlmoco ? parseTime(retornoAlmoco) : 0;

    let totalMinutos = saidaMin - entradaMin;

    // Descontar horário de almoço se informado
    if (saidaAlmocoMin && retornoAlmocoMin) {
      totalMinutos -= (retornoAlmocoMin - saidaAlmocoMin);
    }

    const horasTrabalhadas = formatTime(Math.max(0, totalMinutos));
    const horasExtras = totalMinutos > 480 ? formatTime(totalMinutos - 480) : '00:00';

    return { horas_trabalhadas: horasTrabalhadas, horas_extras: horasExtras };
  }
};

// === SERVIÇOS DE BANCO DE HORAS ===
export const bancoHorasService = {
  async listar(mesRef: number, anoRef: number): Promise<BancoHoras[]> {
    const { data, error } = await supabase
      .from('banco_horas')
      .select(`
        *,
        colaboradores!inner(nome_completo, cargo)
      `)
      .eq('mes_referencia', mesRef)
      .eq('ano_referencia', anoRef)
      .order('colaboradores.nome_completo');

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      nome_completo: item.colaboradores?.nome_completo,
      cargo: item.colaboradores?.cargo
    }));
  },

  async criarOuAtualizar(bancoHoras: Omit<BancoHoras, 'id'>): Promise<BancoHoras> {
    const { data, error } = await supabase
      .from('banco_horas')
      .upsert(bancoHoras, {
        onConflict: 'colaborador_id,mes_referencia,ano_referencia'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async calcularSaldoMensal(colaboradorId: string, mesRef: number, anoRef: number): Promise<BancoHoras> {
    // Buscar todos os registros de ponto do mês
    const dataInicio = new Date(anoRef, mesRef - 1, 1).toISOString().split('T')[0];
    const dataFim = new Date(anoRef, mesRef, 0).toISOString().split('T')[0];

    const { data: registros, error } = await supabase
      .from('registros_ponto')
      .select('horas_extras')
      .eq('colaborador_id', colaboradorId)
      .eq('status', 'aprovado')
      .gte('data_registro', dataInicio)
      .lte('data_registro', dataFim);

    if (error) throw error;

    // Calcular saldo do mês anterior
    const mesAnterior = mesRef === 1 ? 12 : mesRef - 1;
    const anoAnterior = mesRef === 1 ? anoRef - 1 : anoRef;

    const { data: saldoAnterior } = await supabase
      .from('banco_horas')
      .select('saldo_atual')
      .eq('colaborador_id', colaboradorId)
      .eq('mes_referencia', mesAnterior)
      .eq('ano_referencia', anoAnterior)
      .single();

    // Somar horas extras do mês
    let totalMinutosExtras = 0;
    registros?.forEach(registro => {
      if (registro.horas_extras) {
        const [horas, minutos] = registro.horas_extras.split(':').map(Number);
        totalMinutosExtras += horas * 60 + minutos;
      }
    });

    const horasPositivas = this.formatarTempo(totalMinutosExtras);
    const saldoAnteriorMinutos = this.parseTime(saldoAnterior?.saldo_atual || '00:00');
    const saldoAtualMinutos = saldoAnteriorMinutos + totalMinutosExtras;
    const saldoAtual = this.formatarTempo(Math.abs(saldoAtualMinutos));

    const bancoHoras: Omit<BancoHoras, 'id'> = {
      colaborador_id: colaboradorId,
      mes_referencia: mesRef,
      ano_referencia: anoRef,
      saldo_anterior: saldoAnterior?.saldo_atual || '00:00',
      horas_positivas: horasPositivas,
      horas_negativas: '00:00',
      saldo_atual: saldoAtualMinutos >= 0 ? saldoAtual : `-${saldoAtual}`
    };

    return this.criarOuAtualizar(bancoHoras);
  },

  parseTime(time: string): number {
    const isNegative = time.startsWith('-');
    const cleanTime = time.replace('-', '');
    const [hours, minutes] = cleanTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return isNegative ? -totalMinutes : totalMinutes;
  },

  formatarTempo(minutes: number): string {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};

// === SERVIÇOS DE UNIDADES ===
export const unidadeService = {
  async listar(): Promise<Array<{id: string, nome: string}>> {
    const { data, error } = await supabase
      .from('unidades')
      .select('id, nome')
      .order('nome');

    if (error) throw error;
    return data || [];
  }
};

// === EXPORTAÇÃO DOS SERVIÇOS ===
export const rhService = {
  colaboradorService,
  documentosCLTService,
  documentosPJService,
  dependenteService,
  descontoService,
  folhaCLTService,
  folhaPJService,
  unidadeService
};

export default rhService;
