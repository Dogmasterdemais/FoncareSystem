"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Agendamento {
  id: string;
  paciente_nome: string;
  profissional_nome: string;
  sala_nome: string;
  sala_cor: string;
  especialidade_nome: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  numero_agendamento: string;
}

export default function AgendamentosComponent() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'semanal' | 'lista'>('semanal');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filtros, setFiltros] = useState({
    unidade: '',
    especialidade: '',
    profissional: '',
    status: ''
  });

  useEffect(() => {
    fetchAgendamentos();
  }, [selectedDate, filtros]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      let query = supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .gte('data_agendamento', startOfWeek.toISOString().split('T')[0])
        .lte('data_agendamento', endOfWeek.toISOString().split('T')[0])
        .order('data_agendamento')
        .order('horario_inicio');

      // Aplicar filtros
      if (filtros.unidade) {
        query = query.eq('unidade_id', filtros.unidade);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
      } else {
        setAgendamentos(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAgendamentosPorDia = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendamentos.filter(ag => ag.data_agendamento === dateStr);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'agendado': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-green-100 text-green-800',
      'realizado': 'bg-purple-100 text-purple-800',
      'cancelado': 'bg-red-100 text-red-800',
      'falta': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema de Agendamentos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie agendamentos e visualize a agenda
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle View */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('semanal')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'semanal'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Semanal
            </button>
            <button
              onClick={() => setView('lista')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'lista'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Lista
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-4 flex-1">
            <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todas as Unidades</option>
            </select>
            <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todas as Especialidades</option>
            </select>
            <select 
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {view === 'semanal' && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <button
            onClick={() => navigateWeek('prev')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Semana Anterior
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedDate.toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          <button
            onClick={() => navigateWeek('next')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Próxima Semana
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Carregando agendamentos...</span>
        </div>
      ) : view === 'semanal' ? (
        /* Visão Semanal */
        <div className="grid grid-cols-7 gap-2">
          {getWeekDays().map((day, index) => {
            const agendamentosDay = getAgendamentosPorDia(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg border p-3 min-h-[300px] ${
                  isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="text-center mb-3">
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {formatDate(day)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {agendamentosDay.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="p-2 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700"
                      style={{ borderLeftColor: agendamento.sala_cor }}
                    >
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {agendamento.paciente_nome}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {agendamento.sala_nome}
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visão Lista */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {agendamentos.map((agendamento) => (
                  <tr key={agendamento.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: agendamento.sala_cor }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agendamento.paciente_nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{agendamento.numero_agendamento}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {agendamento.especialidade_nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {agendamento.sala_nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {agendamento.profissional_nome || 'Não definido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {agendamentos.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {agendamentos.filter(a => a.status === 'agendado').length}
              </div>
              <div className="text-sm text-blue-600">Agendados</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">
                {agendamentos.filter(a => a.status === 'realizado').length}
              </div>
              <div className="text-sm text-green-600">Realizados</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-orange-700">
                {agendamentos.filter(a => a.status === 'falta').length}
              </div>
              <div className="text-sm text-orange-600">Faltas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {agendamentos.length}
              </div>
              <div className="text-sm text-purple-600">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
