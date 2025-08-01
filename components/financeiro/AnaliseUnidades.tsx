import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Building2, Users, DollarSign, Activity } from 'lucide-react';

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
      // Simular carregamento de dados - em produção, chamar API real
      await new Promise(resolve => setTimeout(resolve, 1500));

      const dadosSimulados: DadosUnidade[] = [
        {
          id: '1',
          nome: 'Unidade Centro',
          receitas: {
            particular: 45000,
            guiasTabuladas: 78000,
            convenios: 32000,
            total: 155000
          },
          despesas: {
            folhaClt: 45000,
            folhaPj: 25000,
            fixas: 15000,
            variaveis: 8000,
            consumo: 12000,
            total: 105000
          },
          atendimentos: {
            totalPacientes: 320,
            guiasTabuladas: 195,
            particular: 125,
            ticketMedio: 484.38
          },
          resultado: {
            superavit: 50000,
            percentualMargem: 32.26,
            status: 'lucro'
          }
        },
        {
          id: '2',
          nome: 'Unidade Norte',
          receitas: {
            particular: 28000,
            guiasTabuladas: 52000,
            convenios: 18000,
            total: 98000
          },
          despesas: {
            folhaClt: 38000,
            folhaPj: 20000,
            fixas: 18000,
            variaveis: 12000,
            consumo: 15000,
            total: 103000
          },
          atendimentos: {
            totalPacientes: 245,
            guiasTabuladas: 130,
            particular: 115,
            ticketMedio: 400.00
          },
          resultado: {
            superavit: -5000,
            percentualMargem: -5.10,
            status: 'prejuizo'
          }
        },
        {
          id: '3',
          nome: 'Unidade Sul',
          receitas: {
            particular: 35000,
            guiasTabuladas: 65000,
            convenios: 25000,
            total: 125000
          },
          despesas: {
            folhaClt: 42000,
            folhaPj: 22000,
            fixas: 16000,
            variaveis: 10000,
            consumo: 14000,
            total: 104000
          },
          atendimentos: {
            totalPacientes: 280,
            guiasTabuladas: 162,
            particular: 118,
            ticketMedio: 446.43
          },
          resultado: {
            superavit: 21000,
            percentualMargem: 16.80,
            status: 'lucro'
          }
        }
      ];

      setDadosUnidades(dadosSimulados);
    } catch (error) {
      console.error('Erro ao carregar dados das unidades:', error);
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
