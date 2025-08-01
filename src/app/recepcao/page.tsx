'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { Clock, Users, Calendar, FileText } from 'lucide-react';

export default function RecepcaoPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800/50 sticky top-0 z-20 shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  🏥
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recepção</h1>
                  <p className="text-slate-600 dark:text-slate-400">Gestão de chegadas e cronogramas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-6 py-6 w-full max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card Sala de Espera */}
            <div 
              onClick={() => router.push('/recepcao/sala-espera')}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-12 h-12" />
                  <div>
                    <h2 className="text-2xl font-bold">Sala de Espera</h2>
                    <p className="text-purple-100">Gerenciar chegadas dos pacientes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span>Controle de chegadas em tempo real</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <span>Tabulação de guias de convênio</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span>Visualização de profissionais por sala</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Acessar Sala de Espera
                  </button>
                </div>
              </div>
            </div>

            {/* Card Cronograma */}
            <div 
              onClick={() => router.push('/recepcao/cronograma')}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-12 h-12" />
                  <div>
                    <h2 className="text-2xl font-bold">Cronograma</h2>
                    <p className="text-emerald-100">Cronogramas dos pacientes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <span>Visualização semanal por especialidade</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <span>Geração de PDF personalizado</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <span>Horários detalhados por paciente</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Acessar Cronograma
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Cards de Estatísticas */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Pacientes Aguardando</div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Em Atendimento</div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Agendamentos Hoje</div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Guias Pendentes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
