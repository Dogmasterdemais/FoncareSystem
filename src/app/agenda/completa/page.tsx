'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUnidade } from '@/context/UnidadeContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Filter,
  Download
} from 'lucide-react';

interface AgendamentoDia {
  id: string;
  numero_agendamento: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  sala_numero: string;
  sala_nome: string;
  profissional_nome: string;
  especialidade_nome: string;
  convenio_nome: string;
  // Campos de controle
  codigo_autorizacao?: string;
  numero_guia?: string;
  data_chegada?: string;
  // Status calculados
  guia_tabulada: boolean;
  pode_atender: boolean;
}

type FiltroStatus = 'todos' | 'tabulados' | 'nao_tabulados' | 'em_atendimento' | 'concluidos';

export default function AgendaCompletaDia() {
  const { unidadeSelecionada } = useUnidade();
  const [agendamentos, setAgendamentos] = useState<AgendamentoDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroSala, setFiltroSala] = useState<string>('todas');
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    buscarAgendamentosCompletos();
  }, [unidadeSelecionada, dataSelecionada]);

  const buscarAgendamentosCompletos = async () => {
    if (!unidadeSelecionada) return;

    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('unidade_id', unidadeSelecionada)
        .eq('data_agendamento', dataSelecionada)
        .order('horario_inicio');

      if (error) throw error;

      // Processar dados e adicionar campos calculados
      const agendamentosProcessados: AgendamentoDia[] = (data || []).map((item: any) => ({
        id: item.id,
        numero_agendamento: item.numero_agendamento,
        paciente_nome: item.paciente_nome,
        horario_inicio: item.horario_inicio,
        horario_fim: item.horario_fim,
        status: item.status,
        sala_numero: item.sala_numero,
        sala_nome: item.sala_nome,
        profissional_nome: item.profissional_nome,
        especialidade_nome: item.especialidade_nome,
        convenio_nome: item.convenio_nome,
        codigo_autorizacao: item.codigo_autorizacao,
        numero_guia: item.numero_guia,
        data_chegada: item.data_chegada,
        guia_tabulada: !!item.codigo_autorizacao,
        pode_atender: !!item.codigo_autorizacao && !!item.data_chegada
      }));

      setAgendamentos(agendamentosProcessados);
      
    } catch (error) {
      console.error('Erro ao buscar agenda completa:', error);
      setError('Erro ao carregar agenda do dia');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    // Filtro por status
    if (filtroStatus !== 'todos') {
      switch (filtroStatus) {
        case 'tabulados':
          if (!agendamento.guia_tabulada) return false;
          break;
        case 'nao_tabulados':
          if (agendamento.guia_tabulada) return false;
          break;
        case 'em_atendimento':
          if (agendamento.status !== 'em_atendimento') return false;
          break;
        case 'concluidos':
          if (agendamento.status !== 'concluido') return false;
          break;
      }
    }

    // Filtro por sala
    if (filtroSala !== 'todas') {
      if (agendamento.sala_numero !== filtroSala) return false;
    }

    return true;
  });

  // Estatísticas
  const estatisticas = {
    total: agendamentos.length,
    tabulados: agendamentos.filter(a => a.guia_tabulada).length,
    nao_tabulados: agendamentos.filter(a => !a.guia_tabulada).length,
    em_atendimento: agendamentos.filter(a => a.status === 'em_atendimento').length,
    concluidos: agendamentos.filter(a => a.status === 'concluido').length,
    aguardando: agendamentos.filter(a => a.status === 'aguardando').length
  };

  // Salas únicas para o filtro
  const salasUnicas = Array.from(new Set(agendamentos.map(a => a.sala_numero))).sort();

  const exportarDados = () => {
    const csvContent = [
      ['Horário', 'Paciente', 'Sala', 'Profissional', 'Status', 'Guia Tabulada', 'Código Autorização'].join(','),
      ...agendamentosFiltrados.map(a => [
        a.horario_inicio,
        a.paciente_nome,
        `${a.sala_numero} - ${a.sala_nome}`,
        a.profissional_nome,
        a.status,
        a.guia_tabulada ? 'Sim' : 'Não',
        a.codigo_autorizacao || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda-${dataSelecionada}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando agenda do dia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Agenda Completa do Dia
            </h1>
            <p className="text-gray-600 mt-1">
              Visualização completa • Inclui guias não tabuladas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Data */}
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="tabulados">Guias Tabuladas</option>
              <option value="nao_tabulados">Não Tabuladas</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="concluidos">Concluídos</option>
            </select>
            
            {/* Filtro Sala */}
            <select
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as Salas</option>
              {salasUnicas.map(sala => (
                <option key={sala} value={sala}>Sala {sala}</option>
              ))}
            </select>
            
            <button
              onClick={exportarDados}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              <Download className="h-4 w-4 inline mr-1" />
              Exportar
            </button>
            
            <button
              onClick={buscarAgendamentosCompletos}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Atualizar
            </button>
          </div>
        </div>
        
        {/* Estatísticas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{estatisticas.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{estatisticas.tabulados}</div>
            <div className="text-sm text-green-600">Tabuladas</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{estatisticas.nao_tabulados}</div>
            <div className="text-sm text-red-600">Não Tabuladas</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-700">{estatisticas.em_atendimento}</div>
            <div className="text-sm text-orange-600">Atendimento</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{estatisticas.concluidos}</div>
            <div className="text-sm text-purple-600">Concluídos</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{estatisticas.aguardando}</div>
            <div className="text-sm text-yellow-600">Aguardando</div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {estatisticas.nao_tabulados > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-amber-800 font-medium">
                ⚠️ {estatisticas.nao_tabulados} guia(s) não tabulada(s)
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                Estes pacientes não aparecerão no controle de salas até que a recepção processe as guias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Convênio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agendamentosFiltrados.map((agendamento, index) => (
                <tr key={agendamento.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{agendamento.horario_inicio}</div>
                        <div className="text-gray-500 text-xs">{agendamento.horario_fim}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {agendamento.paciente_nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      {agendamento.numero_agendamento}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">Sala {agendamento.sala_numero}</div>
                    <div className="text-gray-500 text-xs">{agendamento.sala_nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agendamento.profissional_nome}</div>
                    <div className="text-sm text-gray-500">{agendamento.especialidade_nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={agendamento.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <GuiaBadge agendamento={agendamento} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agendamento.convenio_nome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {agendamentosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-600">
              Não há agendamentos para os filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusInfo = () => {
    switch (status) {
      case 'concluido':
        return { text: 'Concluído', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> };
      case 'em_atendimento':
        return { text: 'Em Atendimento', color: 'bg-blue-100 text-blue-800', icon: <Users className="h-3 w-3" /> };
      case 'aguardando':
        return { text: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> };
      case 'cancelado':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-3 w-3" /> };
    }
  };

  const statusInfo = getStatusInfo();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
      {statusInfo.icon}
      <span className="ml-1">{statusInfo.text}</span>
    </span>
  );
}

function GuiaBadge({ agendamento }: { agendamento: AgendamentoDia }) {
  if (agendamento.guia_tabulada) {
    return (
      <div className="text-sm">
        <div className="flex items-center text-green-600 mb-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span className="font-medium">Tabulada</span>
        </div>
        <div className="text-xs text-gray-500">
          {agendamento.codigo_autorizacao}
        </div>
        {agendamento.numero_guia && (
          <div className="text-xs text-gray-500">
            Guia: {agendamento.numero_guia}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-red-600">
        <XCircle className="h-3 w-3 mr-1" />
        <span className="text-sm font-medium">Não Tabulada</span>
      </div>
    );
  }
}
