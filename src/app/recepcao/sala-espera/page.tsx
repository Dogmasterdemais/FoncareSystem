'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import { useUnidade } from '../../../context/UnidadeContext';
import { supabase } from '../../../lib/supabaseClient';
import { Clock, Users, FileText, CheckCircle, AlertCircle, Loader2, Grid3X3, List } from 'lucide-react';

interface AgendamentoEspera {
  id: string;
  paciente_nome: string;
  especialidade_nome: string;
  sala_nome: string;
  sala_cor: string;
  profissional_nome: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  data_chegada: string | null;
  convenio_nome: string;
  codigo_autorizacao: string | null;
  numero_guia: string | null;
  data_autorizacao: string | null;
  validade_autorizacao: string | null;
  numero_agendamento: string | null;
  valor_procedimento: number | null;
}

interface ModalGuiaData {
  codigo_autorizacao: string;
  numero_guia: string;
  data_autorizacao: string;
  validade_autorizacao: string;
}

interface ProcedimentoTuss {
  id: string;
  codigo_tuss: string;
  dados_lista_suspensa: string;
  especialidade: string;
  valor: string;
  convenio_nome: string;
}

export default function SalaEsperaPage() {
  const { unidadeSelecionada } = useUnidade();
  const [agendamentos, setAgendamentos] = useState<AgendamentoEspera[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalGuia, setMostrarModalGuia] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoEspera | null>(null);
  const [procedimentosConvenio, setProcedimentosConvenio] = useState<ProcedimentoTuss[]>([]);
  const [loadingProcedimentos, setLoadingProcedimentos] = useState(false);
  const [visaoLista, setVisaoLista] = useState(false);
  const [dadosGuia, setDadosGuia] = useState<ModalGuiaData>({
    codigo_autorizacao: '',
    numero_guia: '',
    data_autorizacao: '',
    validade_autorizacao: ''
  });

  useEffect(() => {
    if (unidadeSelecionada) {
      fetchAgendamentosHoje();
    }
  }, [unidadeSelecionada]);

  const fetchAgendamentosHoje = async () => {
    try {
      setLoading(true);
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('unidade_id', unidadeSelecionada)
        .eq('data_agendamento', hoje)
        .in('status', ['agendado', 'confirmado', 'chegou', 'aguardando', 'faltou', 'pronto_para_terapia'])
        .order('horario_inicio');

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return;
      }

      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarChegada = async (agendamentoId: string) => {
    try {
      console.log('=== CONFIRMAR CHEGADA ===');
      console.log('ID do agendamento específico:', agendamentoId);
      console.log('Tipo do ID:', typeof agendamentoId);
      
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ 
          data_chegada: new Date().toISOString(),
          status: 'chegou',
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId)
        .select();

      if (error) {
        console.error('Erro ao confirmar chegada:', error);
        alert(`Erro ao confirmar chegada: ${error.message}`);
        return;
      }

      console.log('Registros atualizados:', data);
      console.log('Quantidade de registros atualizados:', data ? data.length : 0);

      if (data && data.length > 0) {
        console.log('Chegada confirmada com sucesso para:', data[0]);
        alert('Chegada confirmada com sucesso!');
        
        // Atualizar lista
        await fetchAgendamentosHoje();
      } else {
        console.warn('Nenhum registro foi atualizado');
        alert('Agendamento não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao confirmar chegada:', error);
      alert(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const marcarFalta = async (agendamentoId: string) => {
    try {
      console.log('Marcando falta para agendamento:', agendamentoId);
      
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ 
          status: 'faltou',
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId)
        .select();

      if (error) {
        console.error('Erro ao marcar falta:', error);
        alert(`Erro ao marcar falta: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        console.log('Falta marcada com sucesso:', data[0]);
        alert('Falta registrada com sucesso!');
        // Atualizar lista
        fetchAgendamentosHoje();
      } else {
        console.warn('Nenhum registro foi atualizado');
        alert('Agendamento não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao marcar falta:', error);
      alert(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const fetchProcedimentosConvenio = async (convenioNome: string) => {
    try {
      setLoadingProcedimentos(true);
      
      const { data, error } = await supabase
        .from('procedimentos_tuss')
        .select('id, codigo_tuss, dados_lista_suspensa, especialidade, valor, convenio_nome')
        .eq('convenio_nome', convenioNome)
        .eq('ativo', true)
        .order('dados_lista_suspensa');

      if (error) {
        console.error('Erro ao buscar procedimentos:', error);
        return;
      }
      
      setProcedimentosConvenio(data || []);
    } catch (error) {
      console.error('Erro ao buscar procedimentos:', error);
    } finally {
      setLoadingProcedimentos(false);
    }
  };

  const abrirModalGuia = (agendamento: AgendamentoEspera) => {
    console.log('=== ABRINDO MODAL GUIA ===');
    console.log('Agendamento:', agendamento);
    console.log('Convênio:', agendamento.convenio_nome);
    
    setAgendamentoSelecionado(agendamento);
    setDadosGuia({
      codigo_autorizacao: agendamento.codigo_autorizacao || '',
      numero_guia: agendamento.numero_guia || '',
      data_autorizacao: agendamento.data_autorizacao || '',
      validade_autorizacao: agendamento.validade_autorizacao || ''
    });
    
    console.log('Definindo mostrarModalGuia como true');
    setMostrarModalGuia(true);
    
    // Buscar procedimentos do convênio
    if (agendamento.convenio_nome) {
      console.log('Buscando procedimentos para convênio:', agendamento.convenio_nome);
      fetchProcedimentosConvenio(agendamento.convenio_nome);
    } else {
      console.log('Agendamento sem convênio definido');
    }
  };

  const salvarDadosGuia = async () => {
    if (!agendamentoSelecionado) return;

    try {
      console.log('Salvando dados da guia para agendamento:', agendamentoSelecionado.id);
      console.log('Dados da guia:', dadosGuia);

      // Encontrar o procedimento selecionado para obter o valor
      const procedimentoSelecionado = procedimentosConvenio.find(proc => 
        `${proc.codigo_tuss} - ${proc.dados_lista_suspensa}` === dadosGuia.codigo_autorizacao
      );

      const valorProcedimento = procedimentoSelecionado ? parseFloat(procedimentoSelecionado.valor) : null;
      
      console.log('Procedimento selecionado:', procedimentoSelecionado);
      console.log('Valor do procedimento:', valorProcedimento);

      const { data, error } = await supabase
        .from('agendamentos')
        .update({
          codigo_autorizacao: dadosGuia.codigo_autorizacao,
          numero_guia: dadosGuia.numero_guia,
          data_autorizacao: dadosGuia.data_autorizacao,
          validade_autorizacao: dadosGuia.validade_autorizacao,
          valor_procedimento: valorProcedimento,
          status: 'pronto_para_terapia',
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoSelecionado.id)
        .select();

      if (error) {
        console.error('Erro ao salvar dados da guia:', error);
        alert(`Erro ao salvar dados da guia: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        console.log('Dados da guia salvos com sucesso:', data[0]);
        alert('Dados da guia salvos com sucesso!');
        setMostrarModalGuia(false);
        setDadosGuia({
          codigo_autorizacao: '',
          numero_guia: '',
          data_autorizacao: '',
          validade_autorizacao: ''
        });
        fetchAgendamentosHoje();
      } else {
        console.warn('Nenhum registro foi atualizado');
        alert('Agendamento não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao salvar dados da guia:', error);
      alert(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '--:--';
  };

  const getStatusColor = (agendamento: AgendamentoEspera) => {
    if (agendamento.status === 'faltou') {
      return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
    }
    if (agendamento.data_chegada && !agendamento.codigo_autorizacao) {
      return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
    if (agendamento.data_chegada && agendamento.codigo_autorizacao) {
      return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
    }
    return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
  };

  const getStatusText = (agendamento: AgendamentoEspera) => {
    if (agendamento.status === 'faltou') {
      return 'Faltou';
    }
    if (agendamento.data_chegada && agendamento.codigo_autorizacao) {
      return 'Pronto para Terapia';
    }
    if (agendamento.data_chegada) {
      return 'Aguardando Tabulação';
    }
    return 'Agendado';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800/50 rounded-2xl shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                  👥
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Sala de Espera</h1>
                  <p className="text-slate-600 dark:text-slate-400">Agendamentos de hoje - {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              {/* Stats and Actions */}
              <div className="flex items-center gap-4">
                {/* Toggle de Visualização */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setVisaoLista(false)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      !visaoLista 
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    title="Visualização em Cards"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVisaoLista(true)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      visaoLista 
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    title="Visualização em Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      Total: {agendamentos.length}
                    </span>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      Chegaram: {agendamentos.filter(a => a.data_chegada).length}
                    </span>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-lg">
                    <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                      Aguardando: {agendamentos.filter(a => a.data_chegada && !a.codigo_autorizacao).length}
                    </span>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                    <span className="text-red-700 dark:text-red-300 font-medium">
                      Faltas: {agendamentos.filter(a => a.status === 'faltou').length}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={fetchAgendamentosHoje}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔄 Atualizar
                </button>
              </div>
            </div>
            
            {/* Mobile Stats */}
            <div className="md:hidden space-y-3">
              {/* Toggle de Visualização Mobile */}
              <div className="flex justify-center">
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setVisaoLista(false)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      !visaoLista 
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    title="Visualização em Cards"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVisaoLista(true)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      visaoLista 
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    title="Visualização em Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Stats Mobile */}
              <div className="flex items-center gap-2 overflow-x-auto">
              <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
                <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                  Total: {agendamentos.length}
                </span>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
                <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                  Chegaram: {agendamentos.filter(a => a.data_chegada).length}
                </span>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
                <span className="text-yellow-700 dark:text-yellow-300 font-medium text-sm">
                  Aguardando: {agendamentos.filter(a => a.data_chegada && !a.codigo_autorizacao).length}
                </span>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
                <span className="text-red-700 dark:text-red-300 font-medium text-sm">
                  Faltas: {agendamentos.filter(a => a.status === 'faltou').length}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Main Content */}
        <div>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="animate-spin h-12 w-12 text-purple-600 mb-4" />
              <span className="text-lg text-slate-600 dark:text-slate-400">Carregando agendamentos...</span>
            </div>
          ) : agendamentos.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xl">
              <Users className="mx-auto h-20 w-20 text-slate-400 mb-6" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">Nenhum agendamento para hoje</h3>
              <p className="text-slate-500 dark:text-slate-500">Todos os pacientes foram atendidos ou não há agendamentos.</p>
            </div>
          </div>
        ) : (
          visaoLista ? (
            // Visualização em Lista
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Horário</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sala</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profissional</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Convênio</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {agendamentos.map((agendamento, index) => (
                      <tr 
                        key={agendamento.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          agendamento.status === 'faltou' ? 'bg-red-50 dark:bg-red-900/10' : ''
                        }`}
                      >
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            agendamento.status === 'faltou'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : agendamento.data_chegada && agendamento.codigo_autorizacao
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : agendamento.data_chegada
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {getStatusText(agendamento)}
                          </span>
                        </td>

                        {/* Paciente */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {agendamento.paciente_nome}
                            </div>
                            {agendamento.data_chegada && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Chegou às {new Date(agendamento.data_chegada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Horário */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                            {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                          </div>
                        </td>

                        {/* Sala */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full ring-1 ring-white dark:ring-slate-800"
                              style={{ backgroundColor: agendamento.sala_cor || '#6B7280' }}
                            />
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                              {agendamento.sala_nome}
                            </span>
                          </div>
                        </td>

                        {/* Profissional */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {agendamento.profissional_nome}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {agendamento.especialidade_nome}
                            </div>
                          </div>
                        </td>

                        {/* Convênio */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            {agendamento.convenio_nome || 'Particular'}
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {agendamento.status === 'faltou' ? (
                              <span className="text-xs text-red-600 dark:text-red-400">
                                ❌ Faltou
                              </span>
                            ) : !agendamento.data_chegada ? (
                              <>
                                <button
                                  onClick={() => confirmarChegada(agendamento.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                  title="Confirmar Chegada"
                                >
                                  ✅ Chegada
                                </button>
                                <button
                                  onClick={() => marcarFalta(agendamento.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                                  title="Marcar Falta"
                                >
                                  ❌ Falta
                                </button>
                              </>
                            ) : agendamento.data_chegada && !agendamento.codigo_autorizacao ? (
                              <button
                                onClick={() => abrirModalGuia(agendamento)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium animate-pulse border border-red-500"
                                title="Tabular Guia"
                              >
                                🚨 Tabular
                              </button>
                            ) : agendamento.data_chegada && agendamento.codigo_autorizacao ? (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                📋 Pronto
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                Aguardando chegada
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Visualização em Cards (existente)
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border-l-4 ${getStatusColor(agendamento)} overflow-hidden transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] h-[420px] flex flex-col`}
                >
                  {/* Header do Card - Altura fixa */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight min-h-[56px] flex items-center">
                        <span className="line-clamp-2">{agendamento.paciente_nome}</span>
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 flex-shrink-0 ${
                        agendamento.status === 'faltou'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : agendamento.data_chegada && agendamento.codigo_autorizacao
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : agendamento.data_chegada
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {getStatusText(agendamento)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="font-medium">{formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-slate-800 flex-shrink-0"
                          style={{ backgroundColor: agendamento.sala_cor || '#6B7280' }}
                        />
                        <span className="font-medium truncate">{agendamento.sala_nome}</span>
                      </div>
                      
                      <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 rounded-lg p-2 min-h-[40px]">
                        <div className="truncate">{agendamento.especialidade_nome}</div>
                        <div className="truncate">{agendamento.profissional_nome}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>💳</span>
                        <span className="font-medium truncate">{agendamento.convenio_nome || 'Particular'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações - Altura flexível para preencher o restante */}
                  <div className="p-5 space-y-3 flex-grow flex flex-col justify-end">
                    {agendamento.status === 'faltou' ? (
                      <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        ❌ Paciente faltou ao agendamento
                      </div>
                    ) : !agendamento.data_chegada ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => confirmarChegada(agendamento.id)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg font-medium"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Confirmar Chegada
                        </button>
                        <button
                          onClick={() => marcarFalta(agendamento.id)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg font-medium"
                        >
                          <AlertCircle className="w-5 h-5" />
                          Marcar Falta
                        </button>
                      </div>
                    ) : (
                      <>
                        {agendamento.data_chegada && (
                          <div className="text-sm text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            ✅ Chegou às {new Date(agendamento.data_chegada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        
                        {agendamento.data_chegada && !agendamento.codigo_autorizacao ? (
                          <button
                            onClick={() => abrirModalGuia(agendamento)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 animate-pulse shadow-lg font-medium border-2 border-red-500"
                          >
                            <FileText className="w-5 h-5" />
                            🚨 Tabular Guia
                          </button>
                        ) : agendamento.data_chegada && agendamento.codigo_autorizacao ? (
                          <div className="text-sm text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            📋 Guia tabulada - Pronto para terapia
                          </div>
                        ) : agendamento.data_chegada ? (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400 text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                            ⚠️ DEBUG: Chegou mas tem código: {agendamento.codigo_autorizacao || 'null'}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2">
                            ℹ️ Aguardando confirmação de chegada
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        </div>

        {/* Modal Tabular Guia */}
        {mostrarModalGuia && agendamentoSelecionado && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  📋 Tabular Guia
                </h3>
                <button
                  onClick={() => setMostrarModalGuia(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                  <p className="text-slate-700 dark:text-slate-300"><strong>Paciente:</strong> {agendamentoSelecionado.paciente_nome}</p>
                  <p className="text-slate-700 dark:text-slate-300"><strong>Convênio:</strong> {agendamentoSelecionado.convenio_nome}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Código de Autorização * 
                    {loadingProcedimentos && <span className="text-blue-500 text-xs ml-2">(Carregando procedimentos...)</span>}
                  </label>
                  {procedimentosConvenio.length > 0 ? (
                    <select
                      value={dadosGuia.codigo_autorizacao}
                      onChange={(e) => setDadosGuia(prev => ({ ...prev, codigo_autorizacao: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                      required
                    >
                      <option value="">Selecione o código de autorização ({procedimentosConvenio.length} opções)</option>
                      {procedimentosConvenio.map((procedimento) => {
                        // Formatar: código - descrição
                        const textoCompleto = `${procedimento.codigo_tuss} - ${procedimento.dados_lista_suspensa}`;
                        return (
                          <option key={procedimento.id} value={textoCompleto}>
                            {textoCompleto}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={dadosGuia.codigo_autorizacao}
                        onChange={(e) => setDadosGuia(prev => ({ ...prev, codigo_autorizacao: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                        placeholder="Ex: 123456789"
                        required
                      />
                      {!loadingProcedimentos && agendamentoSelecionado?.convenio_nome && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          ⚠️ Nenhum procedimento encontrado para o convênio "{agendamentoSelecionado.convenio_nome}". Digite manualmente.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Número da Guia *
                  </label>
                  <input
                    type="text"
                    value={dadosGuia.numero_guia}
                    onChange={(e) => setDadosGuia(prev => ({ ...prev, numero_guia: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                    placeholder="Ex: 987654321"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Data Autorização *
                    </label>
                    <input
                      type="date"
                      value={dadosGuia.data_autorizacao}
                      onChange={(e) => setDadosGuia(prev => ({ ...prev, data_autorizacao: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Validade *
                    </label>
                    <input
                      type="date"
                      value={dadosGuia.validade_autorizacao}
                      onChange={(e) => setDadosGuia(prev => ({ ...prev, validade_autorizacao: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-6">
                  <button
                    onClick={() => setMostrarModalGuia(false)}
                    className="flex-1 px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-400 dark:hover:bg-slate-500 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarDadosGuia}
                    disabled={!dadosGuia.codigo_autorizacao || !dadosGuia.numero_guia || !dadosGuia.data_autorizacao || !dadosGuia.validade_autorizacao}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                  >
                    Salvar Guia
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
