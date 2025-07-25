'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import { moduloTerapeuticoService } from '../lib/moduloTerapeuticoService';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Eye, 
  Edit, 
  AlertTriangle,
  Filter,
  Calendar,
  MessageSquare,
  Download,
  RefreshCw,
  Shield,
  Users,
  DollarSign,
  FileText,
  UserCheck,
  XCircle
} from 'lucide-react';

interface EvolucaoSessao {
  id: string;
  agendamento_id: string;
  evolucao_texto: string;
  data_evolucao: string;
  supervisionado: boolean;
  data_supervisao?: string;
  supervisor_id?: string;
  observacoes_supervisao?: string;
  agendamento: {
    paciente: { nome: string; id: string };
    profissional: { nome_completo: string; id: string };
    data_agendamento: string;
    horario_inicio: string;
    horario_fim: string;
    especialidade: { nome: string };
    sala: { nome: string };
  };
  supervisor?: { nome_completo: string };
}

interface AtendimentoParaSupervisao {
  id: string;
  data_atendimento: string;
  horario_inicio: string;
  horario_fim: string;
  duracao_minutos: number;
  valor_sessao: number;
  valor_a_pagar: number;
  evolucao_feita: boolean;
  supervisionado: boolean;
  pagamento_liberado: boolean;
  paciente: {
    nome: string;
    id: string;
  };
  profissional: {
    nome_completo: string;
    id: string;
  };
  evolucao?: {
    id: string;
    conteudo: string;
    data_criacao: string;
  };
}

interface FiltrosSupervisao {
  periodo: string;
  profissional: string;
  especialidade: string;
  status: string;
  supervisor: string;
  periodo_inicio?: string;
  periodo_fim?: string;
  apenas_pendentes?: boolean;
  profissional_id?: string;
}

