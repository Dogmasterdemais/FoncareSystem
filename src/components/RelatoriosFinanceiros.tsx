"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building, 
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Printer,
  Share2,
  Settings
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RelatorioFilter {
  dataInicio: string;
  dataFim: string;
  unidadeId?: string;
  tipo?: string;
}

interface RelatorioReceitas {
  origem: string;
  quantidade: number;
  valor_total: number;
  valor_medio: number;
  percentual: number;
}

interface RelatorioGlosas {
  convenio: string;
  valor_bruto: number;
  valor_liquido: number;
  valor_glosa: number;
  percentual_glosa: number;
  quantidade_guias: number;
}

interface RelatorioFluxo {
  categoria: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  quantidade: number;
  percentual: number;
}

export default function RelatoriosFinanceiros() {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<RelatorioFilter>({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });
  const [relatorioAtivo, setRelatorioAtivo] = useState<string>('');
  const [dadosRelatorio, setDadosRelatorio] = useState<any>(null);

  const gerarRelatorioReceitas = async () => {
    setLoading(true);
    setRelatorioAtivo('receitas');
    
    try {
      const { data, error } = await supabase
        .from('contas_receber')
        .select('origem, valor_liquido, status')
        .gte('data_vencimento', filtros.dataInicio)
        .lte('data_vencimento', filtros.dataFim);

      if (error) throw error;

      // Agrupar por origem
      const agrupado = (data || []).reduce((acc: any, item) => {
        const origem = item.origem || 'Não informado';
        if (!acc[origem]) {
          acc[origem] = {
            origem,
            quantidade: 0,
            valor_total: 0,
            valor_medio: 0
          };
        }
        acc[origem].quantidade += 1;
        acc[origem].valor_total += item.valor_liquido || 0;
        return acc;
      }, {});

      const valorTotal = Object.values(agrupado).reduce((sum: number, item: any) => sum + item.valor_total, 0);

      const resultado: RelatorioReceitas[] = Object.values(agrupado).map((item: any) => ({
        ...item,
        valor_medio: item.quantidade > 0 ? item.valor_total / item.quantidade : 0,
        percentual: valorTotal > 0 ? (item.valor_total / valorTotal) * 100 : 0
      }));

      setDadosRelatorio({
        tipo: 'receitas',
        dados: resultado,
        total: valorTotal,
        periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de receitas:', error);
      alert('Erro ao gerar relatório de receitas');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioGlosas = async () => {
    setLoading(true);
    setRelatorioAtivo('glosas');
    
    try {
      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          valor_bruto,
          valor_liquido,
          valor_glosa,
          percentual_glosa,
          convenios(nome)
        `)
        .gte('data_vencimento', filtros.dataInicio)
        .lte('data_vencimento', filtros.dataFim)
        .gt('valor_glosa', 0);

      if (error) throw error;

      // Agrupar por convênio
      const agrupado = (data || []).reduce((acc: any, item) => {
        const convenio = item.convenios?.nome || 'Particular';
        if (!acc[convenio]) {
          acc[convenio] = {
            convenio,
            valor_bruto: 0,
            valor_liquido: 0,
            valor_glosa: 0,
            quantidade_guias: 0
          };
        }
        acc[convenio].valor_bruto += item.valor_bruto || 0;
        acc[convenio].valor_liquido += item.valor_liquido || 0;
        acc[convenio].valor_glosa += item.valor_glosa || 0;
        acc[convenio].quantidade_guias += 1;
        return acc;
      }, {});

      const resultado: RelatorioGlosas[] = Object.values(agrupado).map((item: any) => ({
        ...item,
        percentual_glosa: item.valor_bruto > 0 ? (item.valor_glosa / item.valor_bruto) * 100 : 0
      }));

      setDadosRelatorio({
        tipo: 'glosas',
        dados: resultado,
        periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de glosas:', error);
      alert('Erro ao gerar relatório de glosas');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioFluxo = async () => {
    setLoading(true);
    setRelatorioAtivo('fluxo');
    
    try {
      // Buscar receitas
      const { data: receitas, error: errorReceitas } = await supabase
        .from('contas_receber')
        .select('origem, valor_liquido')
        .eq('status', 'Recebido')
        .gte('data_recebimento', filtros.dataInicio)
        .lte('data_recebimento', filtros.dataFim);

      if (errorReceitas) throw errorReceitas;

      // Buscar despesas
      const { data: despesas, error: errorDespesas } = await supabase
        .from('contas_pagar')
        .select('categoria, valor')
        .eq('status', 'Pago')
        .gte('data_pagamento', filtros.dataInicio)
        .lte('data_pagamento', filtros.dataFim);

      if (errorDespesas) throw errorDespesas;

      // Processar receitas
      const receitasAgrupadas = (receitas || []).reduce((acc: any, item) => {
        const categoria = `Receita ${item.origem}`;
        if (!acc[categoria]) {
          acc[categoria] = { categoria, tipo: 'receita', valor: 0, quantidade: 0 };
        }
        acc[categoria].valor += item.valor_liquido || 0;
        acc[categoria].quantidade += 1;
        return acc;
      }, {});

      // Processar despesas
      const despesasAgrupadas = (despesas || []).reduce((acc: any, item) => {
        const categoria = `Despesa ${item.categoria}`;
        if (!acc[categoria]) {
          acc[categoria] = { categoria, tipo: 'despesa', valor: 0, quantidade: 0 };
        }
        acc[categoria].valor += item.valor || 0;
        acc[categoria].quantidade += 1;
        return acc;
      }, {});

      const todosDados = { ...receitasAgrupadas, ...despesasAgrupadas };
      const valorTotal = Object.values(todosDados).reduce((sum: number, item: any) => sum + Math.abs(item.valor), 0);

      const resultado: RelatorioFluxo[] = Object.values(todosDados).map((item: any) => ({
        ...item,
        percentual: valorTotal > 0 ? (Math.abs(item.valor) / valorTotal) * 100 : 0
      }));

      setDadosRelatorio({
        tipo: 'fluxo',
        dados: resultado,
        totalReceitas: Object.values(receitasAgrupadas).reduce((sum: number, item: any) => sum + item.valor, 0),
        totalDespesas: Object.values(despesasAgrupadas).reduce((sum: number, item: any) => sum + item.valor, 0),
        periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de fluxo:', error);
      alert('Erro ao gerar relatório de fluxo');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioDespesas = async () => {
    setLoading(true);
    setRelatorioAtivo('despesas');
    
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('categoria, valor, status, data_vencimento, data_pagamento')
        .gte('data_vencimento', filtros.dataInicio)
        .lte('data_vencimento', filtros.dataFim);

      if (error) throw error;

      // Agrupar por categoria
      const agrupado = (data || []).reduce((acc: any, item) => {
        const categoria = item.categoria || 'Não informado';
        if (!acc[categoria]) {
          acc[categoria] = {
            categoria,
            valor_total: 0,
            valor_pago: 0,
            valor_pendente: 0,
            quantidade_total: 0,
            quantidade_paga: 0,
            quantidade_pendente: 0
          };
        }
        
        acc[categoria].valor_total += item.valor || 0;
        acc[categoria].quantidade_total += 1;
        
        if (item.status === 'Pago') {
          acc[categoria].valor_pago += item.valor || 0;
          acc[categoria].quantidade_paga += 1;
        } else {
          acc[categoria].valor_pendente += item.valor || 0;
          acc[categoria].quantidade_pendente += 1;
        }
        
        return acc;
      }, {});

      const valorTotal = Object.values(agrupado).reduce((sum: number, item: any) => sum + item.valor_total, 0);

      const resultado = Object.values(agrupado).map((item: any) => ({
        ...item,
        percentual: valorTotal > 0 ? (item.valor_total / valorTotal) * 100 : 0
      }));

      setDadosRelatorio({
        tipo: 'despesas',
        dados: resultado,
        total: valorTotal,
        periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de despesas:', error);
      alert('Erro ao gerar relatório de despesas');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioFolha = async () => {
    setLoading(true);
    setRelatorioAtivo('folha');
    
    try {
      // Buscar dados de folha CLT e PJ (simulando dados de RH)
      const { data: contasPagar, error } = await supabase
        .from('contas_pagar')
        .select('categoria, subcategoria, valor, status, data_vencimento, data_pagamento')
        .in('categoria', ['Folha de Pagamento', 'Encargos Sociais', 'Benefícios', 'RH'])
        .gte('data_vencimento', filtros.dataInicio)
        .lte('data_vencimento', filtros.dataFim);

      if (error) throw error;

      // Agrupar por tipo de folha
      const agrupado = (contasPagar || []).reduce((acc: any, item) => {
        let tipo = 'Outros';
        if (item.categoria === 'Folha de Pagamento') {
          tipo = item.subcategoria || 'CLT';
        } else if (item.categoria === 'Encargos Sociais') {
          tipo = 'Encargos';
        } else if (item.categoria === 'Benefícios') {
          tipo = 'Benefícios';
        }

        if (!acc[tipo]) {
          acc[tipo] = {
            tipo,
            valor_total: 0,
            valor_pago: 0,
            valor_pendente: 0,
            quantidade_total: 0,
            quantidade_paga: 0
          };
        }
        
        acc[tipo].valor_total += item.valor || 0;
        acc[tipo].quantidade_total += 1;
        
        if (item.status === 'Pago') {
          acc[tipo].valor_pago += item.valor || 0;
          acc[tipo].quantidade_paga += 1;
        } else {
          acc[tipo].valor_pendente += item.valor || 0;
        }
        
        return acc;
      }, {});

      const valorTotal = Object.values(agrupado).reduce((sum: number, item: any) => sum + item.valor_total, 0);

      const resultado = Object.values(agrupado).map((item: any) => ({
        ...item,
        percentual: valorTotal > 0 ? (item.valor_total / valorTotal) * 100 : 0
      }));

      setDadosRelatorio({
        tipo: 'folha',
        dados: resultado,
        total: valorTotal,
        periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de folha:', error);
      alert('Erro ao gerar relatório de folha');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioAnalytics = async () => {
    setLoading(true);
    setRelatorioAtivo('analytics');
    
    try {
      // Análise avançada de tendências
      const { data: receitas, error: errorReceitas } = await supabase
        .from('contas_receber')
        .select('origem, valor_liquido, data_vencimento, status')
        .gte('data_vencimento', filtros.dataInicio)
        .lte('data_vencimento', filtros.dataFim);

      if (errorReceitas) throw errorReceitas;

      const { data: despesas, error: errorDespesas } = await supabase
        .from('contas_pagar')
        .select('categoria, valor, data_vencimento, status')
        .gte('data_vencimento', filtros.dataInicio)
        .lte('data_vencimento', filtros.dataFim);

      if (errorDespesas) throw errorDespesas;

      // Análise por períodos (semanal)
      const analiseReceitas = (receitas || []).reduce((acc: any, item) => {
        const semana = new Date(item.data_vencimento).toISOString().split('T')[0];
        const origem = item.origem || 'Não informado';
        
        if (!acc[semana]) {
          acc[semana] = {};
        }
        if (!acc[semana][origem]) {
          acc[semana][origem] = { valor: 0, quantidade: 0 };
        }
        
        acc[semana][origem].valor += item.valor_liquido || 0;
        acc[semana][origem].quantidade += 1;
        
        return acc;
      }, {});

      // Estatísticas descritivas
      const valoresReceitas = (receitas || []).map(r => r.valor_liquido || 0);
      const valoresDespesas = (despesas || []).map(d => d.valor || 0);

      const estatisticas = {
        receitas: {
          total: valoresReceitas.reduce((a, b) => a + b, 0),
          media: valoresReceitas.length > 0 ? valoresReceitas.reduce((a, b) => a + b, 0) / valoresReceitas.length : 0,
          mediana: valoresReceitas.length > 0 ? valoresReceitas.sort((a, b) => a - b)[Math.floor(valoresReceitas.length / 2)] : 0,
          maximo: Math.max(...valoresReceitas, 0),
          minimo: Math.min(...valoresReceitas, 0)
        },
        despesas: {
          total: valoresDespesas.reduce((a, b) => a + b, 0),
          media: valoresDespesas.length > 0 ? valoresDespesas.reduce((a, b) => a + b, 0) / valoresDespesas.length : 0,
          mediana: valoresDespesas.length > 0 ? valoresDespesas.sort((a, b) => a - b)[Math.floor(valoresDespesas.length / 2)] : 0,
          maximo: Math.max(...valoresDespesas, 0),
          minimo: Math.min(...valoresDespesas, 0)
        }
      };

      setDadosRelatorio({
        tipo: 'analytics',
        dados: analiseReceitas,
        estatisticas,
        periodo: `${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório analytics:', error);
      alert('Erro ao gerar relatório analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = (dados: any[], nomeArquivo: string) => {
    const headers = Object.keys(dados[0] || {});
    const csvContent = [
      headers.join(','),
      ...dados.map(row => headers.map(header => 
        typeof row[header] === 'number' ? row[header].toLocaleString('pt-BR') : row[header]
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Filtros de Período
          </h3>
          <Calendar className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setDadosRelatorio(null)}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Botões de Relatórios */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Relatórios Disponíveis
          </h3>
          <FileText className="w-5 h-5 text-purple-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={gerarRelatorioReceitas}
            disabled={loading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="font-medium">Receitas por Origem</span>
            <span className="text-xs text-gray-500">Análise de receitas</span>
          </button>

          <button
            onClick={gerarRelatorioGlosas}
            disabled={loading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-8 h-8 text-green-500" />
            <span className="font-medium">Análise de Glosas</span>
            <span className="text-xs text-gray-500">Glosas por convênio</span>
          </button>

          <button
            onClick={gerarRelatorioFluxo}
            disabled={loading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <span className="font-medium">Fluxo de Caixa</span>
            <span className="text-xs text-gray-500">Receitas vs Despesas</span>
          </button>

          <button
            onClick={gerarRelatorioDespesas}
            disabled={loading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <Building className="w-8 h-8 text-red-500" />
            <span className="font-medium">Despesas por Categoria</span>
            <span className="text-xs text-gray-500">Análise de gastos</span>
          </button>

          <button
            onClick={gerarRelatorioFolha}
            disabled={loading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <Users className="w-8 h-8 text-orange-500" />
            <span className="font-medium">Relatório de Folha</span>
            <span className="text-xs text-gray-500">CLT + PJ + Encargos</span>
          </button>

          <button
            onClick={gerarRelatorioAnalytics}
            disabled={loading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <PieChart className="w-8 h-8 text-teal-500" />
            <span className="font-medium">Analytics Avançado</span>
            <span className="text-xs text-gray-500">Estatísticas descritivas</span>
          </button>
        </div>
      </div>

      {/* Resultados dos Relatórios */}
      {dadosRelatorio && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {dadosRelatorio.tipo === 'receitas' && 'Relatório de Receitas por Origem'}
                {dadosRelatorio.tipo === 'glosas' && 'Relatório de Análise de Glosas'}
                {dadosRelatorio.tipo === 'fluxo' && 'Relatório de Fluxo de Caixa'}
                {dadosRelatorio.tipo === 'despesas' && 'Relatório de Despesas por Categoria'}
                {dadosRelatorio.tipo === 'folha' && 'Relatório de Folha de Pagamento'}
                {dadosRelatorio.tipo === 'analytics' && 'Relatório de Analytics Avançado'}
              </h3>
              <p className="text-sm text-gray-500">Período: {dadosRelatorio.periodo}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportarCSV(dadosRelatorio.dados, dadosRelatorio.tipo)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Tabela de Resultados */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  {dadosRelatorio.tipo === 'analytics' ? (
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left" colSpan={6}>
                      Análise Estatística Detalhada
                    </th>
                  ) : (
                    <>
                      {dadosRelatorio.tipo === 'receitas' && (
                        <>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Origem</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Quantidade</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Total</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Médio</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Percentual</th>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'glosas' && (
                        <>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Convênio</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Bruto</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Líquido</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Glosa</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">% Glosa</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Qtd Guias</th>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'fluxo' && (
                        <>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Categoria</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-center">Tipo</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Quantidade</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Percentual</th>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'despesas' && (
                        <>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Categoria</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Total</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Pago</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Pendente</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Percentual</th>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'folha' && (
                        <>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Tipo</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Total</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Pago</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Valor Pendente</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Quantidade</th>
                          <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">Percentual</th>
                        </>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {dadosRelatorio.tipo === 'analytics' ? (
                  // Exibição especial para analytics
                  <tr>
                    <td colSpan={6} className="border border-gray-200 dark:border-gray-600 px-4 py-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Estatísticas de Receitas</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-medium">R$ {dadosRelatorio.estatisticas.receitas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Média:</span>
                              <span className="font-medium">R$ {dadosRelatorio.estatisticas.receitas.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mediana:</span>
                              <span className="font-medium">R$ {dadosRelatorio.estatisticas.receitas.mediana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Máximo:</span>
                              <span className="font-medium text-green-600">R$ {dadosRelatorio.estatisticas.receitas.maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mínimo:</span>
                              <span className="font-medium text-red-600">R$ {dadosRelatorio.estatisticas.receitas.minimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Estatísticas de Despesas</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-medium">R$ {dadosRelatorio.estatisticas.despesas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Média:</span>
                              <span className="font-medium">R$ {dadosRelatorio.estatisticas.despesas.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mediana:</span>
                              <span className="font-medium">R$ {dadosRelatorio.estatisticas.despesas.mediana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Máximo:</span>
                              <span className="font-medium text-green-600">R$ {dadosRelatorio.estatisticas.despesas.maximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mínimo:</span>
                              <span className="font-medium text-red-600">R$ {dadosRelatorio.estatisticas.despesas.minimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Análise Temporal</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Dados agrupados por período de vencimento: {Object.keys(dadosRelatorio.dados).length} períodos analisados
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dadosRelatorio.dados.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {dadosRelatorio.tipo === 'receitas' && (
                        <>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.origem}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.quantidade}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">R$ {item.valor_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.percentual.toFixed(1)}%</td>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'glosas' && (
                        <>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.convenio}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">R$ {item.valor_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">R$ {item.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-red-600">R$ {item.valor_glosa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-red-600">{item.percentual_glosa.toFixed(1)}%</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.quantidade_guias}</td>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'fluxo' && (
                        <>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.categoria}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.tipo}
                            </span>
                          </td>
                          <td className={`border border-gray-200 dark:border-gray-600 px-4 py-2 text-right ${
                            item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.tipo === 'receita' ? '+' : '-'}R$ {Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.quantidade}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.percentual.toFixed(1)}%</td>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'despesas' && (
                        <>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.categoria}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-green-600">R$ {item.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-red-600">R$ {item.valor_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.percentual.toFixed(1)}%</td>
                        </>
                      )}
                      {dadosRelatorio.tipo === 'folha' && (
                        <>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.tipo}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-green-600">R$ {item.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-red-600">R$ {item.valor_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.quantidade_total}</td>
                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">{item.percentual.toFixed(1)}%</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Resumo do Relatório */}
          {dadosRelatorio.tipo === 'fluxo' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-300">Total Receitas</div>
                <div className="text-xl font-bold text-green-600">
                  R$ {dadosRelatorio.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-sm text-red-700 dark:text-red-300">Total Despesas</div>
                <div className="text-xl font-bold text-red-600">
                  R$ {dadosRelatorio.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${
                dadosRelatorio.totalReceitas - dadosRelatorio.totalDespesas >= 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : 'bg-orange-50 dark:bg-orange-900/20'
              }`}>
                <div className={`text-sm ${
                  dadosRelatorio.totalReceitas - dadosRelatorio.totalDespesas >= 0 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-orange-700 dark:text-orange-300'
                }`}>
                  Resultado
                </div>
                <div className={`text-xl font-bold ${
                  dadosRelatorio.totalReceitas - dadosRelatorio.totalDespesas >= 0 
                    ? 'text-blue-600' 
                    : 'text-orange-600'
                }`}>
                  R$ {(dadosRelatorio.totalReceitas - dadosRelatorio.totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Gerando relatório...</span>
        </div>
      )}
    </div>
  );
}
