"use client";
import MainLayout from '../../../components/MainLayout';
import PacienteCadastroStepper from '../../../components/PacienteCadastroStepper';
import { 
  UserPlus, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Target,
  Activity,
  TrendingUp,
  Award,
  Heart,
  Stethoscope,
  Shield,
  Sparkles
} from 'lucide-react';

export default function CadastrarPacientePage() {
  // Estatísticas mockadas para demonstração
  const stats = {
    totalPacientes: 1245,
    novosHoje: 12,
    cadastrosCompletos: 98.5,
    pendentes: 3
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-800 text-white rounded-2xl mx-6 mt-6 p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-green-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Cadastro de Pacientes - NAC</h1>
                <p className="text-emerald-100 text-lg">Sistema completo de registro e gestão de pacientes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold">{stats.totalPacientes.toLocaleString()}</div>
                  <div className="text-emerald-100 text-sm">Pacientes Cadastrados</div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <UserPlus className="w-8 h-8 text-emerald-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPacientes.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Novos Hoje</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.novosHoje}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Completude</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.cadastrosCompletos}%</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.pendentes}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <div className="mx-6 mb-6">
          <PacienteCadastroStepper />
        </div>

        {/* Status do Sistema */}
        <div className="mx-6 mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Sistema de Cadastro Ativo</h3>
                <p className="text-green-100">Integração com banco de dados funcionando</p>
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