function SupervisaoTerapeuticaPage() {
  const [evolucoes, setEvolucoes] = useState<EvolucaoSessao[]>([]);
  const [atendimentos, setAtendimentos] = useState<AtendimentoParaSupervisao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosSupervisao>({
    periodo: 'ultimos_7_dias',
    profissional: '',
    especialidade: '',
    status: '',
    supervisor: '',
    periodo_inicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    periodo_fim: new Date().toISOString().split('T')[0],
    apenas_pendentes: true,
    profissional_id: ''
  });
  const [evolucaoSelecionada, setEvolucaoSelecionada] = useState<EvolucaoSessao | null>(null);
  const [modalSupervisao, setModalSupervisao] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<AtendimentoParaSupervisao | null>(null);
  const [observacoesSupervisao, setObservacoesSupervisao] = useState('');
  const [processandoSupervisao, setProcessandoSupervisao] = useState(false);

  const [estatisticas, setEstatisticas] = useState({
    total_evolucoes: 0,
    pendentes_supervisao: 0,
    supervisionadas: 0,
    taxa_supervisao: 0,
    total_atendimentos: 0,
    valor_total_pendente: 0,
    valor_total_liberado: 0
  });

  useEffect(() => {
    carregarAtendimentos()
  }, [filtros])

  const carregarAtendimentos = async () => {
    try {
      setLoading(true)
      const { data } = await moduloTerapeuticoService.buscarAgendamentosTerapeuticos({
        unidadeId: '',
        data: filtros.periodo_inicio,
        profissionalId: filtros.profissional_id
      })

      let atendimentosFiltrados = data || []
      
      if (filtros.apenas_pendentes) {
        atendimentosFiltrados = atendimentosFiltrados.filter((a: any) => !a.supervisionado && a.evolucao_realizada)
      }

      // Converter para formato esperado
      const atendimentosConvertidos: AtendimentoParaSupervisao[] = atendimentosFiltrados.map((a: any) => ({
        id: a.id,
        data_atendimento: a.data_agendamento,
        horario_inicio: a.horario_inicio,
        horario_fim: a.horario_fim,
        duracao_minutos: a.duracao_minutos,
        valor_sessao: 100, // Valor padrão - deve vir do banco
        valor_a_pagar: a.liberado_pagamento ? 100 : 0,
        evolucao_feita: a.evolucao_realizada,
        supervisionado: a.supervisionado,
        pagamento_liberado: a.liberado_pagamento,
        paciente: {
          nome: a.pacientes?.nome || 'Paciente não informado',
          id: a.paciente_id
        },
        profissional: {
          nome_completo: a.colaboradores?.nome_completo || 'Profissional não informado',
          id: a.profissional_id
        }
      }))

      setAtendimentos(atendimentosConvertidos)
      calcularEstatisticas(atendimentosConvertidos)
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = (atendimentos: AtendimentoParaSupervisao[]) => {
    const stats = {
      total_evolucoes: atendimentos.filter(a => a.evolucao_feita).length,
      total_atendimentos: atendimentos.length,
      pendentes_supervisao: atendimentos.filter(a => !a.supervisionado && a.evolucao_feita).length,
      supervisionadas: atendimentos.filter(a => a.supervisionado).length,
      taxa_supervisao: atendimentos.length > 0 ? (atendimentos.filter(a => a.supervisionado).length / atendimentos.length) * 100 : 0,
      valor_total_pendente: atendimentos
        .filter(a => !a.supervisionado && a.evolucao_feita)
        .reduce((sum, a) => sum + a.valor_sessao * 0.5, 0), // 50% até supervisão
      valor_total_liberado: atendimentos
        .filter(a => a.supervisionado)
        .reduce((sum, a) => sum + a.valor_a_pagar, 0)
    }
    setEstatisticas(stats)
  }

  const supervisionarAtendimento = async (atendimentoId: string, aprovar: boolean = true) => {
    try {
      if (aprovar) {
        await moduloTerapeuticoService.atualizarStatusTerapeutico(
          atendimentoId, 
          'sessao_concluida',
          observacoesSupervisao
        )
      } else {
        // Implementar rejeição da supervisão se necessário
      }

      await carregarAtendimentos()
      fecharModalDetalhes()
    } catch (error) {
      console.error('Erro ao supervisionar atendimento:', error)
    }
  }

  const abrirModalDetalhes = (atendimento: AtendimentoParaSupervisao) => {
    setAtendimentoSelecionado(atendimento)
    setObservacoesSupervisao('')
    setModalDetalhes(true)
  }

  const fecharModalDetalhes = () => {
    setModalDetalhes(false)
    setAtendimentoSelecionado(null)
    setObservacoesSupervisao('')
  }

  const exportarRelatorio = async () => {
    try {
      const dados = await moduloTerapeuticoService.buscarDashboardTerapeutico()
      
      // Implementar download do arquivo Excel
      console.log('Exportando relatório:', dados)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
    }
  }

  const getStatusBadge = (atendimento: AtendimentoParaSupervisao) => {
    if (!atendimento.evolucao_feita) {
      return { cor: 'bg-red-100 text-red-700', texto: 'Sem Evolução' }
    }
    if (!atendimento.supervisionado) {
      return { cor: 'bg-yellow-100 text-yellow-700', texto: 'Aguarda Supervisão' }
    }
    if (atendimento.pagamento_liberado) {
      return { cor: 'bg-green-100 text-green-700', texto: 'Pagamento Liberado' }
    }
    return { cor: 'bg-blue-100 text-blue-700', texto: 'Supervisionado' }
  }

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarDataHora = (dataHora: string) => {
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <MainLayout>
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-800 text-white p-6 rounded-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Supervisão Terapêutica</h1>
            <p className="text-purple-100">Validação de atendimentos e liberação de pagamentos profissionais</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportarRelatorio}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Relatório
            </button>
            <button
              onClick={carregarAtendimentos}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Atendimentos</p>
              <p className="text-2xl font-bold text-blue-800">{atendimentos.length}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pendentes Supervisão</p>
              <p className="text-2xl font-bold text-yellow-800">
                {atendimentos.filter(a => !a.supervisionado).length}
              </p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Supervisionados</p>
              <p className="text-2xl font-bold text-green-800">
                {atendimentos.filter(a => a.supervisionado).length}
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-purple-800">
                R$ {atendimentos.reduce((total, a) => total + a.valor_a_pagar, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filtros.periodo_inicio || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, periodo_inicio: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filtros.periodo_fim || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, periodo_fim: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
            <select
              value={filtros.profissional_id || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, profissional_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos os profissionais</option>
              {/* Implementar lista de profissionais */}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filtros.apenas_pendentes || false}
                onChange={(e) => setFiltros(prev => ({ ...prev, apenas_pendentes: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Apenas pendentes</span>
            </label>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Atendimentos</p>
              <p className="text-2xl font-bold text-blue-600">{estatisticas.total_atendimentos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pendentes Supervisão</p>
              <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes_supervisao}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Valor Pendente</p>
              <p className="text-xl font-bold text-red-600">{formatarValor(estatisticas.valor_total_pendente)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Valor Liberado</p>
              <p className="text-xl font-bold text-green-600">{formatarValor(estatisticas.valor_total_liberado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Atendimentos para Supervisão</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {atendimentos.map((atendimento) => {
                const status = getStatusBadge(atendimento)
                
                return (
                  <tr key={atendimento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{atendimento.paciente.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {atendimento.profissional.nome_completo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{formatarDataHora(atendimento.horario_inicio)}</div>
                          <div className="text-xs text-gray-500">{atendimento.duracao_minutos}min</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Terapia
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Sala Principal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatarValor(atendimento.valor_sessao)}</div>
                      <div className="text-xs text-gray-500">
                        100% = {formatarValor(atendimento.valor_a_pagar)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.cor}`}>
                        {status.texto}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModalDetalhes(atendimento)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        {!atendimento.supervisionado && atendimento.evolucao_feita && (
                          <button
                            onClick={() => supervisionarAtendimento(atendimento.id)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprovar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {atendimentos.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum atendimento encontrado para os filtros selecionados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {modalDetalhes && atendimentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalhes do Atendimento</h2>
            
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paciente</label>
                  <p className="text-gray-900">{atendimentoSelecionado.paciente.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profissional</label>
                  <p className="text-gray-900">{atendimentoSelecionado.profissional.nome_completo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                  <p className="text-gray-900">Terapia</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sala</label>
                  <p className="text-gray-900">Sala Principal</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data/Hora</label>
                  <p className="text-gray-900">{formatarDataHora(atendimentoSelecionado.horario_inicio)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duração</label>
                  <p className="text-gray-900">{atendimentoSelecionado.duracao_minutos} minutos</p>
                </div>
              </div>

              {/* Informações Financeiras */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Informações Financeiras</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor da Sessão</label>
                    <p className="text-lg font-bold text-gray-900">{formatarValor(atendimentoSelecionado.valor_sessao)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Percentual</label>
                    <p className="text-lg font-bold text-blue-600">100%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor a Pagar</label>
                    <p className="text-lg font-bold text-green-600">{formatarValor(atendimentoSelecionado.valor_a_pagar)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Status do Atendimento</h3>
                <div className="flex gap-4">
                  <div className={`flex items-center gap-2 ${atendimentoSelecionado.evolucao_feita ? 'text-green-600' : 'text-red-600'}`}>
                    {atendimentoSelecionado.evolucao_feita ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span>Evolução {atendimentoSelecionado.evolucao_feita ? 'Feita' : 'Pendente'}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${atendimentoSelecionado.supervisionado ? 'text-green-600' : 'text-yellow-600'}`}>
                    {atendimentoSelecionado.supervisionado ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span>Supervisão {atendimentoSelecionado.supervisionado ? 'Aprovada' : 'Pendente'}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${atendimentoSelecionado.pagamento_liberado ? 'text-green-600' : 'text-gray-600'}`}>
                    {atendimentoSelecionado.pagamento_liberado ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span>Pagamento {atendimentoSelecionado.pagamento_liberado ? 'Liberado' : 'Pendente'}</span>
                  </div>
                </div>
              </div>

              {/* Observações da Supervisão */}
              {!atendimentoSelecionado.supervisionado && atendimentoSelecionado.evolucao_feita && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações da Supervisão</label>
                  <textarea
                    value={observacoesSupervisao}
                    onChange={(e) => setObservacoesSupervisao(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Adicione observações sobre a supervisão..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharModalDetalhes}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              {!atendimentoSelecionado.supervisionado && atendimentoSelecionado.evolucao_feita && (
                <button
                  onClick={() => supervisionarAtendimento(atendimentoSelecionado.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Aprovar e Liberar Pagamento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default SupervisaoTerapeuticaPage;
