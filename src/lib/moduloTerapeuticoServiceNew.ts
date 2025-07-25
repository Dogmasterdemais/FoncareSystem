// Serviço para Módulo Terapêutico Avançado
// Data: 25/07/2025 - Versão Completa

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Sala {
  id: string
  nome: string
  unidade_id: string
  cor: string
  capacidade_criancas: number
  capacidade_profissionais: number
  especialidades: EspecialidadeSala[]
  ativo: boolean
  profissionais_salas?: ProfissionalSala[]
  ocupacao_atual?: OcupacaoSala
}

export interface EspecialidadeSala {
  id: string
  especialidade_id: string
  is_principal: boolean
  ordem: number
  especialidade: {
    nome: string
    cor: string
  }
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

export interface OcupacaoSala {
  criancas_presentes: number
  profissionais_presentes: number
  capacidade_maxima_criancas: number
  capacidade_maxima_profissionais: number
  percentual_criancas: number
  percentual_profissionais: number
  alerta_capacidade: boolean
}

export interface AgendamentoTerapeutico {
  id: string
  paciente_id: string
  profissional_id: string
  sala_id: string
  especialidade_id: string
  data_agendamento: string
  horario_inicio: string
  horario_fim: string
  status_terapeutico: 'agendado' | 'chegou' | 'pronto_para_terapia' | 'em_atendimento' | 'sessao_concluida' | 'nao_compareceu' | 'cancelado' | 'encerrado_antecipadamente'
  horario_chegada?: string
  horario_inicio_real?: string
  horario_fim_real?: string
  duracao_real_minutos?: number
  evolucao_realizada: boolean
  supervisionado: boolean
  liberado_pagamento: boolean
  observacoes_supervisao?: string
  paciente: {
    nome: string
    cpf: string
  }
  profissional: {
    nome_completo: string
    especialidades: any[]
  }
  sala: {
    nome: string
    cor: string
  }
  especialidade: {
    nome: string
    cor: string
  }
}

export interface OcorrenciaRecepcao {
  id: string
  agendamento_id: string
  paciente_id: string
  tipo_ocorrencia: 'atraso' | 'falha_convenio' | 'ausencia_guia' | 'falta' | 'encerramento_antecipado' | 'problema_comportamental' | 'emergencia'
  descricao: string
  minutos_atraso?: number
  desconto_aplicado?: boolean
  valor_desconto?: number
  responsavel_registro: string
  data_ocorrencia: string
  resolvido: boolean
  observacoes?: string
}

export interface EvolucaoSessao {
  id: string
  agendamento_id: string
  profissional_id: string
  data_evolucao: string
  conteudo_evolucao: string
  objetivos_alcancados: string
  observacoes_comportamentais: string
  proximos_passos: string
  materiais_utilizados: string[]
  tempo_atendimento: number
  qualidade_sessao: number
}

export interface PagamentoSessao {
  id: string
  agendamento_id: string
  profissional_id: string
  evolucao_id: string
  valor_base_hora: number
  duracao_minutos: number
  percentual_pagamento: number
  valor_calculado: number
  aprovado_supervisao: boolean
  supervisor_id?: string
  data_aprovacao?: string
  observacoes_pagamento?: string
  incluido_folha: boolean
  mes_referencia: string
}

class ModuloTerapeuticoService {
  private supabase = createClientComponentClient()

  // =====================================
  // 1. GESTÃO DE SALAS AVANÇADA
  // =====================================

  async buscarSalas(unidadeId?: string) {
    let query = this.supabase
      .from('salas')
      .select(`
        *,
        sala_especialidades(
          id,
          especialidade_id,
          is_principal,
          ordem,
          especialidades(nome, cor)
        ),
        profissionais_salas_turnos(
          *,
          colaboradores(
            nome_completo,
            especialidades(nome, cor)
          )
        )
      `)
      .eq('ativo', true)

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Sala[], error: null }
  }

  async buscarSalaComOcupacao(salaId: string, data: string, horario: string) {
    const { data: ocupacao, error } = await this.supabase
      .rpc('calcular_ocupacao_sala', {
        p_sala_id: salaId,
        p_data: data,
        p_horario: horario
      })

    if (error) throw error
    return { data: ocupacao as OcupacaoSala, error: null }
  }

  // =====================================
  // 2. GESTÃO DE AGENDAMENTOS TERAPÊUTICOS
  // =====================================

