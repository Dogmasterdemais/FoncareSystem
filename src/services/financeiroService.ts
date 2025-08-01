import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipos baseados no schema do banco
export interface Unidade {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor?: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  categoria: 'Consumo' | 'Fixa' | 'Variavel' | 'Investimento';
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  metodo_pagamento?: string;
  observacoes?: string;
  documento?: string;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContaReceber {
  id: string;
  paciente_id?: string;
  agendamento_id?: string;
  descricao: string;
  valor_bruto: number;
  valor_liquido?: number;
  valor_glosa: number;
  percentual_glosa: number;
  data_vencimento: string;
  data_recebimento?: string;
  origem: 'Guia_Tabulada' | 'Particular' | 'Procedimento' | 'Exame' | 'Consulta';
  convenio_id?: string;
  status: 'Pendente' | 'Recebido' | 'Atrasado' | 'Glosa_Total' | 'Glosa_Parcial';
  metodo_recebimento?: string;
  numero_guia?: string;
  observacoes?: string;
  unidade_id: string;
  created_at: string;
  updated_at: string;
}

export interface AtendimentoGuiaTabulada {
  id: string;
  unidade_id: string;
  numero_guia: string;
  paciente_nome: string;
  paciente_documento?: string;
  convenio: string;
  procedimento: string;
  codigo_procedimento?: string;
  valor_guia: number;
  valor_pago?: number;
  valor_glosa: number;
  data_atendimento: string;
  data_autorizacao?: string;
  profissional_nome?: string;
  profissional_id?: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado' | 'Em_Processamento';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface AnexoNotaFiscal {
  id: string;
  conta_pagar_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  tamanho_arquivo: number;
  tipo_arquivo: string;
  hash_arquivo?: string;
  data_upload: string;
  uploaded_by?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Classe para gerenciar operações financeiras
export class FinanceiroService {
  
  // ============ DASHBOARD ============
  
  async getDashboardData(): Promise<{
    total_pagar: number;
    total_receber: number;
    receita_mes: number;
    despesa_mes: number;
    atendimentos_mes: number;
    ticket_medio: number;
    contas_vencendo: number;
  }> {
    try {
      // Buscar dados diretamente das tabelas ao invés da função PostgreSQL
      const dataInicio = new Date();
      dataInicio.setDate(1); // Primeiro dia do mês
      const dataFim = new Date();
      const proximaSemana = new Date();
      proximaSemana.setDate(proximaSemana.getDate() + 7);
      
      // Contas a pagar pendentes
      const { data: contasPagar } = await supabase
        .from('contas_pagar')
        .select('valor')
        .in('status', ['Pendente', 'Atrasado']);
      
      // Contas a receber pendentes
      const { data: contasReceber } = await supabase
        .from('contas_receber')
        .select('valor_liquido')
        .in('status', ['Pendente', 'Atrasado']);
      
      // Receita do mês (contas recebidas)
      const { data: receitaMes } = await supabase
        .from('contas_receber')
        .select('valor_liquido')
        .eq('status', 'Recebido')
        .gte('data_recebimento', dataInicio.toISOString().split('T')[0]);
      
      // Despesa do mês (contas pagas)
      const { data: despesaMes } = await supabase
        .from('contas_pagar')
        .select('valor')
        .eq('status', 'Pago')
        .gte('data_pagamento', dataInicio.toISOString().split('T')[0]);
      
      // Atendimentos do mês
      const { data: atendimentos } = await supabase
        .from('atendimentos_guias_tabuladas')
        .select('valor_guia')
        .gte('data_atendimento', dataInicio.toISOString().split('T')[0]);
      
      // Contas vencendo nos próximos 7 dias
      const { data: contasVencendo } = await supabase
        .from('contas_pagar')
        .select('id')
        .eq('status', 'Pendente')
        .lte('data_vencimento', proximaSemana.toISOString().split('T')[0])
        .gte('data_vencimento', new Date().toISOString().split('T')[0]);

      // Calcular totais
      const totalPagar = (contasPagar || []).reduce((sum, conta) => sum + (conta.valor || 0), 0);
      const totalReceber = (contasReceber || []).reduce((sum, conta) => sum + (conta.valor_liquido || 0), 0);
      const receitaTotal = (receitaMes || []).reduce((sum, conta) => sum + (conta.valor_liquido || 0), 0);
      const despesaTotal = (despesaMes || []).reduce((sum, conta) => sum + (conta.valor || 0), 0);
      const totalAtendimentos = (atendimentos || []).length;
      const valorTotalAtendimentos = (atendimentos || []).reduce((sum, atend) => sum + (atend.valor_guia || 0), 0);
      const ticketMedio = totalAtendimentos > 0 ? valorTotalAtendimentos / totalAtendimentos : 0;

      return {
        total_pagar: totalPagar,
        total_receber: totalReceber,
        receita_mes: receitaTotal,
        despesa_mes: despesaTotal,
        atendimentos_mes: totalAtendimentos,
        ticket_medio: ticketMedio,
        contas_vencendo: (contasVencendo || []).length
      };
    } catch (error) {
      console.error('Erro na função getDashboardData:', error);
      // Retornar dados padrão em caso de erro
      return {
        total_pagar: 0,
        total_receber: 0,
        receita_mes: 0,
        despesa_mes: 0,
        atendimentos_mes: 0,
        ticket_medio: 0,
        contas_vencendo: 0
      };
    }
  }
  
