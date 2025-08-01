// Serviço para Módulo Terapêutico Avançado
// Data: 24/07/2025

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Sala {
  id: string
  nome: string
  unidade_id: string
  cor: string
  capacidade_criancas: number
  capacidade_profissionais: number
  especialidades: string[]
  ativo: boolean
  profissionais_salas?: ProfissionalSala[]
}

export interface ProfissionalSala {
  id: string
  profissional_id: string
  sala_id: string
  turno: 'manha' | 'tarde' | 'noite'
  data_inicio: string
  data_fim?: string
  ativo: boolean
  profissional: {
    nome: string
    especialidade: {
      nome: string
      cor: string
    }
  }
}

export interface AtendimentoReal {
  id: string
  agendamento_id: string
  profissional_id: string
  sala_id: string
  paciente_id: string
  especialidade_id: string
  horario_inicio: string
  horario_fim: string
  duracao_minutos: number
  periodo_1_inicio?: string
  periodo_1_fim?: string
  periodo_2_inicio?: string
  periodo_2_fim?: string
  valor_sessao: number
  percentual_pagamento: number
  evolucao_feita: boolean
  pagamento_liberado: boolean
  supervisionado: boolean
  supervisionado_por?: string
  data_supervisao?: string
  observacoes?: string
}

export interface OcorrenciaRecepcao {
  id: string
  agendamento_id: string
  paciente_id: string
  tipo_ocorrencia: 'atraso' | 'falha_convenio' | 'ausencia_guia' | 'falta'
  descricao: string
  minutos_atraso?: number
  desconto_aplicado?: number
  valor_desconto?: number
  responsavel_registro: string
  data_ocorrencia: string
  resolvido: boolean
  observacoes?: string
}

export interface AlertaOcupacao {
  id: string
  sala_id: string
  data_alerta: string
  turno: string
  ocupacao_criancas: number
  ocupacao_profissionais: number
  percentual_ocupacao: number
  alerta_enviado: boolean
  destinatarios: string[]
  data_envio?: string
}

class ModuloTerapeuticoService {
  private supabase = createClientComponentClient()

  // 1. GESTÃO DE SALAS

