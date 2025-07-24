"use client";
import MainLayout from '../../components/MainLayout';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Receipt,
  Wallet,
  Calculator,
  Target,
  Activity,
  RefreshCw,
  FileText,
  CreditCard as Card,
  Building2,
  Users,
  Zap,
  Star,
  Award,
  Shield,
  Heart,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

export default function FinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      title: 'Receita Mensal',
      value: 'R$ 145.280',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      description: 'Receita total do mês'
    },
    {
      title: 'Consultas Pagas',
      value: '328',
      change: '+8.2%',
      trend: 'up',
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      description: 'Consultas quitadas'
    },
    {
      title: 'Pendências',
      value: 'R$ 28.450',
      change: '-5.1%',
      trend: 'down',
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      description: 'Valores a receber'
    },
    {
      title: 'Crescimento',
      value: '18.5%',
      change: '+2.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      description: 'Crescimento mensal'
    }
  ];

  const transactions = [
    { 
      id: 1, 
      patient: 'João Silva', 
      type: 'Consulta Cardiológica', 
      amount: 250, 
      status: 'Pago', 
      date: '18/01/2025',
      method: 'Cartão de Crédito',
      doctor: 'Dr. Carlos Santos',
      receipt: 'REC-2025-001'
    },
    { 
      id: 2, 
      patient: 'Maria Santos', 
      type: 'Terapia Ocupacional', 
      amount: 200, 
      status: 'Pendente', 
      date: '18/01/2025',
      method: 'PIX',
      doctor: 'Dra. Ana Costa',
      receipt: 'REC-2025-002'
    },
    { 
      id: 3, 
      patient: 'Pedro Oliveira', 
      type: 'Avaliação Neurológica', 
      amount: 350, 
      status: 'Pago', 
      date: '17/01/2025',
      method: 'Dinheiro',
      doctor: 'Dr. Roberto Lima',
      receipt: 'REC-2025-003'
    },
    { 
      id: 4, 
      patient: 'Ana Costa', 
      type: 'Consulta Geral', 
      amount: 150, 
      status: 'Atrasado', 
      date: '16/01/2025',
      method: 'Boleto',
      doctor: 'Dr. Miguel Santos',
      receipt: 'REC-2025-004'
    },
    { 
      id: 5, 
      patient: 'Carlos Mendes', 
      type: 'Consulta Oftalmológica', 
      amount: 180, 
      status: 'Pago', 
      date: '15/01/2025',
      method: 'Cartão de Débito',
      doctor: 'Dra. Julia Martins',
      receipt: 'REC-2025-005'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Atrasado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pago': return <CheckCircle className="w-4 h-4" />;
      case 'Pendente': return <Clock className="w-4 h-4" />;
      case 'Atrasado': return <AlertCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Cartão de Crédito': return <CreditCard className="w-4 h-4" />;
      case 'Cartão de Débito': return <Card className="w-4 h-4" />;
      case 'PIX': return <Zap className="w-4 h-4" />;
      case 'Dinheiro': return <DollarSign className="w-4 h-4" />;
      case 'Boleto': return <Receipt className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const totalReceita = transactions.filter(t => t.status === 'Pago').reduce((sum, t) => sum + t.amount, 0);
  const totalPendente = transactions.filter(t => t.status === 'Pendente').reduce((sum, t) => sum + t.amount, 0);
  const totalAtrasado = transactions.filter(t => t.status === 'Atrasado').reduce((sum, t) => sum + t.amount, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 text-white rounded-2xl mx-6 mt-6 p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Controle Financeiro</h1>
                <p className="text-green-100 text-lg">Acompanhe receitas, despesas e indicadores em tempo real</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold">R$ {totalReceita.toLocaleString()}</div>
                  <div className="text-green-100 text-sm">Receita Confirmada</div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-8 h-8 text-green-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {stats.map((stat, index) => {
            const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            return (
              <div 
                key={index}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Resumo Visual */}
        <div className="mx-6 mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900 dark:text-green-100">Receita Confirmada</span>
                </div>
                <span className="text-2xl font-bold text-green-600">R$ {totalReceita.toLocaleString()}</span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900 dark:text-yellow-100">Pendente</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString()}</span>
              </div>
              <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900 dark:text-red-100">Em Atraso</span>
                </div>
                <span className="text-2xl font-bold text-red-600">R$ {totalAtrasado.toLocaleString()}</span>
              </div>
              <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="mx-6 mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar transação, paciente ou médico..."
                  className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="diario">Hoje</option>
                <option value="semanal">Esta Semana</option>
                <option value="mensal">Este Mês</option>
                <option value="anual">Este Ano</option>
              </select>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
                <Plus className="w-5 h-5" />
                Nova Transação
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="mx-6 mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transações Recentes</h2>
                <p className="text-gray-600 dark:text-gray-400">Últimas movimentações financeiras</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Paciente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Serviço</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Valor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Pagamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {transaction.patient.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{transaction.patient}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.doctor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.type}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.receipt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        R$ {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {getMethodIcon(transaction.method)}
                        {transaction.method}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transaction.date}</td>
                    <td className="px-6 py-4">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-6 mb-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Receita Mensal</h3>
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Gráfico de receita em desenvolvimento</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Métodos de Pagamento</h3>
              <PieChart className="w-6 h-6 text-purple-500" />
            </div>
            <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Distribuição por método em desenvolvimento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
