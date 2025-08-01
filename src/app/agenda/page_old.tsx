"use client";
import MainLayout from '../../components/MainLayout';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Stethoscope,
  Users,
  CalendarDays,
  TrendingUp,
  Activity,
  Star,
  Video,
  MessageSquare,
  Bell,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Heart,
  Shield,
  Target
} from 'lucide-react';
import { useState } from 'react';

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(18);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const appointments = [
    { 
      id: 1, 
      patient: 'João Silva', 
      time: '09:00', 
      endTime: '09:30',
      type: 'Consulta Cardiológica', 
      status: 'Confirmado',
      doctor: 'Dr. Carlos Santos',
      room: 'Sala 101',
      phone: '(11) 9999-9999',
      priority: 'normal',
      notes: 'Primeira consulta'
    },
    { 
      id: 2, 
      patient: 'Maria Santos', 
      time: '10:30', 
      endTime: '11:00',
      type: 'Terapia Ocupacional', 
      status: 'Pendente',
      doctor: 'Dra. Ana Costa',
      room: 'Sala 205',
      phone: '(11) 8888-8888',
      priority: 'high',
      notes: 'Paciente com dificuldades motoras'
    },
    { 
      id: 3, 
      patient: 'Pedro Oliveira', 
      time: '14:00', 
      endTime: '14:45',
      type: 'Avaliação Neurológica', 
      status: 'Confirmado',
      doctor: 'Dr. Roberto Lima',
      room: 'Sala 303',
      phone: '(11) 7777-7777',
      priority: 'urgent',
      notes: 'Exames solicitados'
    },
    { 
      id: 4, 
      patient: 'Ana Costa', 
      time: '15:30', 
      endTime: '16:00',
      type: 'Consulta Geral', 
      status: 'Reagendado',
      doctor: 'Dr. Miguel Santos',
      room: 'Sala 102',
      phone: '(11) 6666-6666',
      priority: 'normal',
      notes: 'Reagendado a pedido do paciente'
    },
    { 
      id: 5, 
      patient: 'Carlos Mendes', 
      time: '16:30', 
      endTime: '17:00',
      type: 'Consulta Oftalmológica', 
      status: 'Confirmado',
      doctor: 'Dra. Julia Martins',
      room: 'Sala 201',
      phone: '(11) 5555-5555',
      priority: 'normal',
      notes: 'Exame de rotina'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Reagendado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmado': return <CheckCircle className="w-4 h-4" />;
      case 'Pendente': return <AlertCircle className="w-4 h-4" />;
      case 'Reagendado': return <RefreshCw className="w-4 h-4" />;
      case 'Cancelado': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const todayStats = {
    total: appointments.length,
    confirmados: appointments.filter(a => a.status === 'Confirmado').length,
    pendentes: appointments.filter(a => a.status === 'Pendente').length,
    reagendados: appointments.filter(a => a.status === 'Reagendado').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-none">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white rounded-2xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Agenda Médica</h1>
                <p className="text-blue-100 text-lg">Gerencie consultas e compromissos com facilidade</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
                  <Plus size={20} />
                  Nova Consulta
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-8 h-8 text-blue-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hoje</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayStats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmados</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{todayStats.confirmados}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{todayStats.pendentes}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reagendados</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{todayStats.reagendados}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {(['day', 'week', 'month'] as const).map((mode) => (
                  <button
                    key={mode}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setViewMode(mode)}
                  >
                    {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Consultas */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consultas de Hoje</h2>
                <p className="text-gray-600 dark:text-gray-400">Sábado, 18 de Janeiro de 2025</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Indicador de Prioridade */}
                      <div className={`w-1 h-16 rounded-full ${getPriorityColor(appointment.priority)}`}></div>
                      
                      {/* Avatar do Paciente */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {appointment.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      {/* Informações do Paciente */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appointment.patient}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            <span>{appointment.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{appointment.doctor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{appointment.phone}</span>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Horário e Ações */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {appointment.time}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          até {appointment.endTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
