"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../../../components/MainLayout";
import { Calendar, Clock, User, MapPin, Phone, FileText, Plus, Filter, List, Grid } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cores das especialidades conforme especificação
const CORES_ESPECIALIDADES = {
  'FONOAUDIOLOGIA': '#0052CC',
  'TERAPIA_OCUPACIONAL': '#00E6F6',
  'PSICOLOGIA': '#38712F',
  'PSICOPEDAGOGIA': '#D20000',
  'NEUROPSICOPEDAGOGIA': '#D20000',
  'EDUCADOR_FISICO': '#B45A00',
  'PSICOMOTRICIDADE': '#F58B00',
  'MUSICOTERAPIA': '#F5C344',
  'LUDOTERAPIA': '#F5C344',
  'ARTERAPIA': '#F5C344',
  'FISIOTERAPIA': '#C47B9C'
};

interface Agendamento {
  id: string;
  paciente_nome: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  modalidade: string;
  sala_nome: string;
  profissional_nome: string;
  status: string;
  convenio_nome: string;
}

interface EstatisticasMes {
  agendados: number;
  compareceram: number;
  faltaram: number;
  reagendamentos: number;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [estatisticas, setEstatisticas] = useState<EstatisticasMes>({
    agendados: 0,
    compareceram: 0,
    faltaram: 0,
    reagendamentos: 0
  });

  useEffect(() => {
    fetchAgendamentos();
    fetchEstatisticas();
  }, [selectedDate]);

  async function fetchAgendamentos() {
    setLoading(true);
    // Simulando dados já que as tabelas ainda não existem
    const mockData: Agendamento[] = [
      {
        id: '1',
        paciente_nome: 'Ana Silva',
        data_agendamento: new Date().toISOString().split('T')[0],
        horario_inicio: '08:00',
        horario_fim: '09:00',
        modalidade: 'FONOAUDIOLOGIA',
        sala_nome: 'Sala Azul',
        profissional_nome: 'Dr. João Santos',
        status: 'agendado',
        convenio_nome: 'UNIMED'
      },
      {
        id: '2',
        paciente_nome: 'Pedro Costa',
        data_agendamento: new Date().toISOString().split('T')[0],
        horario_inicio: '09:00',
        horario_fim: '10:00',
        modalidade: 'PSICOLOGIA',
        sala_nome: 'Sala Verde',
        profissional_nome: 'Dra. Maria Oliveira',
        status: 'compareceu',
        convenio_nome: 'BRADESCO SAÚDE'
      },
      {
        id: '3',
        paciente_nome: 'Carlos Santos',
        data_agendamento: new Date().toISOString().split('T')[0],
        horario_inicio: '10:00',
        horario_fim: '11:00',
        modalidade: 'FISIOTERAPIA',
        sala_nome: 'Sala Lilás',
        profissional_nome: 'Dr. Paulo Lima',
        status: 'agendado',
        convenio_nome: 'SULAMERICA'
      }
    ];

    setAgendamentos(mockData);
    setLoading(false);
  }

  async function fetchEstatisticas() {
    // Simulando estatísticas
    setEstatisticas({
      agendados: 45,
      compareceram: 38,
      faltaram: 5,
      reagendamentos: 2
    });
  }

  const getWeekDays = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAgendamentosForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendamentos.filter(ag => ag.data_agendamento === dateStr);
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '--:--';
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800/50 sticky top-0 z-20 shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  📅
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Agendamentos NAC</h1>
                  <p className="text-slate-600 dark:text-slate-400">Gestão de agendamentos e sessões</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-2xl font-semibold text-sm">
                  Total: {agendamentos.length} agendamentos
                </div>
              </div>
            </div>

            {/* Estatísticas do Mês */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{estatisticas.agendados}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Agendados</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{estatisticas.compareceram}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Compareceram</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{estatisticas.faltaram}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Faltaram</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{estatisticas.reagendamentos}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Reagendamentos</div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <Calendar size={16} />
                  Calendário
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <List size={16} />
                  Lista
                </button>
              </div>

              <div className="flex gap-3 ml-auto">
                <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Plus size={16} />
                  Novo Agendamento
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-all">
                  <Filter size={16} />
                  Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-4 md:px-6 py-2">
          {viewMode === 'calendar' ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden animate-fade-in">
              {/* Cabeçalho do Calendário */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Semana de {getWeekDays()[0].toLocaleDateString('pt-BR')} a {getWeekDays()[6].toLocaleDateString('pt-BR')}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(selectedDate.getDate() - 7);
                        setSelectedDate(newDate);
                      }}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(selectedDate.getDate() + 7);
                        setSelectedDate(newDate);
                      }}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Grade do Calendário */}
              <div className="grid grid-cols-7 gap-1 p-6">
                {getWeekDays().map((day, index) => (
                  <div key={index} className="min-h-[300px] bg-slate-50 dark:bg-slate-700 rounded-2xl p-3">
                    <div className="text-center mb-3">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {getAgendamentosForDate(day).map((agendamento) => (
                        <div
                          key={agendamento.id}
                          className="bg-white dark:bg-slate-600 rounded-xl p-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                          style={{
                            borderLeft: `4px solid ${CORES_ESPECIALIDADES[agendamento.modalidade as keyof typeof CORES_ESPECIALIDADES] || '#6B7280'}`
                          }}
                        >
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {agendamento.paciente_nome}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {agendamento.sala_nome}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Visualização em Lista */
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden animate-fade-in">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-600">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Data/Hora</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Paciente</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Modalidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Sala</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Profissional</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : agendamentos.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                            Nenhum agendamento encontrado
                          </td>
                        </tr>
                      ) : (
                        agendamentos.map((agendamento) => (
                          <tr key={agendamento.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {agendamento.paciente_nome}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {agendamento.convenio_nome}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  backgroundColor: CORES_ESPECIALIDADES[agendamento.modalidade as keyof typeof CORES_ESPECIALIDADES] || '#6B7280'
                                }}
                              >
                                {agendamento.modalidade}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                              {agendamento.sala_nome}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                              {agendamento.profissional_nome}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                agendamento.status === 'agendado' ? 'bg-blue-100 text-blue-700' :
                                agendamento.status === 'compareceu' ? 'bg-green-100 text-green-700' :
                                agendamento.status === 'faltou' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {agendamento.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  Editar
                                </button>
                                <button className="text-red-600 hover:text-red-800 text-sm">
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
