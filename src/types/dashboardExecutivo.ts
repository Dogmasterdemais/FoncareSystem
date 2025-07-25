// ===== INTERFACES PARA DASHBOARD EXECUTIVO =====

export interface PacienteLocalizacao {
  id: string;
  nome: string;
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  lat?: number;
  lng?: number;
  unidade_id: string;
  unidade_nome: string;
}

export interface MapaCalorDados {
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  quantidade_pacientes: number;
  lat: number;
  lng: number;
  unidades: {
    id: string;
    nome: string;
    quantidade: number;
  }[];
}

export interface AtendimentoPorEspecialidade {
  especialidade: string;
  quantidade_atendimentos: number;
  quantidade_pacientes_unicos: number;
  valor_total: number;
  unidade_id: string;
  unidade_nome: string;
  mes: number;
  ano: number;
}

export interface GuiasPorConvenio {
  convenio_id: string;
  convenio_nome: string;
  quantidade_guias: number;
  valor_total: number;
  valor_aprovado: number;
  valor_rejeitado: number;
  unidade_id: string;
  unidade_nome: string;
  mes: number;
  ano: number;
}

export interface ResumoProfissionais {
  especialidade: string;
  unidade_id: string;
  unidade_nome: string;
  total_profissionais: number;
  profissionais_ativos: number;
  profissionais_clt: number;
  profissionais_pj: number;
  mes: number;
  ano: number;
}

export interface DashboardExecutivo {
  periodo: {
    mes: number;
    ano: number;
  };
  mapa_calor: MapaCalorDados[];
  atendimentos_especialidade: AtendimentoPorEspecialidade[];
  guias_convenio: GuiasPorConvenio[];
  resumo_profissionais: ResumoProfissionais[];
  kpis: {
    total_pacientes_ativos: number;
    total_atendimentos_mes: number;
    receita_total_mes: number;
    media_atendimentos_dia: number;
    taxa_ocupacao_salas: number;
  };
}

export interface FiltrosDashboard {
  ano?: number;
  mes?: number;
  unidade_id?: string;
  convenio_id?: string;
  especialidade?: string;
}

export interface RelatorioExcel {
  nome_arquivo: string;
  dados: Record<string, unknown>[];
  colunas: {
    header: string;
    key: string;
    width?: number;
  }[];
}