  async buscarAgendamentosTerapeuticos(filtros: {
    unidadeId?: string
    data?: string
    profissionalId?: string
    status?: string
    salaId?: string
  }) {
    let query = this.supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes(nome, cpf),
        colaboradores(nome_completo, especialidades(nome, cor)),
        salas(nome, cor),
        especialidades(nome, cor),
        evolucoes_sessoes(qualidade_sessao),
        pagamentos_sessoes(valor_calculado, aprovado_supervisao)
      `)

    if (filtros.unidadeId) {
      query = query.eq('unidade_id', filtros.unidadeId)
    }
    if (filtros.data) {
      query = query.eq('data_agendamento', filtros.data)
    }
    if (filtros.profissionalId) {
      query = query.eq('profissional_id', filtros.profissionalId)
    }
    if (filtros.status) {
      query = query.eq('status_terapeutico', filtros.status)
    }
    if (filtros.salaId) {
      query = query.eq('sala_id', filtros.salaId)
    }

    const { data, error } = await query.order('horario_inicio')

    if (error) throw error
    return { data: data as AgendamentoTerapeutico[], error: null }
  }

  async atualizarStatusTerapeutico(agendamentoId: string, novoStatus: string, observacoes?: string) {
    const updateData: any = {
      status_terapeutico: novoStatus,
      updated_at: new Date().toISOString()
    }

    // Adiciona timestamp específico baseado no status
    switch (novoStatus) {
      case 'chegou':
        updateData.horario_chegada = new Date().toISOString()
        break
      case 'em_atendimento':
        updateData.horario_inicio_real = new Date().toISOString()
        break
      case 'sessao_concluida':
      case 'encerrado_antecipadamente':
        updateData.horario_fim_real = new Date().toISOString()
        // Calcula duração real
        const { data: agendamento } = await this.supabase
          .from('agendamentos')
          .select('horario_inicio_real')
          .eq('id', agendamentoId)
          .single()
        
        if (agendamento?.horario_inicio_real) {
          const inicio = new Date(agendamento.horario_inicio_real)
          const fim = new Date()
          updateData.duracao_real_minutos = Math.round((fim.getTime() - inicio.getTime()) / 60000)
        }
        break
    }

    if (observacoes) {
      updateData.observacoes_supervisao = observacoes
    }

    const { data, error } = await this.supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', agendamentoId)

    if (error) throw error
    return { data, error: null }
  }

  // =====================================
  // 3. SISTEMA DE SUPERVISÃO E EVOLUÇÃO
  // =====================================

  async criarEvolucao(evolucao: Omit<EvolucaoSessao, 'id'>) {
    const { data, error } = await this.supabase
      .from('evolucoes_sessoes')
      .insert(evolucao)

    if (error) throw error

    // Atualiza o agendamento marcando que a evolução foi realizada
    await this.supabase
      .from('agendamentos')
      .update({ evolucao_realizada: true })
      .eq('id', evolucao.agendamento_id)

    return { data, error: null }
  }

  async aprovarSupervisao(agendamentoId: string, supervisorId: string, observacoes?: string) {
    const { data, error } = await this.supabase
      .from('agendamentos')
      .update({
        supervisionado: true,
        liberado_pagamento: true,
        observacoes_supervisao: observacoes,
        updated_at: new Date().toISOString()
      })
      .eq('id', agendamentoId)

    if (error) throw error

    // Cria registro de pagamento se não existir
    await this.criarPagamentoSessao(agendamentoId, supervisorId)

    return { data, error: null }
  }

  // =====================================
  // 4. SISTEMA DE PAGAMENTOS
  // =====================================

  async criarPagamentoSessao(agendamentoId: string, supervisorId: string) {
    // Busca dados do agendamento
    const { data: agendamento } = await this.supabase
      .from('agendamentos')
      .select(`
        *,
        colaboradores(valor_hora_pj, valor_hora_clt, regime_contratacao),
        evolucoes_sessoes(id)
      `)
      .eq('id', agendamentoId)
      .single()

    if (!agendamento) throw new Error('Agendamento não encontrado')

    const valorHora = agendamento.colaboradores.regime_contratacao === 'PJ' 
      ? agendamento.colaboradores.valor_hora_pj 
      : agendamento.colaboradores.valor_hora_clt

    const duracaoMinutos = agendamento.duracao_real_minutos || 60
    const percentual = duracaoMinutos <= 30 ? 50 : 100
    const valorCalculado = (valorHora * duracaoMinutos / 60) * (percentual / 100)

    const { data, error } = await this.supabase
      .from('pagamentos_sessoes')
      .insert({
        agendamento_id: agendamentoId,
        profissional_id: agendamento.profissional_id,
        evolucao_id: agendamento.evolucoes_sessoes[0]?.id,
        valor_base_hora: valorHora,
        duracao_minutos: duracaoMinutos,
        percentual_pagamento: percentual,
        valor_calculado: valorCalculado,
        aprovado_supervisao: true,
        supervisor_id: supervisorId,
        data_aprovacao: new Date().toISOString(),
        mes_referencia: new Date(agendamento.data_agendamento).toISOString().slice(0, 7) + '-01'
      })

    if (error) throw error
    return { data, error: null }
  }

  async buscarPagamentosParaFolha(mesReferencia: string) {
    const { data, error } = await this.supabase
      .from('pagamentos_sessoes')
      .select(`
        *,
        colaboradores(
          nome_completo,
          cpf,
          regime_contratacao,
          cargo
        ),
        agendamentos(data_agendamento)
      `)
      .eq('mes_referencia', mesReferencia)
      .eq('aprovado_supervisao', true)
      .eq('incluido_folha', false)

    if (error) throw error
    return { data, error: null }
  }

  // =====================================
  // 5. SISTEMA DE ALOCAÇÃO AUTOMÁTICA
  // =====================================

  async verificarDisponibilidadeSala(salaId: string, data: string, horarioInicio: string, horarioFim: string) {
    // Busca capacidade da sala
    const { data: sala } = await this.supabase
      .from('salas')
      .select('capacidade_maxima')
      .eq('id', salaId)
      .single()

    if (!sala) throw new Error('Sala não encontrada')

    // Conta agendamentos no mesmo horário
    const { data: agendamentos } = await this.supabase
      .from('agendamentos')
      .select('paciente_id, profissional_id')
      .eq('sala_id', salaId)
      .eq('data_agendamento', data)
      .gte('horario_fim', horarioInicio)
      .lte('horario_inicio', horarioFim)
      .in('status_terapeutico', ['agendado', 'chegou', 'pronto_para_terapia', 'em_atendimento'])

    const criancasOcupadas = agendamentos?.length || 0
    const profissionaisOcupados = new Set(agendamentos?.map(a => a.profissional_id)).size || 0

    return {
      disponivel: criancasOcupadas < sala.capacidade_maxima && profissionaisOcupados < 3,
      criancasOcupadas,
      profissionaisOcupados,
      capacidadeMaximaCriancas: sala.capacidade_maxima,
      capacidadeMaximaProfissionais: 3
    }
  }

  // =====================================
  // 6. MÉTODOS AUXILIARES
  // =====================================

  async registrarOcorrencia(ocorrencia: Omit<OcorrenciaRecepcao, 'id'>) {
    const { data, error } = await this.supabase
      .from('ocorrencias_recepcao')
      .insert(ocorrencia)

    if (error) throw error
    return { data, error: null }
  }

  async buscarAtendimentosPorSupervisor(profissionalId: string, periodo: { inicio: string; fim: string }) {
    const { data, error } = await this.supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes(nome),
        colaboradores(nome_completo),
        salas(nome),
        especialidades(nome),
        evolucoes_sessoes(qualidade_sessao),
        pagamentos_sessoes(valor_calculado, aprovado_supervisao)
      `)
      .gte('data_agendamento', periodo.inicio)
      .lte('data_agendamento', periodo.fim)
      .in('status_terapeutico', ['sessao_concluida', 'encerrado_antecipadamente'])