  async buscarSalas(unidadeId?: string) {
    let query = this.supabase
      .from('salas')
      .select(`
        *,
        especialidades(nome, cor),
        profissionais_salas(
          *,
          profissionais(
            nome,
            especialidades(nome, cor)
          )
        )
      `)
      .eq('ativo', true)

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId)
    }

    return await query
  }

  async atualizarSala(salaId: string, dados: Partial<Sala>) {
    return await this.supabase
      .from('salas')
      .update({
        ...dados,
        updated_at: new Date().toISOString()
      })
      .eq('id', salaId)
  }

  async alocarProfissionalNaSala(dados: {
    profissional_id: string
    sala_id: string
    turno: string
    data_inicio: string
    data_fim?: string
  }) {
    // Verificar se não excede capacidade da sala
    const { data: ocupacao } = await this.verificarOcupacaoSala(dados.sala_id, dados.turno)
    
    if (ocupacao && ocupacao.profissionais_alocados >= ocupacao.capacidade_profissionais) {
      throw new Error('Capacidade máxima de profissionais atingida para esta sala')
    }

    return await this.supabase
      .from('profissionais_salas')
      .insert(dados)
  }

  async removerProfissionalDaSala(profissionalSalaId: string) {
    return await this.supabase
      .from('profissionais_salas')
      .update({
        ativo: false,
        data_fim: new Date().toISOString()
      })
      .eq('id', profissionalSalaId)
  }

  // 2. AGENDA TERAPÊUTICA AVANÇADA

  async buscarAgendaDia(data: string, unidadeId?: string) {
    let query = this.supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes(nome, data_nascimento),
        profissionais(nome, especialidades(nome, cor)),
        salas(nome, cor, especialidades),
        atendimentos_reais(
          horario_inicio,
          horario_fim,
          duracao_minutos,
          evolucao_feita,
          supervisionado
        )
      `)
      .eq('data_agendamento', data)

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId)
    }

    return await query.order('horario_inicio')
  }

  async buscarOcupacaoSalasPorHorario(data: string, hora: number) {
    return await this.supabase
      .from('vw_ocupacao_salas')
      .select('*')
      .eq('data', data)
      .eq('hora', hora)
  }

  // 3. REGISTRO DE ATENDIMENTO REAL

  async registrarAtendimentoReal(dados: Omit<AtendimentoReal, 'id'>) {
    return await this.supabase
      .from('atendimentos_reais')
      .insert(dados)
  }

  async atualizarAtendimentoReal(atendimentoId: string, dados: Partial<AtendimentoReal>) {
    return await this.supabase
      .from('atendimentos_reais')
      .update({
        ...dados,
        updated_at: new Date().toISOString()
      })
      .eq('id', atendimentoId)
  }

  async registrarSessaoDividida(atendimentoId: string, periodos: {
    periodo_1_inicio: string
    periodo_1_fim: string
    periodo_2_inicio: string
    periodo_2_fim: string
  }) {
    return await this.atualizarAtendimentoReal(atendimentoId, periodos)
  }

  // 4. EVOLUÇÕES E PAGAMENTOS

  async criarEvolucao(dados: {
    atendimento_real_id: string
    profissional_id: string
    evolucao: string
    objetivos?: string
    observacoes?: string
    proximo_atendimento?: string
  }) {
    const { error } = await this.supabase
      .from('evolucoes_atendimento')
      .insert(dados)

    if (!error) {
      // Marcar evolução como feita no atendimento
      await this.atualizarAtendimentoReal(dados.atendimento_real_id, {
        evolucao_feita: true,
        percentual_pagamento: 50 // 50% até supervisão
      })
    }

    return { error }
  }

  async supervisionarAtendimento(atendimentoId: string, supervisorId: string, observacoes?: string) {
    return await this.atualizarAtendimentoReal(atendimentoId, {
      supervisionado: true,
      supervisionado_por: supervisorId,
      data_supervisao: new Date().toISOString(),
      percentual_pagamento: 100, // 100% após supervisão
      pagamento_liberado: true,
      observacoes
    })
  }

  async buscarAtendimentosPorSupervisor(profissionalId: string, periodo: { inicio: string, fim: string }) {
    return await this.supabase
      .from('vw_pagamentos_por_evolucao')
      .select('*')
      .eq('profissional_id', profissionalId)
      .gte('horario_inicio', periodo.inicio)
      .lte('horario_inicio', periodo.fim)
      .order('horario_inicio')
  }

  // 5. OCORRÊNCIAS DA RECEPÇÃO

  async registrarOcorrencia(dados: Omit<OcorrenciaRecepcao, 'id'>) {
    const { data, error } = await this.supabase
      .from('ocorrencias_recepcao')
      .insert(dados)
      .select()

    // Se for atraso, calcular desconto automático
    if (!error && dados.tipo_ocorrencia === 'atraso' && dados.minutos_atraso) {
      await this.calcularDescontoAtraso(data[0].id, dados.minutos_atraso)
    }

    return { data, error }
  }

  private async calcularDescontoAtraso(ocorrenciaId: string, minutosAtraso: number) {
    let descontoPercentual = 0
    
    if (minutosAtraso >= 15 && minutosAtraso < 30) {
      descontoPercentual = 25
    } else if (minutosAtraso >= 30) {
      descontoPercentual = 50
    }

    if (descontoPercentual > 0) {
      await this.supabase
        .from('ocorrencias_recepcao')
        .update({
          desconto_aplicado: descontoPercentual
        })
        .eq('id', ocorrenciaId)
    }
  }

  async resolverOcorrencia(ocorrenciaId: string, observacoes?: string) {
    return await this.supabase
      .from('ocorrencias_recepcao')
      .update({
        resolvido: true,
        observacoes,
        updated_at: new Date().toISOString()
      })
      .eq('id', ocorrenciaId)
  }

  // 6. ALERTAS DE OCUPAÇÃO

  async verificarOcupacaoSala(salaId: string, turno: string, data?: string) {
    const dataVerificacao = data || new Date().toISOString().split('T')[0]
    
    return await this.supabase
      .from('vw_ocupacao_salas')
      .select('*')
      .eq('sala_id', salaId)
      .eq('data', dataVerificacao)
      .single()
  }

  async gerarAlertaOcupacao(salaId: string, data: string, turno: string) {
    const ocupacao = await this.verificarOcupacaoSala(salaId, turno, data)
    
    if (ocupacao.data && ocupacao.data.percentual_ocupacao_criancas >= 80) {
      const alerta = {
        sala_id: salaId,
        data_alerta: data,
        turno,
        ocupacao_criancas: ocupacao.data.criancas_agendadas,
        ocupacao_profissionais: ocupacao.data.profissionais_alocados,
        percentual_ocupacao: ocupacao.data.percentual_ocupacao_criancas,
        destinatarios: ['rh@foncare.com', 'admin@foncare.com'] // Configurável
      }

      return await this.supabase
        .from('alertas_ocupacao')
        .insert(alerta)
    }
  }

  // 7. RELATÓRIOS

  async exportarRelatorioTerapeuta(
    terapeutaId: string, 
    periodo: { inicio: string, fim: string },
    formato: 'json' | 'xlsx' = 'json'
  ) {
    const { data } = await this.supabase
      .from('vw_pagamentos_por_evolucao')
      .select('*')
      .eq('profissional_id', terapeutaId)
      .gte('horario_inicio', periodo.inicio)
      .lte('horario_inicio', periodo.fim)
      .order('horario_inicio')

    if (formato === 'xlsx') {
      return this.gerarExcelRelatorio(data || [])
    }

    return data || []
  }

  private async gerarExcelRelatorio(dados: Record<string, unknown>[]) {
    // Implementação para gerar Excel será feita no componente frontend
    // usando uma biblioteca como xlsx
    return dados
  }

  async gerarRelatorioGerencial(periodo: { inicio: string; fim: string }, filtros: Record<string, unknown> = {}) {
    // Consultar dados agregados para o relatório
    const atendimentosPorEspecialidade = await this.supabase
      .from('vw_pagamentos_por_evolucao')
      .select('especialidade_nome, valor_sessao')
      .gte('horario_inicio', periodo.inicio)
      .lte('horario_inicio', periodo.fim)

    const atendimentosPorProfissional = await this.supabase
      .from('vw_pagamentos_por_evolucao')
      .select('profissional_nome, valor_sessao, valor_a_pagar')
      .gte('horario_inicio', periodo.inicio)
      .lte('horario_inicio', periodo.fim)

    const ocupacaoSalas = await this.supabase
      .from('vw_ocupacao_salas')
      .select('*')
      .gte('data', periodo.inicio)
      .lte('data', periodo.fim)

    return this.processarDadosRelatorio({
      atendimentos_especialidade: atendimentosPorEspecialidade.data || [],
      atendimentos_profissional: atendimentosPorProfissional.data || [],
      ocupacao_salas: ocupacaoSalas.data || []
    })
  }

  async exportarRelatorioCompleto(periodo: { inicio: string; fim: string }, filtros: Record<string, unknown> = {}, formato: 'pdf' | 'xlsx' | 'csv' = 'xlsx') {
    const dados = await this.gerarRelatorioGerencial(periodo, filtros)
    
    return {
      formato,
      dados,
      nome_arquivo: `relatorio_terapeutico_${periodo.inicio}_${periodo.fim}.${formato}`
    }
  }

  private processarDadosRelatorio(dados: Record<string, unknown>) {
    // Processar dados para o formato do relatório
    const especialidades = new Map()
    const profissionais = new Map()
    
    // Agrupar por especialidade
    (dados.atendimentos_especialidade as Record<string, unknown>[])?.forEach((item: Record<string, unknown>) => {
      const key = item.especialidade_nome as string
      if (!especialidades.has(key)) {
        especialidades.set(key, { especialidade: key, total: 0, valor: 0 })
      }
      const grupo = especialidades.get(key)
      grupo.total += 1
      grupo.valor += (item.valor_sessao as number) || 0
    })

    // Agrupar por profissional
    (dados.atendimentos_profissional as Record<string, unknown>[])?.forEach((item: Record<string, unknown>) => {
      const key = item.profissional_nome as string
      if (!profissionais.has(key)) {
        profissionais.set(key, { 
          profissional: key, 
          total: 0, 
          valor_bruto: 0, 
          valor_liquido: 0 
        })
      }
      const grupo = profissionais.get(key)
      grupo.total += 1
      grupo.valor_bruto += item.valor_sessao || 0
      grupo.valor_liquido += item.valor_a_pagar || 0
    })

    return {
      atendimentos_por_especialidade: Array.from(especialidades.values()),
      atendimentos_por_profissional: Array.from(profissionais.values()),
      ocupacao_salas: dados.ocupacao_salas || [],
      evolucao_temporal: [],
      indicadores_supervisao: {
        total_atendimentos: dados.atendimentos_profissional?.length || 0,
        supervisionados: 0,
        pendentes: 0,
        taxa_aprovacao: 0
      },
      indicadores_financeiros: {
        faturamento_bruto: 0,
        valor_profissionais: 0,
        margem_clinica: 0
      },
      indicadores_operacionais: {
        taxa_presenca: 0,
        tempo_medio_atendimento: 0,
        atendimentos_por_dia: 0
      }
    }
  }

  async buscarEstatisticasTempo(especialidadeId?: string, salaId?: string, periodo?: { inicio: string, fim: string }) {
    let query = this.supabase
      .from('atendimentos_reais')
      .select(`
        duracao_minutos,
        especialidades(nome),
        salas(nome),
        horario_inicio
      `)

    if (especialidadeId) query = query.eq('especialidade_id', especialidadeId)
    if (salaId) query = query.eq('sala_id', salaId)
    if (periodo) {
      query = query.gte('horario_inicio', periodo.inicio).lte('horario_inicio', periodo.fim)
    }

    return await query
  }

  // 8. DASHBOARD DE CONTROLE

  async buscarDashboardTerapeutico(unidadeId?: string) {
    const hoje = new Date().toISOString().split('T')[0]
    
    // Buscar métricas principais
    const [
      atendimentosHoje,
      evolucoesPendentes,
      alertasOcupacao,
      pagamentosLiberados
    ] = await Promise.all([
      this.buscarAgendaDia(hoje, unidadeId),
      this.buscarEvolucoesPendentes(unidadeId),
      this.buscarAlertasAtivos(unidadeId),
      this.buscarPagamentosLiberados(hoje, unidadeId)
    ])

    return {
      atendimentos_hoje: atendimentosHoje.data?.length || 0,
      evolucoes_pendentes: evolucoesPendentes.data?.length || 0,
      alertas_ocupacao: alertasOcupacao.data?.length || 0,
      pagamentos_liberados: pagamentosLiberados.data?.reduce((sum, p) => sum + (p.valor_a_pagar || 0), 0) || 0
    }
  }

  private async buscarEvolucoesPendentes(unidadeId?: string) {
    const query = this.supabase
      .from('atendimentos_reais')
      .select('id')
      .eq('evolucao_feita', false)
      .gte('horario_inicio', new Date().toISOString().split('T')[0])

    return await query
  }

  private async buscarAlertasAtivos(unidadeId?: string) {
    return await this.supabase
      .from('alertas_ocupacao')
      .select('*')
      .eq('alerta_enviado', false)
      .gte('data_alerta', new Date().toISOString().split('T')[0])
  }

  private async buscarPagamentosLiberados(data: string, unidadeId?: string) {
    return await this.supabase
      .from('vw_pagamentos_por_evolucao')
      .select('valor_a_pagar')
      .eq('pagamento_liberado', true)
      .gte('horario_inicio', data)
      .lt('horario_inicio', new Date(new Date(data).getTime() + 24 * 60 * 60 * 1000).toISOString())
  }
}

export const moduloTerapeuticoService = new ModuloTerapeuticoService()
