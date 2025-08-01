import { supabase } from './supabaseClient';
import {
  Sala,
  SalaProfissional,
  Atendimento,
  Evolucao,
  FechamentoMensalPJ,
  FechamentoDetalhe,
  RelatorioPagamentoPJ,
  DashboardPJ,
  FiltroAtendimentos,
  FiltroEvolucoes,
  FiltroFechamentos
} from '../types/atendimentosPJ';

// ===== SERVICE PARA GESTÃO DE ATENDIMENTOS PJ =====

export const atendimentosPJService = {
  
  // ===== GESTÃO DE SALAS E PROFISSIONAIS =====
  
  async listarSalas(unidade_id?: string): Promise<Sala[]> {
    let query = supabase
      .from('salas')
      .select('*')
      .eq('ativa', true)
      .order('numero');
    
    if (unidade_id) {
      query = query.eq('unidade_id', unidade_id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async vincularProfissionalSala(dados: Omit<SalaProfissional, 'id'>): Promise<SalaProfissional> {
    const { data, error } = await supabase
      .from('sala_profissionais')
      .insert(dados)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async listarProfissionaisPorSala(sala_id: string): Promise<SalaProfissional[]> {
    const { data, error } = await supabase
      .from('sala_profissionais')
      .select(`
        *,
        colaborador:colaboradores(id, nome_completo, cargo),
        sala:salas(id, numero, nome)
      `)
      .eq('sala_id', sala_id)
      .eq('ativo', true)
      .order('data_inicio', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // ===== GESTÃO DE ATENDIMENTOS =====

  async registrarAtendimento(dados: Omit<Atendimento, 'id'>): Promise<Atendimento> {
    const { data, error } = await supabase
      .from('atendimentos')
      .insert(dados)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async listarAtendimentos(filtros: FiltroAtendimentos = {}): Promise<Atendimento[]> {
    let query = supabase
      .from('atendimentos')
      .select(`
        *,
        sala:salas(id, numero, nome),
        profissional_principal:colaboradores!profissional_principal_id(id, nome_completo),
        profissional_auxiliar:colaboradores!profissional_auxiliar_id(id, nome_completo),
        evolucoes(id, status, data_evolucao)
      `)
      .order('data_atendimento', { ascending: false })
      .order('hora_inicio', { ascending: false });

    // Aplicar filtros
    if (filtros.data_inicio) {
      query = query.gte('data_atendimento', filtros.data_inicio);
    }
    if (filtros.data_fim) {
      query = query.lte('data_atendimento', filtros.data_fim);
    }
    if (filtros.profissional_id) {
      query = query.or(`profissional_principal_id.eq.${filtros.profissional_id},profissional_auxiliar_id.eq.${filtros.profissional_id}`);
    }
    if (filtros.sala_id) {
      query = query.eq('sala_id', filtros.sala_id);
    }
    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // ===== GESTÃO DE EVOLUÇÕES =====

  async registrarEvolucao(dados: Omit<Evolucao, 'id'>): Promise<Evolucao> {
    const { data, error } = await supabase
      .from('evolucoes')
      .insert(dados)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async listarEvolucoesPendentes(profissional_id?: string): Promise<Evolucao[]> {
    let query = supabase
      .from('evolucoes')
      .select(`
        *,
        atendimento:atendimentos(
          id, data_atendimento, hora_inicio, hora_fim,
          sala:salas(numero, nome)
        ),
        profissional:colaboradores(id, nome_completo)
      `)
      .neq('status', 'no_prazo')
      .order('prazo_vencimento', { ascending: true });

    if (profissional_id) {
      query = query.eq('profissional_id', profissional_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async verificarEvolucoesPendentes(): Promise<{
    vencendo_hoje: Evolucao[];
    vencidas: Evolucao[];
  }> {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Evoluções vencendo hoje
    const { data: vencendoHoje, error: errorVencendo } = await supabase
      .from('evolucoes')
      .select(`
        *,
        atendimento:atendimentos(data_atendimento, profissional_principal_id),
        profissional:colaboradores(nome_completo)
      `)
      .gte('prazo_vencimento', hoje)
      .lt('prazo_vencimento', `${hoje} 23:59:59`)
      .is('id', null); // Evoluções que ainda não foram criadas

    // Evoluções vencidas
    const { data: vencidas, error: errorVencidas } = await supabase
      .from('evolucoes')
      .select(`
        *,
        atendimento:atendimentos(data_atendimento),
        profissional:colaboradores(nome_completo)
      `)
      .lt('prazo_vencimento', hoje)
      .eq('status', 'vencida');

    if (errorVencendo || errorVencidas) {
      throw errorVencendo || errorVencidas;
    }

    return {
      vencendo_hoje: vencendoHoje || [],
      vencidas: vencidas || []
    };
  },

  // ===== CÁLCULOS E FECHAMENTOS =====

  async calcularValorAtendimento(
    atendimento_id: string, 
    profissional_id: string
  ): Promise<{
    valor_hora: number;
    valor_evolucao: number;
    valor_total: number;
    tem_evolucao: boolean;
    evolucao_no_prazo: boolean;
  }> {
    const { data, error } = await supabase
      .rpc('calcular_valor_atendimento', {
        p_atendimento_id: atendimento_id,
        p_profissional_id: profissional_id
      });

    if (error) throw error;
    return data[0];
  },

  async gerarFechamentoMensal(
    colaborador_id: string, 
    ano: number, 
    mes: number
  ): Promise<FechamentoMensalPJ> {
    console.log(`📊 Gerando fechamento para ${colaborador_id} - ${mes}/${ano}`);

    // Buscar atendimentos do período
    const dataInicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
    const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0]; // Último dia do mês

    const atendimentos = await this.listarAtendimentos({
      profissional_id: colaborador_id,
      data_inicio: dataInicio,
      data_fim: dataFim,
      status: 'realizado'
    });

    let total_atendimentos = 0;
    let total_horas = 0;
    let total_evolucoes = 0;
    let valor_horas = 0;
    let valor_evolucoes = 0;
    let atendimentos_sem_evolucao = 0;
    let evolucoes_atrasadas = 0;

    const detalhes: Omit<FechamentoDetalhe, 'id' | 'fechamento_id'>[] = [];

    // Processar cada atendimento
    for (const atendimento of atendimentos) {
      const calculo = await this.calcularValorAtendimento(
        atendimento.id!,
        colaborador_id
      );

      total_atendimentos++;
      total_horas += (atendimento.duracao_minutos || 0) / 60;
      valor_horas += calculo.valor_hora * ((atendimento.duracao_minutos || 0) / 60);

      if (calculo.tem_evolucao) {
        total_evolucoes++;
        valor_evolucoes += calculo.valor_evolucao;
        
        if (!calculo.evolucao_no_prazo) {
          evolucoes_atrasadas++;
        }
      } else {
        atendimentos_sem_evolucao++;
      }

      detalhes.push({
        atendimento_id: atendimento.id!,
        evolucao_id: atendimento.evolucoes?.[0]?.id,
        valor_hora: calculo.valor_hora,
        valor_evolucao: calculo.tem_evolucao ? calculo.valor_evolucao : 0,
        minutos_atendimento: atendimento.duracao_minutos || 0,
        tem_evolucao: calculo.tem_evolucao,
        evolucao_no_prazo: calculo.evolucao_no_prazo,
        valor_total_item: calculo.valor_total
      });
    }

    // Criar o fechamento
    const fechamentoData: Omit<FechamentoMensalPJ, 'id'> = {
      colaborador_id,
      ano,
      mes,
      total_atendimentos,
      total_horas,
      total_evolucoes,
      valor_horas,
      valor_evolucoes,
      valor_total: valor_horas + valor_evolucoes,
      atendimentos_sem_evolucao,
      evolucoes_atrasadas,
      data_fechamento: new Date().toISOString().split('T')[0],
      status: 'fechado'
    };

    const { data: fechamento, error } = await supabase
      .from('fechamentos_mensais_pj')
      .insert(fechamentoData)
      .select('*')
      .single();

    if (error) throw error;

    // Inserir detalhes
    const detalhesComFechamento = detalhes.map(detalhe => ({
      ...detalhe,
      fechamento_id: fechamento.id
    }));

    const { error: errorDetalhes } = await supabase
      .from('fechamento_detalhes')
      .insert(detalhesComFechamento);

    if (errorDetalhes) throw errorDetalhes;

    return fechamento;
  },

  async obterRelatorioPagamento(
    colaborador_id: string,
    ano: number,
    mes: number
  ): Promise<RelatorioPagamentoPJ | null> {
    const { data: fechamento, error } = await supabase
      .from('fechamentos_mensais_pj')
      .select(`
        *,
        colaborador:colaboradores(nome_completo),
        detalhes:fechamento_detalhes(
          *,
          atendimento:atendimentos(
            id, data_atendimento, duracao_minutos
          )
        )
      `)
      .eq('colaborador_id', colaborador_id)
      .eq('ano', ano)
      .eq('mes', mes)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!fechamento) return null;

    const taxa_evolucao = fechamento.total_atendimentos > 0 
      ? (fechamento.total_evolucoes / fechamento.total_atendimentos) * 100 
      : 0;

    const taxa_pontualidade = fechamento.total_evolucoes > 0
      ? ((fechamento.total_evolucoes - fechamento.evolucoes_atrasadas) / fechamento.total_evolucoes) * 100
      : 0;

    return {
      colaborador_id,
      nome_colaborador: fechamento.colaborador.nome_completo,
      periodo: { ano, mes },
      resumo: {
        total_atendimentos: fechamento.total_atendimentos,
        total_horas: fechamento.total_horas,
        total_evolucoes: fechamento.total_evolucoes,
        valor_total: fechamento.valor_total
      },
      detalhes: fechamento.detalhes.map((d: any) => ({
        atendimento_id: d.atendimento_id,
        data: d.atendimento.data_atendimento,
        paciente: 'Paciente', // TODO: buscar nome do paciente
        duracao_minutos: d.minutos_atendimento,
        valor_hora: d.valor_hora,
        tem_evolucao: d.tem_evolucao,
        valor_evolucao: d.valor_evolucao,
        valor_total: d.valor_total_item
      })),
      indicadores: {
        taxa_evolucao,
        taxa_pontualidade,
        atendimentos_pendentes: fechamento.atendimentos_sem_evolucao
      }
    };
  },

  // ===== DASHBOARD E RELATÓRIOS =====

  async obterDashboard(ano: number, mes: number): Promise<DashboardPJ> {
    // Buscar resumo geral
    const { data: resumo, error: errorResumo } = await supabase
      .from('fechamentos_mensais_pj')
      .select('*')
      .eq('ano', ano)
      .eq('mes', mes);

    if (errorResumo) throw errorResumo;

    const total_profissionais_pj = resumo?.length || 0;
    const total_atendimentos = resumo?.reduce((sum, f) => sum + f.total_atendimentos, 0) || 0;
    const total_evolucoes = resumo?.reduce((sum, f) => sum + f.total_evolucoes, 0) || 0;
    const valor_total_folha = resumo?.reduce((sum, f) => sum + f.valor_total, 0) || 0;

    // Buscar alertas
    const evolucoesPendentes = await this.verificarEvolucoesPendentes();

    return {
      periodo: { ano, mes },
      resumo_geral: {
        total_profissionais_pj,
        total_atendimentos,
        total_evolucoes,
        valor_total_folha
      },
      por_profissional: resumo?.map(f => ({
        colaborador_id: f.colaborador_id,
        nome: f.colaborador?.nome_completo || 'Nome não encontrado',
        atendimentos: f.total_atendimentos,
        evolucoes: f.total_evolucoes,
        valor_total: f.valor_total,
        status_fechamento: f.status
      })) || [],
      alertas: {
        evolucoes_vencendo: evolucoesPendentes.vencendo_hoje.length,
        evolucoes_vencidas: evolucoesPendentes.vencidas.length,
        fechamentos_pendentes: resumo?.filter(f => f.status === 'aberto').length || 0
      }
    };
  }
};

export default atendimentosPJService;
