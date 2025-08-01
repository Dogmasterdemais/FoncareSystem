// ===== INTERFACES PARA SISTEMA DE ATENDIMENTOS E PAGAMENTOS PJ =====

export interface Sala {
  id?: string;
  unidade_id: string;
  numero: string;
  nome: string;
  tipo_sala: 'atendimento' | 'avaliacao' | 'grupo';
  capacidade_profissionais?: number;
  ativa?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SalaProfissional {
  id?: string;
  sala_id: string;
  colaborador_id: string;
  data_inicio: string;
  data_fim?: string;
  valor_hora: number;
  valor_evolucao: number;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relacionamentos
  sala?: Sala;
  colaborador?: {
    id: string;
    nome_completo: string;
    cargo: string;
  };
}

export interface Atendimento {
  id?: string;
  paciente_id: string;
  sala_id: string;
  profissional_principal_id: string;
  profissional_auxiliar_id?: string;
  data_atendimento: string;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos?: number;
  tipo_atendimento: 'individual' | 'dupla' | 'grupo';
  observacoes?: string;
  status?: 'agendado' | 'realizado' | 'cancelado' | 'falta';
  created_at?: string;
  updated_at?: string;
  
  // Relacionamentos
  sala?: Sala;
  profissional_principal?: {
    id: string;
    nome_completo: string;
  };
  profissional_auxiliar?: {
    id: string;
    nome_completo: string;
  };
  evolucoes?: Evolucao[];
}

export interface Evolucao {
  id?: string;
  atendimento_id: string;
  profissional_id: string;
  evolucao: string;
  objetivos_proxima_sessao?: string;
  data_evolucao?: string;
  prazo_vencimento?: string;
  status?: 'no_prazo' | 'atrasada' | 'vencida';
  created_at?: string;
  updated_at?: string;
  
  // Relacionamentos
  atendimento?: Atendimento;
  profissional?: {
    id: string;
    nome_completo: string;
  };
}

export interface FechamentoMensalPJ {
  id?: string;
  colaborador_id: string;
  ano: number;
  mes: number;
  total_atendimentos?: number;
  total_horas?: number;
  total_evolucoes?: number;
  valor_horas?: number;
  valor_evolucoes?: number;
  valor_total?: number;
  atendimentos_sem_evolucao?: number;
  evolucoes_atrasadas?: number;
  data_fechamento: string;
  status?: 'aberto' | 'fechado' | 'pago';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relacionamentos
  colaborador?: {
    id: string;
    nome_completo: string;
    cargo: string;
  };
  detalhes?: FechamentoDetalhe[];
}

export interface FechamentoDetalhe {
  id?: string;
  fechamento_id: string;
  atendimento_id: string;
  evolucao_id?: string;
  valor_hora: number;
  valor_evolucao?: number;
  minutos_atendimento: number;
  tem_evolucao?: boolean;
  evolucao_no_prazo?: boolean;
  valor_total_item: number;
  observacoes?: string;
  created_at?: string;
  
  // Relacionamentos
  atendimento?: Atendimento;
  evolucao?: Evolucao;
}

// ===== INTERFACES PARA RELATÓRIOS E DASHBOARDS =====

export interface RelatorioPagamentoPJ {
  colaborador_id: string;
  nome_colaborador: string;
  periodo: {
    ano: number;
    mes: number;
  };
  resumo: {
    total_atendimentos: number;
    total_horas: number;
    total_evolucoes: number;
    valor_total: number;
  };
  detalhes: {
    atendimento_id: string;
    data: string;
    paciente: string;
    duracao_minutos: number;
    valor_hora: number;
    tem_evolucao: boolean;
    valor_evolucao: number;
    valor_total: number;
  }[];
  indicadores: {
    taxa_evolucao: number; // % de atendimentos com evolução
    taxa_pontualidade: number; // % de evoluções no prazo
    atendimentos_pendentes: number;
  };
}

export interface DashboardPJ {
  periodo: {
    ano: number;
    mes: number;
  };
  resumo_geral: {
    total_profissionais_pj: number;
    total_atendimentos: number;
    total_evolucoes: number;
    valor_total_folha: number;
  };
  por_profissional: {
    colaborador_id: string;
    nome: string;
    atendimentos: number;
    evolucoes: number;
    valor_total: number;
    status_fechamento: 'aberto' | 'fechado' | 'pago';
  }[];
  alertas: {
    evolucoes_vencendo: number;
    evolucoes_vencidas: number;
    fechamentos_pendentes: number;
  };
}

// ===== TIPOS PARA FILTROS E CONSULTAS =====

export interface FiltroAtendimentos {
  data_inicio?: string;
  data_fim?: string;
  profissional_id?: string;
  sala_id?: string;
  status?: 'agendado' | 'realizado' | 'cancelado' | 'falta';
  tem_evolucao?: boolean;
}

export interface FiltroEvolucoes {
  data_inicio?: string;
  data_fim?: string;
  profissional_id?: string;
  status?: 'no_prazo' | 'atrasada' | 'vencida';
  pendentes_apenas?: boolean;
}

export interface FiltroFechamentos {
  ano?: number;
  mes?: number;
  colaborador_id?: string;
  status?: 'aberto' | 'fechado' | 'pago';
}