  // ============ CONTAS A PAGAR ============
  
  async getContasPagar(unidadeId?: string, filtros?: {
    status?: string;
    categoria?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<ContaPagar[]> {
    let query = supabase
      .from('contas_pagar')
      .select('*')
      .order('data_vencimento', { ascending: true });

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros?.dataInicio) {
      query = query.gte('data_vencimento', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('data_vencimento', filtros.dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      throw error;
    }

    return data || [];
  }

  async createContaPagar(conta: Omit<ContaPagar, 'id' | 'created_at' | 'updated_at'>): Promise<ContaPagar> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .insert([conta])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conta a pagar:', error);
      throw error;
    }

    return data;
  }

  async updateContaPagar(id: string, conta: Partial<ContaPagar>): Promise<ContaPagar> {
    const { data, error } = await supabase
      .from('contas_pagar')
      .update({ ...conta, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
      throw error;
    }

    return data;
  }

  async deleteContaPagar(id: string): Promise<void> {
    const { error } = await supabase
      .from('contas_pagar')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir conta a pagar:', error);
      throw error;
    }
  }

  // ============ CONTAS A RECEBER ============

  async getContasReceber(unidadeId?: string, filtros?: {
    status?: string;
    origem?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<ContaReceber[]> {
    let query = supabase
      .from('contas_receber')
      .select(`
        *,
        pacientes(nome),
        convenios(nome)
      `)
      .order('data_vencimento', { ascending: true });

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.origem) {
      query = query.eq('origem', filtros.origem);
    }

    if (filtros?.dataInicio) {
      query = query.gte('data_vencimento', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('data_vencimento', filtros.dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar contas a receber:', error);
      throw error;
    }

    return data || [];
  }

  async createContaReceber(conta: Omit<ContaReceber, 'id' | 'created_at' | 'updated_at' | 'percentual_glosa'>): Promise<ContaReceber> {
    const { data, error } = await supabase
      .from('contas_receber')
      .insert([conta])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conta a receber:', error);
      throw error;
    }

    return data;
  }

  async updateContaReceber(id: string, conta: Partial<ContaReceber>): Promise<ContaReceber> {
    const { data, error } = await supabase
      .from('contas_receber')
      .update({ ...conta, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar conta a receber:', error);
      throw error;
    }

    return data;
  }

  // ============ ATENDIMENTOS GUIAS TABULADAS ============

  async getAtendimentosGuiasTabuladas(unidadeId?: string, filtros?: {
    convenio?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<AtendimentoGuiaTabulada[]> {
    let query = supabase
      .from('atendimentos_guias_tabuladas')
      .select(`
        *,
        unidades(nome)
      `)
      .order('data_atendimento', { ascending: false });

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId);
    }

    if (filtros?.convenio) {
      query = query.eq('convenio', filtros.convenio);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.dataInicio) {
      query = query.gte('data_atendimento', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('data_atendimento', filtros.dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar atendimentos guias tabuladas:', error);
      throw error;
    }

    return data || [];
  }

  async createAtendimentoGuiaTabulada(atendimento: Omit<AtendimentoGuiaTabulada, 'id' | 'created_at' | 'updated_at'>): Promise<AtendimentoGuiaTabulada> {
    const { data, error } = await supabase
      .from('atendimentos_guias_tabuladas')
      .insert([atendimento])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar atendimento guia tabulada:', error);
      throw error;
    }

    return data;
  }

  // ============ ANEXOS NOTAS FISCAIS ============

  async uploadNotaFiscal(file: File, contaPagarId: string): Promise<AnexoNotaFiscal> {
    // 1. Upload do arquivo para o storage
    const fileName = `nota-fiscal-${contaPagarId}-${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('notas-fiscais')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro ao fazer upload da nota fiscal:', uploadError);
      throw uploadError;
    }

    // 2. Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('notas-fiscais')
      .getPublicUrl(fileName);

    // 3. Salvar informações no banco
    const anexo = {
      conta_pagar_id: contaPagarId,
      nome_arquivo: file.name,
      url_arquivo: urlData.publicUrl,
      tamanho_arquivo: file.size,
      tipo_arquivo: file.type,
      data_upload: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('anexos_notas_fiscais')
      .insert([anexo])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar anexo nota fiscal:', error);
      throw error;
    }

    return data;
  }

  async getAnexosNotaFiscal(contaPagarId: string): Promise<AnexoNotaFiscal[]> {
    const { data, error } = await supabase
      .from('anexos_notas_fiscais')
      .select('*')
      .eq('conta_pagar_id', contaPagarId)
      .order('data_upload', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anexos nota fiscal:', error);
      throw error;
    }

    return data || [];
  }

  // ============ ANÁLISE DE SUPERÁVIT ============

  async getAnaliseSupeavitUnidades(periodo?: string): Promise<any[]> {
    // Usar a view criada no banco
    let query = supabase
      .from('vw_analise_superavit_unidades')
      .select('*');

    if (periodo) {
      // Adaptar conforme necessário para diferentes períodos
      // A view já filtra para o mês atual, mas pode ser expandida
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar análise superávit unidades:', error);
      throw error;
    }

    return data || [];
  }

  // ============ DASHBOARD ============

  async getDashboardFinanceiro(unidadeId?: string): Promise<{
    contasPagar: {
      pendente: number;
      pago: number;
      atrasado: number;
      total: number;
    };
    contasReceber: {
      pendente: number;
      recebido: number;
      atrasado: number;
      glosas: number;
      total: number;
    };
    fluxoCaixa: {
      receitas: number;
      despesas: number;
      saldo: number;
    };
  }> {
    const dataInicio = new Date();
    dataInicio.setDate(1); // Primeiro dia do mês
    
    const dataFim = new Date();
    dataFim.setMonth(dataFim.getMonth() + 1, 0); // Último dia do mês

    // Buscar contas a pagar do mês
    const contasPagar = await this.getContasPagar(unidadeId, {
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0]
    });

    // Buscar contas a receber do mês
    const contasReceber = await this.getContasReceber(unidadeId, {
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0]
    });

    // Calcular totais das contas a pagar
    const totalPendentePagar = contasPagar
      .filter(c => c.status === 'Pendente')
      .reduce((sum, c) => sum + c.valor, 0);
    
    const totalPago = contasPagar
      .filter(c => c.status === 'Pago')
      .reduce((sum, c) => sum + c.valor, 0);
    
    const totalAtrasadoPagar = contasPagar
      .filter(c => c.status === 'Atrasado')
      .reduce((sum, c) => sum + c.valor, 0);

    // Calcular totais das contas a receber
    const totalPendenteReceber = contasReceber
      .filter(c => c.status === 'Pendente')
      .reduce((sum, c) => sum + (c.valor_liquido || c.valor_bruto), 0);
    
    const totalRecebido = contasReceber
      .filter(c => c.status === 'Recebido')
      .reduce((sum, c) => sum + (c.valor_liquido || c.valor_bruto), 0);
    
    const totalAtrasadoReceber = contasReceber
      .filter(c => c.status === 'Atrasado')
      .reduce((sum, c) => sum + (c.valor_liquido || c.valor_bruto), 0);
    
    const totalGlosas = contasReceber
      .reduce((sum, c) => sum + c.valor_glosa, 0);

    return {
      contasPagar: {
        pendente: totalPendentePagar,
        pago: totalPago,
        atrasado: totalAtrasadoPagar,
        total: totalPendentePagar + totalPago + totalAtrasadoPagar
      },
      contasReceber: {
        pendente: totalPendenteReceber,
        recebido: totalRecebido,
        atrasado: totalAtrasadoReceber,
        glosas: totalGlosas,
        total: totalPendenteReceber + totalRecebido + totalAtrasadoReceber
      },
      fluxoCaixa: {
        receitas: totalRecebido,
        despesas: totalPago,
        saldo: totalRecebido - totalPago
      }
    };
  }

  // ============ UTILITÁRIOS ============

  async getUnidades(): Promise<Unidade[]> {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar unidades:', error);
      throw error;
    }

    return data || [];
  }

  async getConvenios(): Promise<any[]> {
    const { data, error } = await supabase
      .from('convenios')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar convênios:', error);
      throw error;
    }

    return data || [];
  }
}

// Instância singleton do serviço
export const financeiroService = new FinanceiroService();
