import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TrendingUp, TrendingDown, Building2, Users, DollarSign, Activity } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DadosUnidade {
  id: string;
  nome: string;
  receitas: {
    particular: number;
    guiasTabuladas: number;
    convenios: number;
    total: number;
  };
  despesas: {
    folhaClt: number;
    folhaPj: number;
    fixas: number;
    variaveis: number;
    consumo: number;
    total: number;
  };
  atendimentos: {
    totalPacientes: number;
    guiasTabuladas: number;
    particular: number;
    ticketMedio: number;
  };
  resultado: {
    superavit: number;
    percentualMargem: number;
    status: 'lucro' | 'prejuizo' | 'equilibrio';
  };
}

export const AnaliseUnidades: React.FC = () => {
  const [dadosUnidades, setDadosUnidades] = useState<DadosUnidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes_atual');

  useEffect(() => {
    carregarDadosUnidades();
  }, [periodoSelecionado]);

  const carregarDadosUnidades = async () => {
    setLoading(true);
    try {
      // Usar a view que criamos para análise de superávit
      const { data, error } = await supabase
        .from('vw_analise_superavit_unidades')
        .select('*');

      if (error) throw error;

      // Mapear dados da view para a interface do componente
      const dadosFormatados: DadosUnidade[] = (data || []).map(unidade => ({
        id: unidade.unidade_id,
        nome: unidade.unidade_nome,
        receitas: {
          particular: unidade.receita_particular || 0,
          guiasTabuladas: unidade.receita_guias || 0,
          convenios: unidade.receita_convenios || 0,
          total: unidade.receita_total || 0
        },
        despesas: {
          folhaClt: 0, // TODO: Implementar quando houver tabela de folha CLT
          folhaPj: 0, // TODO: Implementar quando houver tabela de folha PJ
          fixas: unidade.despesa_fixa || 0,
          variaveis: unidade.despesa_variavel || 0,
          consumo: unidade.despesa_consumo || 0,
          total: unidade.despesa_total || 0
        },
        atendimentos: {
          totalPacientes: unidade.total_atendimentos || 0,
          guiasTabuladas: unidade.atendimentos_guias || 0,
          particular: unidade.atendimentos_particular || 0,
          ticketMedio: unidade.ticket_medio || 0
        },
        resultado: {
          superavit: unidade.resultado || 0,
          percentualMargem: unidade.percentual_margem || 0,
          status: unidade.status_resultado === 'lucro' ? 'lucro' : 
                   unidade.status_resultado === 'prejuizo' ? 'prejuizo' : 'equilibrio'
        }
      }));

      setDadosUnidades(dadosFormatados);
    } catch (error) {
      console.error('Erro ao carregar dados das unidades:', error);
      setDadosUnidades([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lucro':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'prejuizo':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lucro':
        return 'text-green-600 bg-green-100';
      case 'prejuizo':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const totalGeral = dadosUnidades.reduce((acc, unidade) => ({
    receitas: acc.receitas + unidade.receitas.total,
    despesas: acc.despesas + unidade.despesas.total,
    superavit: acc.superavit + unidade.resultado.superavit,
    atendimentos: acc.atendimentos + unidade.atendimentos.totalPacientes
  }), { receitas: 0, despesas: 0, superavit: 0, atendimentos: 0 });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise por Unidade</h2>
          <p className="text-sm text-gray-600">Superávit financeiro e atendimentos por unidade</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="mes_atual">Mês Atual</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
            <option value="ano">Ano</option>
          </select>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGeral.receitas)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesa Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGeral.despesas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resultado Geral</p>
              <p className={`text-2xl font-bold ${totalGeral.superavit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalGeral.superavit)}
              </p>
            </div>
            {totalGeral.superavit >= 0 ? 
              <TrendingUp className="h-8 w-8 text-green-500" /> : 
              <TrendingDown className="h-8 w-8 text-red-500" />
            }
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900">{totalGeral.atendimentos.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Cards das Unidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dadosUnidades.map((unidade) => (
          <div key={unidade.id} className="bg-white rounded-lg shadow-lg border overflow-hidden">
            {/* Cabeçalho da Unidade */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{unidade.nome}</h3>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unidade.resultado.status)}`}>
                  {getStatusIcon(unidade.resultado.status)}
                  <span className="capitalize">{unidade.resultado.status}</span>
                </div>
              </div>
            </div>

            {/* Conteúdo da Unidade */}
            <div className="p-4 space-y-4">
              {/* Resultado Principal */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Resultado do Período</p>
                <p className={`text-2xl font-bold ${unidade.resultado.superavit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(unidade.resultado.superavit)}
                </p>
                <p className={`text-sm ${unidade.resultado.percentualMargem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Margem: {unidade.resultado.percentualMargem.toFixed(1)}%
                </p>
              </div>

              {/* Receitas */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Receitas</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Particular:</span>
                    <span className="font-medium">{formatCurrency(unidade.receitas.particular)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guias Tabuladas:</span>
                    <span className="font-medium">{formatCurrency(unidade.receitas.guiasTabuladas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Convênios:</span>
                    <span className="font-medium">{formatCurrency(unidade.receitas.convenios)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(unidade.receitas.total)}</span>
                  </div>
                </div>
              </div>

              {/* Atendimentos */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Atendimentos</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pacientes:</span>
                    <span className="font-medium">{unidade.atendimentos.totalPacientes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guias Tabuladas:</span>
                    <span className="font-medium">{unidade.atendimentos.guiasTabuladas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Particular:</span>
                    <span className="font-medium">{unidade.atendimentos.particular}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Ticket Médio:</span>
                    <span>{formatCurrency(unidade.atendimentos.ticketMedio)}</span>
                  </div>
                </div>
              </div>

              {/* Principais Despesas */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Principais Despesas</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Folha CLT:</span>
                    <span className="font-medium">{formatCurrency(unidade.despesas.folhaClt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Folha PJ:</span>
                    <span className="font-medium">{formatCurrency(unidade.despesas.folhaPj)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Custos Fixos:</span>
                    <span className="font-medium">{formatCurrency(unidade.despesas.fixas)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(unidade.despesas.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
