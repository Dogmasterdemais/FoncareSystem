import React, { useState, useEffect } from 'react';
import { FileText, Users, Calendar, TrendingUp, Filter, Download } from 'lucide-react';

interface AtendimentoGuia {
  id: string;
  unidadeId: string;
  unidadeNome: string;
  numeroGuia: string;
  pacienteNome: string;
  convenio: string;
  procedimento: string;
  valorGuia: number;
  dataAtendimento: string;
  profissional: string;
  status: 'Realizado' | 'Agendado' | 'Cancelado';
  observacoes?: string;
}

interface ResumoUnidadeGuias {
  unidadeId: string;
  unidadeNome: string;
  totalAtendimentos: number;
  totalValor: number;
  ticketMedio: number;
  guiasPorConvenio: { [convenio: string]: { quantidade: number; valor: number } };
  atendimentosPorMes: { [mes: string]: number };
}

export const AtendimentosGuiasTabuladas: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<AtendimentoGuia[]>([]);
  const [resumoUnidades, setResumoUnidades] = useState<ResumoUnidadeGuias[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    unidade: '',
    convenio: '',
    periodo: 'mes_atual',
    dataInicio: '',
    dataFim: ''
  });

  useEffect(() => {
    carregarAtendimentos();
  }, [filtros]);

  const carregarAtendimentos = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados - em produção, chamar API real
      await new Promise(resolve => setTimeout(resolve, 1000));

      const atendimentosSimulados: AtendimentoGuia[] = [
        {
          id: '1',
          unidadeId: '1',
          unidadeNome: 'Unidade Centro',
          numeroGuia: 'GT2025001',
          pacienteNome: 'João Silva Santos',
          convenio: 'Unimed',
          procedimento: 'Consulta Cardiológica',
          valorGuia: 180.00,
          dataAtendimento: '2025-01-15',
          profissional: 'Dr. Carlos Mendes',
          status: 'Realizado'
        },
        {
          id: '2',
          unidadeId: '1',
          unidadeNome: 'Unidade Centro',
          numeroGuia: 'GT2025002',
          pacienteNome: 'Maria Oliveira Lima',
          convenio: 'Bradesco Saúde',
          procedimento: 'Terapia Individual',
          valorGuia: 120.00,
          dataAtendimento: '2025-01-16',
          profissional: 'Dra. Ana Paula Rocha',
          status: 'Realizado'
        },
        {
          id: '3',
          unidadeId: '2',
          unidadeNome: 'Unidade Norte',
          numeroGuia: 'GT2025003',
          pacienteNome: 'Pedro Costa Almeida',
          convenio: 'SulAmérica',
          procedimento: 'Consulta Neurológica',
          valorGuia: 220.00,
          dataAtendimento: '2025-01-17',
          profissional: 'Dr. Roberto Ferreira',
          status: 'Realizado'
        },
        {
          id: '4',
          unidadeId: '1',
          unidadeNome: 'Unidade Centro',
          numeroGuia: 'GT2025004',
          pacienteNome: 'Ana Beatriz Santos',
          convenio: 'Unimed',
          procedimento: 'Terapia em Grupo',
          valorGuia: 80.00,
          dataAtendimento: '2025-01-18',
          profissional: 'Dra. Fernanda Silva',
          status: 'Realizado'
        },
        {
          id: '5',
          unidadeId: '3',
          unidadeNome: 'Unidade Sul',
          numeroGuia: 'GT2025005',
          pacienteNome: 'Carlos Eduardo Lima',
          convenio: 'Amil',
          procedimento: 'Consulta Psiquiátrica',
          valorGuia: 200.00,
          dataAtendimento: '2025-01-19',
          profissional: 'Dr. Marcos Antônio',
          status: 'Realizado'
        },
        {
          id: '6',
          unidadeId: '2',
          unidadeNome: 'Unidade Norte',
          numeroGuia: 'GT2025006',
          pacienteNome: 'Fernanda Rodrigues',
          convenio: 'Bradesco Saúde',
          procedimento: 'Avaliação Neuropsicológica',
          valorGuia: 300.00,
          dataAtendimento: '2025-01-20',
          profissional: 'Dra. Luciana Martins',
          status: 'Agendado'
        }
      ];

      setAtendimentos(atendimentosSimulados);

      // Calcular resumo por unidade
      const resumo = calcularResumoUnidades(atendimentosSimulados);
      setResumoUnidades(resumo);

    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularResumoUnidades = (atendimentos: AtendimentoGuia[]): ResumoUnidadeGuias[] => {
    const unidadesMap = new Map<string, ResumoUnidadeGuias>();

    atendimentos.forEach(atendimento => {
      if (atendimento.status !== 'Realizado') return;

      const { unidadeId, unidadeNome, convenio, valorGuia, dataAtendimento } = atendimento;

      if (!unidadesMap.has(unidadeId)) {
        unidadesMap.set(unidadeId, {
          unidadeId,
          unidadeNome,
          totalAtendimentos: 0,
          totalValor: 0,
          ticketMedio: 0,
          guiasPorConvenio: {},
          atendimentosPorMes: {}
        });
      }

      const resumo = unidadesMap.get(unidadeId)!;
      resumo.totalAtendimentos++;
      resumo.totalValor += valorGuia;

      // Agrupar por convênio
      if (!resumo.guiasPorConvenio[convenio]) {
        resumo.guiasPorConvenio[convenio] = { quantidade: 0, valor: 0 };
      }
      resumo.guiasPorConvenio[convenio].quantidade++;
      resumo.guiasPorConvenio[convenio].valor += valorGuia;

      // Agrupar por mês
      const mes = new Date(dataAtendimento).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: '2-digit' 
      });
      if (!resumo.atendimentosPorMes[mes]) {
        resumo.atendimentosPorMes[mes] = 0;
      }
      resumo.atendimentosPorMes[mes]++;
    });

    // Calcular ticket médio
    Array.from(unidadesMap.values()).forEach(resumo => {
      resumo.ticketMedio = resumo.totalAtendimentos > 0 
        ? resumo.totalValor / resumo.totalAtendimentos 
        : 0;
    });

    return Array.from(unidadesMap.values());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportarRelatorio = () => {
    // Simular exportação - em produção, gerar arquivo real
    const csvContent = [
      'Unidade,Número Guia,Paciente,Convênio,Procedimento,Valor,Data,Profissional,Status',
      ...atendimentos.map(a => 
        `${a.unidadeNome},${a.numeroGuia},${a.pacienteNome},${a.convenio},${a.procedimento},${a.valorGuia},${a.dataAtendimento},${a.profissional},${a.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atendimentos_guias_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalGeral = resumoUnidades.reduce((acc, unidade) => ({
    atendimentos: acc.atendimentos + unidade.totalAtendimentos,
    valor: acc.valor + unidade.totalValor
  }), { atendimentos: 0, valor: 0 });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Atendimentos por Guias Tabuladas</h2>
          <p className="text-sm text-gray-600">Análise detalhada de atendimentos e valores por unidade</p>
        </div>
        
        <button
          onClick={exportarRelatorio}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
            <select
              value={filtros.unidade}
              onChange={(e) => setFiltros(prev => ({ ...prev, unidade: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as Unidades</option>
              <option value="1">Unidade Centro</option>
              <option value="2">Unidade Norte</option>
              <option value="3">Unidade Sul</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Convênio</label>
            <select
              value={filtros.convenio}
              onChange={(e) => setFiltros(prev => ({ ...prev, convenio: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Convênios</option>
              <option value="Unimed">Unimed</option>
              <option value="Bradesco Saúde">Bradesco Saúde</option>
              <option value="SulAmérica">SulAmérica</option>
              <option value="Amil">Amil</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mes_atual">Mês Atual</option>
              <option value="trimestre">Trimestre</option>
              <option value="semestre">Semestre</option>
              <option value="ano">Ano</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={carregarAtendimentos}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900">{totalGeral.atendimentos}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total das Guias</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGeral.valor)}</p>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio Geral</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalGeral.atendimentos > 0 ? formatCurrency(totalGeral.valor / totalGeral.atendimentos) : 'R$ 0,00'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Resumo por Unidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumo por Unidade</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumoUnidades.map((unidade) => (
            <div key={unidade.unidadeId} className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{unidade.unidadeNome}</h4>
                <span className="text-sm text-gray-500">{unidade.totalAtendimentos} atendimentos</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(unidade.totalValor)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(unidade.ticketMedio)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900">Por Convênio:</h5>
                {Object.entries(unidade.guiasPorConvenio).map(([convenio, dados]) => (
                  <div key={convenio} className="flex justify-between text-sm">
                    <span className="text-gray-600">{convenio}:</span>
                    <span className="font-medium">
                      {dados.quantidade} guias - {formatCurrency(dados.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista Detalhada de Atendimentos */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Atendimentos Detalhados</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guia / Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade / Convênio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {atendimentos.map((atendimento) => (
                <tr key={atendimento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{atendimento.numeroGuia}</div>
                      <div className="text-sm text-gray-500">{atendimento.pacienteNome}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{atendimento.unidadeNome}</div>
                      <div className="text-sm text-gray-500">{atendimento.convenio}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{atendimento.procedimento}</div>
                    <div className="text-sm text-gray-500">{atendimento.profissional}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(atendimento.valorGuia)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      atendimento.status === 'Realizado' 
                        ? 'bg-green-100 text-green-800'
                        : atendimento.status === 'Agendado'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {atendimento.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