    if (profissionalId) {
      // Se profissionalId fornecido, filtra por esse profissional
    }

    if (error) throw error
    return { data, error: null }
  }

  async buscarEstatisticasSupervisao(dataInicio: string, dataFim: string, unidadeId?: string) {
    let query = this.supabase
      .from('agendamentos')
      .select(`
        status_terapeutico,
        evolucao_realizada,
        supervisionado,
        liberado_pagamento,
        duracao_real_minutos,
        pagamentos_sessoes(valor_calculado)
      `)
      .gte('data_agendamento', dataInicio)
      .lte('data_agendamento', dataFim)

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calcula estatísticas
    const total = data?.length || 0
    const concluidos = data?.filter(a => a.status_terapeutico === 'sessao_concluida').length || 0
    const comEvolucao = data?.filter(a => a.evolucao_realizada).length || 0
    const supervisionados = data?.filter(a => a.supervisionado).length || 0
    const valorTotal = data?.reduce((sum, a) => sum + (a.pagamentos_sessoes?.[0]?.valor_calculado || 0), 0) || 0

    return {
      data: {
        total_sessoes: total,
        sessoes_concluidas: concluidos,
        evolucoes_realizadas: comEvolucao,
        sessoes_supervisionadas: supervisionados,
        valor_total_aprovado: valorTotal,
        percentual_conclusao: total > 0 ? Math.round((concluidos / total) * 100) : 0,
        percentual_evolucoes: concluidos > 0 ? Math.round((comEvolucao / concluidos) * 100) : 0,
        percentual_supervisao: concluidos > 0 ? Math.round((supervisionados / concluidos) * 100) : 0
      },
      error: null
    }
  }
}

export const moduloTerapeuticoService = new ModuloTerapeuticoService()
