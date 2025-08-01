import React, { useState, useEffect } from 'react';
import { FileText, Users, Calendar, TrendingUp, Filter, Download } from 'lucide-react';

interface AtendimentoGuia {
  id: string;
  unidade: string;
  numeroGuia: string;
  pacienteNome: string;
  convenio: string;
  procedimento: string;
  valorGuia: number;
  dataAtendimento: string;
  profissional: string;
  status: 'Concluído' | 'Em Andamento' | 'Cancelado';
}

interface ResumoUnidade {
  unidade: string;
  totalAtendimentos: number;
  totalValor: number;
  ticketMedio: number;
}

export const AtendimentosGuiasTabuladas: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<AtendimentoGuia[]>([]);
  const [resumoUnidades, setResumoUnidades] = useState<ResumoUnidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroUnidade, setFiltroUnidade] = useState('');
  const [filtroConvenio, setFiltroConvenio] = useState('');
  const [periodo, setPeriodo] = useState('mes_atual');

  useEffect(() => {
    carregarAtendimentos();
  }, [filtroUnidade, filtroConvenio, periodo]);

  const carregarAtendimentos = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dadosSimulados: AtendimentoGuia[] = [
        {
          id: '1',
          unidade: 'Unidade Centro',
          numeroGuia: 'GT2025001',
          pacienteNome: 'João Silva Santos',
          convenio: 'Unimed',
          procedimento: 'Consulta Cardiológica',
          valorGuia: 180.00,
          dataAtendimento: '2025-01-15',
          profissional: 'Dr. Carlos Mendes',
          status: 'Concluído'
        },
        {
          id: '2',
          unidade: 'Unidade Centro',
          numeroGuia: 'GT2025002',
          pacienteNome: 'Maria Oliveira Lima',
          convenio: 'Bradesco Saúde',
          procedimento: 'Terapia Individual',
          valorGuia: 120.00,
          dataAtendimento: '2025-01-16',
          profissional: 'Dra. Ana Paula Rocha',
          status: 'Concluído'
        },
        {
          id: '3',
          unidade: 'Unidade Norte',
          numeroGuia: 'GT2025003',
          pacienteNome: 'Pedro Costa Almeida',
          convenio: 'SulAmérica',
          procedimento: 'Consulta Neurológica',
          valorGuia: 220.00,
          dataAtendimento: '2025-01-17',
          profissional: 'Dr. Roberto Ferreira',
          status: 'Concluído'
        },
        {
          id: '4',
          unidade: 'Unidade Sul',
          numeroGuia: 'GT2025004',
          pacienteNome: 'Ana Beatriz Santos',
          convenio: 'Unimed',
          procedimento: 'Terapia em Grupo',
          valorGuia: 80.00,
          dataAtendimento: '2025-01-18',
          profissional: 'Dra. Fernanda Silva',
          status: 'Em Andamento'
        },
        {
          id: '5',
          unidade: 'Unidade Norte',
          numeroGuia: 'GT2025005',
          pacienteNome: 'Carlos Eduardo Lima',
          convenio: 'Porto Seguro',
          procedimento: 'Avaliação Psicológica',
          valorGuia: 150.00,
          dataAtendimento: '2025-01-19',
          profissional: 'Dr. Marcos Antonio',
          status: 'Concluído'
        }
      ];

      setAtendimentos(dadosSimulados);

      // Calcular resumo por unidade
      const resumo = dadosSimulados.reduce((acc, atendimento) => {
        const unidade = acc.find(u => u.unidade === atendimento.unidade);
        if (unidade) {
          unidade.totalAtendimentos++;
          unidade.totalValor += atendimento.valorGuia;
          unidade.ticketMedio = unidade.totalValor / unidade.totalAtendimentos;
        } else {
          acc.push({
            unidade: atendimento.unidade,
            totalAtendimentos: 1,
            totalValor: atendimento.valorGuia,
            ticketMedio: atendimento.valorGuia
          });
        }
        return acc;
      }, [] as ResumoUnidade[]);

      setResumoUnidades(resumo);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const atendimentosFiltrados = atendimentos.filter(atendimento => {
    const matchUnidade = !filtroUnidade || atendimento.unidade === filtroUnidade;
    const matchConvenio = !filtroConvenio || atendimento.convenio === filtroConvenio;
    return matchUnidade && matchConvenio;
  });

  const totalGeral = atendimentosFiltrados.reduce((sum, a) => sum + a.valorGuia, 0);
  const totalAtendimentos = atendimentosFiltrados.length;
  const ticketMedio = totalAtendimentos > 0 ? totalGeral / totalAtendimentos : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Atendimentos por Guias Tabuladas</h2>
          <p className="text-gray-600">Acompanhe os atendimentos realizados através de guias de convênios</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900">{totalAtendimentos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unidades Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{resumoUnidades.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Unidades</option>
            <option value="Unidade Centro">Unidade Centro</option>
            <option value="Unidade Norte">Unidade Norte</option>
            <option value="Unidade Sul">Unidade Sul</option>
          </select>

          <select
            value={filtroConvenio}
            onChange={(e) => setFiltroConvenio(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Convênios</option>
            <option value="Unimed">Unimed</option>
            <option value="Bradesco Saúde">Bradesco Saúde</option>
            <option value="SulAmérica">SulAmérica</option>
            <option value="Porto Seguro">Porto Seguro</option>
          </select>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="mes_atual">Mês Atual</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
            <option value="ano">Ano</option>
          </select>
        </div>
      </div>

      {/* Resumo por Unidades */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resumo por Unidades</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumoUnidades.map((unidade) => (
              <div key={unidade.unidade} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">{unidade.unidade}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Atendimentos:</span>
                    <span className="font-medium">{unidade.totalAtendimentos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor Total:</span>
                    <span className="font-medium text-green-600">
                      R$ {unidade.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ticket Médio:</span>
                    <span className="font-medium">
                      R$ {unidade.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista Detalhada de Atendimentos */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Atendimentos Detalhados</h3>
        </div>
        
        {/* Versão Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guia / Paciente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade / Convênio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {atendimentosFiltrados.map((atendimento) => (
                <tr key={atendimento.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{atendimento.numeroGuia}</div>
                      <div className="text-sm text-gray-500">{atendimento.pacienteNome}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{atendimento.unidade}</div>
                      <div className="text-sm text-gray-500">{atendimento.convenio}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {atendimento.procedimento}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    R$ {atendimento.valorGuia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      atendimento.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      atendimento.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {atendimento.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão Mobile - Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {atendimentosFiltrados.map((atendimento) => (
            <div key={atendimento.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Guia: {atendimento.numeroGuia}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {atendimento.pacienteNome}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  atendimento.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                  atendimento.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {atendimento.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Procedimento</p>
                  <p className="text-sm font-medium text-gray-900">{atendimento.procedimento}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valor</p>
                  <p className="text-sm font-bold text-gray-900">
                    R$ {atendimento.valorGuia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Unidade</p>
                  <p className="text-sm text-gray-900">{atendimento.unidade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="text-sm text-gray-900">
                    {new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="mt-2">
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {atendimento.convenio}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
