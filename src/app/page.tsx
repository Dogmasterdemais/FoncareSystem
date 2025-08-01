"use client";
import MainLayout from '../components/MainLayout';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Stethoscope,
  Building2,
  UserCheck,
  CalendarDays,
  CreditCard,
  Target,
  Zap,
  Shield,
  Award,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados mockados para demonstração
  const stats = {
    totalPacientes: 1245,
    consultasHoje: 32,
    faturamentoMes: 158420,
    satisfacao: 98.5,
    agendamentosHoje: 45,
    medicosDuty: 12,
    tempoMedioAtendimento: 25,
    pacientesEspera: 8
  };

  const recentActivities = [
    { type: 'appointment', message: 'Nova consulta agendada - Dr. Silva', time: '2 min atrás', icon: Calendar, color: 'blue' },
    { type: 'patient', message: 'Paciente João Silva cadastrado', time: '5 min atrás', icon: Users, color: 'green' },
    { type: 'payment', message: 'Pagamento de R$ 150,00 processado', time: '8 min atrás', icon: CreditCard, color: 'emerald' },
    { type: 'alert', message: 'Medicamento em estoque baixo', time: '15 min atrás', icon: AlertCircle, color: 'orange' },
  ];

  const quickActions = [
    { label: 'Novo Paciente', icon: Users, color: 'from-blue-500 to-blue-600', href: '/pacientes' },
    { label: 'Agendar Consulta', icon: Calendar, color: 'from-purple-500 to-purple-600', href: '/agenda' },
    { label: 'Relatórios', icon: BarChart3, color: 'from-green-500 to-green-600', href: '/relatorios' },
    { label: 'Financeiro', icon: DollarSign, color: 'from-orange-500 to-orange-600', href: '/financeiro' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Header Dashboard */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white rounded-2xl mx-6 mt-6 p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Dashboard Executivo</h1>
                <p className="text-blue-100 text-lg">Bem-vindo de volta! Aqui está o resumo de hoje.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-blue-100 text-sm">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Heart className="w-8 h-8 text-red-300 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPacientes.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultas Hoje</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.consultasHoje}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">+8.2%</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faturamento Mensal</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ {stats.faturamentoMes.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">+15.8%</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfação</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.satisfacao}%</p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-500 text-sm font-medium">Excelente</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Ações Rápidas */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ações Rápidas</h3>
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-200 hover:scale-105 group`}
                >
                  <action.icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold">{action.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Atividades Recentes</h3>
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`p-2 rounded-lg bg-gradient-to-r from-${activity.color}-500 to-${activity.color}-600 text-white`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas em Tempo Real */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Métricas em Tempo Real</h3>
              <Activity className="w-6 h-6 text-green-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Tempo Médio</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats.tempoMedioAtendimento}min</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Médicos em Plantão</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.medicosDuty}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Pacientes Esperando</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{stats.pacientesEspera}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="mx-6 mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Sistema Operacional</h3>
                <p className="text-green-100">Todos os serviços funcionando normalmente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <Sparkles className="w-6 h-6 text-green-300" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
