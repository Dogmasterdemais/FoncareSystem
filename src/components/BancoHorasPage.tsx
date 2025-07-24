'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Calendar,
  Plus,
  Users,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Edit,
  Download,
  Search,
  Filter,
  Timer
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MainLayout from './MainLayout';

interface RegistroHoras {
  id: string;
  colaborador_id: string;
  nome_completo: string;
  cargo: string;
  data: string;
  entrada: string;
  saida_almoco: string;
  retorno_almoco: string;
  saida: string;
  horas_trabalhadas: string;
  horas_extras: string;
  justificativa?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

interface BancoHoras {
  id: string;
  colaborador_id: string;
  nome_completo: string;
  cargo: string;
  saldo_horas: string;
  horas_positivas: string;
  horas_negativas: string;
  mes_referencia: number;
  ano_referencia: number;
}

interface ModalRegistroProps {
  isOpen: boolean;
  onClose: () => void;
  registro?: RegistroHoras;
  onSave: (registro: any) => void;
}

const ModalRegistro: React.FC<ModalRegistroProps> = ({ isOpen, onClose, registro, onSave }) => {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    data: '',
    entrada: '',
    saida_almoco: '',
    retorno_almoco: '',
    saida: '',
    justificativa: ''
  });

  useEffect(() => {
    if (registro) {
      setFormData({
        colaborador_id: registro.colaborador_id,
        data: registro.data,
        entrada: registro.entrada,
        saida_almoco: registro.saida_almoco,
        retorno_almoco: registro.retorno_almoco,
        saida: registro.saida,
        justificativa: registro.justificativa || ''
      });
    } else {
      setFormData({
        colaborador_id: '',
        data: '',
        entrada: '',
        saida_almoco: '',
        retorno_almoco: '',
        saida: '',
        justificativa: ''
      });
    }
  }, [registro]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {registro ? 'Editar Registro' : 'Novo Registro de Horas'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Colaborador</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.colaborador_id}
              onChange={(e) => setFormData(prev => ({ ...prev, colaborador_id: e.target.value }))}
              required
            >
              <option value="">Selecione...</option>
              <option value="1">João Silva Santos</option>
              <option value="2">Maria Oliveira Costa</option>
              <option value="3">Carlos Eduardo Lima</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Entrada</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.entrada}
                onChange={(e) => setFormData(prev => ({ ...prev, entrada: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Saída Almoço</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.saida_almoco}
                onChange={(e) => setFormData(prev => ({ ...prev, saida_almoco: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Retorno Almoço</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.retorno_almoco}
                onChange={(e) => setFormData(prev => ({ ...prev, retorno_almoco: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Saída</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.saida}
                onChange={(e) => setFormData(prev => ({ ...prev, saida: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Justificativa (opcional)</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.justificativa}
              onChange={(e) => setFormData(prev => ({ ...prev, justificativa: e.target.value }))}
              placeholder="Justificativa para horas extras ou faltas..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {registro ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BancoHorasPage: React.FC = () => {
  const [abaSelecionada, setAbaSelecionada] = useState<'registros' | 'banco'>('registros');
  const [registros, setRegistros] = useState<RegistroHoras[]>([]);
  const [bancoHoras, setBancoHoras] = useState<BancoHoras[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroHoras | undefined>();
  const [mesReferencia, setMesReferencia] = useState(new Date().getMonth() + 1);
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear());
  const [filtros, setFiltros] = useState({
    status: '',
    busca: '',
    colaborador: ''
  });

  useEffect(() => {
    carregarDados();
  }, [mesReferencia, anoReferencia]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Dados simulados para demonstração
      const registrosSimulados: RegistroHoras[] = [
        {
          id: '1',
          colaborador_id: '1',
          nome_completo: 'João Silva Santos',
          cargo: 'Fisioterapeuta',
          data: '2024-01-15',
          entrada: '08:00',
          saida_almoco: '12:00',
          retorno_almoco: '13:00',
          saida: '19:00',
          horas_trabalhadas: '08:00',
          horas_extras: '01:00',
          justificativa: 'Atendimento urgente',
          status: 'pendente'
        },
        {
          id: '2',
          colaborador_id: '2',
          nome_completo: 'Maria Oliveira Costa',
          cargo: 'Psicóloga',
          data: '2024-01-15',
          entrada: '07:30',
          saida_almoco: '12:00',
          retorno_almoco: '13:00',
          saida: '17:30',
          horas_trabalhadas: '08:00',
          horas_extras: '00:00',
          status: 'aprovado'
        }
      ];

      const bancoHorasSimulado: BancoHoras[] = [
        {
          id: '1',
          colaborador_id: '1',
          nome_completo: 'João Silva Santos',
          cargo: 'Fisioterapeuta',
          saldo_horas: '+02:30',
          horas_positivas: '08:30',
          horas_negativas: '06:00',
          mes_referencia: mesReferencia,
          ano_referencia: anoReferencia
        },
        {
          id: '2',
          colaborador_id: '2',
          nome_completo: 'Maria Oliveira Costa',
          cargo: 'Psicóloga',
          saldo_horas: '-01:15',
          horas_positivas: '02:00',
          horas_negativas: '03:15',
          mes_referencia: mesReferencia,
          ano_referencia: anoReferencia
        }
      ];

      setRegistros(registrosSimulados);
      setBancoHoras(bancoHorasSimulado);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularHoras = (entrada: string, saidaAlmoco: string, retornoAlmoco: string, saida: string) => {
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const entradaMin = parseTime(entrada);
    const saidaAlmocoMin = parseTime(saidaAlmoco);
    const retornoAlmocoMin = parseTime(retornoAlmoco);
    const saidaMin = parseTime(saida);

    const tempoManha = saidaAlmocoMin - entradaMin;
    const tempoTarde = saidaMin - retornoAlmocoMin;
    const totalMinutos = tempoManha + tempoTarde;

    const horasTrabalhadas = formatTime(totalMinutos);
    const horasExtras = totalMinutos > 480 ? formatTime(totalMinutos - 480) : '00:00';

    return { horasTrabalhadas, horasExtras };
  };

  const salvarRegistro = async (dadosRegistro: any) => {
    try {
      const { horasTrabalhadas, horasExtras } = calcularHoras(
        dadosRegistro.entrada,
        dadosRegistro.saida_almoco,
        dadosRegistro.retorno_almoco,
        dadosRegistro.saida
      );

      const novoRegistro: RegistroHoras = {
        id: registroEditando ? registroEditando.id : Date.now().toString(),
        colaborador_id: dadosRegistro.colaborador_id,
        nome_completo: dadosRegistro.colaborador_id === '1' ? 'João Silva Santos' : 
                      dadosRegistro.colaborador_id === '2' ? 'Maria Oliveira Costa' : 'Carlos Eduardo Lima',
        cargo: dadosRegistro.colaborador_id === '1' ? 'Fisioterapeuta' : 
               dadosRegistro.colaborador_id === '2' ? 'Psicóloga' : 'Recepcionista',
        data: dadosRegistro.data,
        entrada: dadosRegistro.entrada,
        saida_almoco: dadosRegistro.saida_almoco,
        retorno_almoco: dadosRegistro.retorno_almoco,
        saida: dadosRegistro.saida,
        horas_trabalhadas: horasTrabalhadas,
        horas_extras: horasExtras,
        justificativa: dadosRegistro.justificativa,
        status: 'pendente'
      };

      if (registroEditando) {
        setRegistros(prev => prev.map(r => r.id === registroEditando.id ? novoRegistro : r));
      } else {
        setRegistros(prev => [...prev, novoRegistro]);
      }

      setRegistroEditando(undefined);
      alert('Registro salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
    }
  };

  const aprovarRegistro = async (id: string) => {
    try {
      setRegistros(prev => prev.map(r => r.id === id ? { ...r, status: 'aprovado' } : r));
      alert('Registro aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar registro:', error);
    }
  };

  const rejeitarRegistro = async (id: string) => {
    try {
      setRegistros(prev => prev.map(r => r.id === id ? { ...r, status: 'rejeitado' } : r));
      alert('Registro rejeitado!');
    } catch (error) {
      console.error('Erro ao rejeitar registro:', error);
    }
  };

  const registrosFiltrados = registros.filter(registro => {
    const matchStatus = !filtros.status || registro.status === filtros.status;
    const matchBusca = !filtros.busca || 
      registro.nome_completo.toLowerCase().includes(filtros.busca.toLowerCase());
    const matchColaborador = !filtros.colaborador || registro.colaborador_id === filtros.colaborador;
    
    return matchStatus && matchBusca && matchColaborador;
  });

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Banco de Horas
            </h1>
            <p className="text-blue-100 text-lg">
              {getMesNome(mesReferencia)} de {anoReferencia}
            </p>
          </div>
          
          <div className="flex gap-4">
            <select
              className="px-4 py-3 border border-blue-300/30 rounded-xl focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 transition-all duration-200"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1} className="text-gray-900">
                  {getMesNome(i + 1)}
                </option>
              ))}
            </select>
            
            <select
              className="px-4 py-3 border border-blue-300/30 rounded-xl focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 transition-all duration-200"
              value={anoReferencia}
              onChange={(e) => setAnoReferencia(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i} className="text-gray-900">
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
            
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-white/20"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Registrar Horas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setAbaSelecionada('registros')}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              abaSelecionada === 'registros'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Registros de Ponto
          </button>
          <button
            onClick={() => setAbaSelecionada('banco')}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              abaSelecionada === 'banco'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Timer className="w-4 h-4" />
            Saldo de Horas
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Buscar</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nome do colaborador..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Colaborador</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={filtros.colaborador}
              onChange={(e) => setFiltros(prev => ({ ...prev, colaborador: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="1">João Silva Santos</option>
              <option value="2">Maria Oliveira Costa</option>
              <option value="3">Carlos Eduardo Lima</option>
            </select>
          </div>

          {abaSelecionada === 'registros' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Download className="w-4 h-4" />
              <span className="font-medium">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Registros */}
      {abaSelecionada === 'registros' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Saída Almoço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Retorno
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Saída
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Horas Extras
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {registrosFiltrados.map((registro, index) => (
                  <tr key={registro.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                  }`}>
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {registro.nome_completo}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {registro.cargo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(registro.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900 dark:text-white">
                      {registro.entrada}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {registro.saida_almoco}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {registro.retorno_almoco}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {registro.saida}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`${registro.horas_extras !== '00:00' ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                        {registro.horas_extras}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registro.status === 'pendente' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : registro.status === 'aprovado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registro.status === 'pendente' ? 'Pendente' : 
                         registro.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setRegistroEditando(registro);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {registro.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => aprovarRegistro(registro.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                              title="Aprovar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejeitarRegistro(registro.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Rejeitar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Banco de Horas */}
      {abaSelecionada === 'banco' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Horas Positivas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Horas Negativas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bancoHoras.map((banco) => (
                  <tr key={banco.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {banco.nome_completo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {banco.cargo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                      {banco.horas_positivas}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                      {banco.horas_negativas}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      <span className={`${
                        banco.saldo_horas.startsWith('+') 
                          ? 'text-green-600' 
                          : banco.saldo_horas.startsWith('-') 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`}>
                        {banco.saldo_horas}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {banco.saldo_horas.startsWith('+') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3" />
                          Positivo
                        </span>
                      ) : banco.saldo_horas.startsWith('-') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3" />
                          Negativo
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Neutro
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <ModalRegistro
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRegistroEditando(undefined);
        }}
        registro={registroEditando}
        onSave={salvarRegistro}
      />
      </div>
    </MainLayout>
  );
};

export default BancoHorasPage;
