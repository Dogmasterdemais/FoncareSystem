'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import { useUnidade } from '../../../context/UnidadeContext';
import { supabase } from '../../../lib/supabaseClient';
import { Calendar, Clock, Download, Search, FileText, Printer } from 'lucide-react';

interface Paciente {
  id: string;
  nome: string;
  convenio_nome: string;
}

interface AgendamentoCronograma {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  especialidade_nome: string;
  sala_nome: string;
  sala_cor: string;
  profissional_nome: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  convenio_nome: string;
}

interface CronogramaSemanal {
  [key: string]: AgendamentoCronograma[];
}

export default function CronogramaPage() {
  const { unidadeSelecionada } = useUnidade();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string>('');
  const [cronograma, setCronograma] = useState<CronogramaSemanal>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarGerarPDF, setMostrarGerarPDF] = useState(false);

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira', 
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  useEffect(() => {
    if (unidadeSelecionada) {
      fetchPacientes();
    }
  }, [unidadeSelecionada]);

  useEffect(() => {
    if (pacienteSelecionado) {
      fetchCronogramaPaciente();
    }
  }, [pacienteSelecionado]);

  const fetchPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nome,
          convenios!inner(nome)
        `)
        .eq('unidade_id', unidadeSelecionada)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        return;
      }

      const pacientesFormatados = data?.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        convenio_nome: p.convenios?.nome || 'Particular'
      })) || [];

      setPacientes(pacientesFormatados);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const fetchCronogramaPaciente = async () => {
    if (!pacienteSelecionado) return;

    try {
      setLoading(true);
      
      // Buscar agendamentos futuros do paciente
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('paciente_id', pacienteSelecionado)
        .gte('data_agendamento', hoje)
        .order('data_agendamento');

      if (error) {
        console.error('Erro ao buscar cronograma:', error);
        return;
      }

      // Organizar por dia da semana
      const cronogramaSemanal: CronogramaSemanal = {};
      
      data?.forEach(agendamento => {
        const data = new Date(agendamento.data_agendamento);
        const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        const nomeDia = diasSemana[diaSemana === 0 ? 6 : diaSemana - 1]; // Ajustar para começar na segunda
        
        if (!cronogramaSemanal[nomeDia]) {
          cronogramaSemanal[nomeDia] = [];
        }
        
        cronogramaSemanal[nomeDia].push(agendamento);
      });

      setCronograma(cronogramaSemanal);
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '--:--';
  };

  const gerarPDF = () => {
    const paciente = pacientes.find(p => p.id === pacienteSelecionado);
    if (!paciente) return;

    // Criar conteúdo HTML para o PDF
    let htmlContent = `
      <html>
        <head>
          <title>Cronograma - ${paciente.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .day-section { margin-bottom: 25px; }
            .day-title { background-color: #f0f0f0; padding: 10px; font-weight: bold; font-size: 16px; }
            .appointment { border: 1px solid #ddd; margin: 5px 0; padding: 10px; border-radius: 5px; }
            .time { font-weight: bold; color: #333; }
            .specialty { color: #666; }
            .no-appointments { color: #999; font-style: italic; padding: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CRONOGRAMA DE TERAPIAS</h1>
            <h2>${paciente.nome}</h2>
            <p>Convênio: ${paciente.convenio_nome}</p>
            <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
    `;

    diasSemana.forEach(dia => {
      htmlContent += `<div class="day-section">`;
      htmlContent += `<div class="day-title">${dia}</div>`;
      
      if (cronograma[dia] && cronograma[dia].length > 0) {
        cronograma[dia].forEach(agendamento => {
          htmlContent += `
            <div class="appointment">
              <div class="time">${formatTime(agendamento.horario_inicio)} - ${formatTime(agendamento.horario_fim)}</div>
              <div class="specialty">${agendamento.especialidade_nome}</div>
              <div>Sala: ${agendamento.sala_nome}</div>
              <div>Profissional: ${agendamento.profissional_nome}</div>
            </div>
          `;
        });
      } else {
        htmlContent += `<div class="no-appointments">Nenhuma terapia agendada</div>`;
      }
      
      htmlContent += `</div>`;
    });

    htmlContent += `
        </body>
      </html>
    `;

    // Abrir em nova janela para impressão/PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pacienteSelecionadoInfo = pacientes.find(p => p.id === pacienteSelecionado);

  return (
    <MainLayout>
      <div className="w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-emerald-100 dark:border-emerald-800/50 sticky top-0 z-20 shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  📅
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cronograma de Pacientes</h1>
                  <p className="text-slate-600 dark:text-slate-400">Visualização semanal e geração de PDF</p>
                </div>
              </div>

              {pacienteSelecionado && (
                <button
                  onClick={gerarPDF}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Gerar PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-6 py-6 w-full max-w-full">
          {/* Seleção de Paciente */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 dark:border-emerald-800/50 overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Search className="w-6 h-6 text-emerald-600" />
                Selecionar Paciente
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Buscar paciente:
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome do paciente..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Paciente:
                  </label>
                  <select
                    value={pacienteSelecionado}
                    onChange={(e) => setPacienteSelecionado(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione um paciente...</option>
                    {pacientesFiltrados.map(paciente => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.nome} - {paciente.convenio_nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma */}
          {pacienteSelecionado && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 dark:border-emerald-800/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Cronograma Semanal</h2>
                    {pacienteSelecionadoInfo && (
                      <p className="text-emerald-100">
                        {pacienteSelecionadoInfo.nome} - {pacienteSelecionadoInfo.convenio_nome}
                      </p>
                    )}
                  </div>
                  <Calendar className="w-12 h-12 text-emerald-200" />
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <span className="text-slate-600 dark:text-slate-400">Carregando cronograma...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {diasSemana.map(dia => (
                      <div key={dia} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-700 px-4 py-3 border-b border-slate-200 dark:border-slate-600">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            {dia}
                          </h3>
                        </div>
                        
                        <div className="p-4">
                          {cronograma[dia] && cronograma[dia].length > 0 ? (
                            <div className="space-y-3">
                              {cronograma[dia].map(agendamento => (
                                <div 
                                  key={agendamento.id}
                                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-emerald-600" />
                                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                                        {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                                      </span>
                                    </div>
                                    <div 
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: agendamento.sala_cor || '#6B7280' }}
                                    />
                                  </div>
                                  
                                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    <div><strong>Especialidade:</strong> {agendamento.especialidade_nome}</div>
                                    <div><strong>Sala:</strong> {agendamento.sala_nome}</div>
                                    <div><strong>Profissional:</strong> {agendamento.profissional_nome}</div>
                                    <div><strong>Data:</strong> {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>Nenhuma terapia agendada para {dia.toLowerCase()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!pacienteSelecionado && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                Selecione um Paciente
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Escolha um paciente para visualizar seu cronograma semanal de terapias
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
