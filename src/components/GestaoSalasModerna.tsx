'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Settings, 
  Users, 
  Palette,
  X,
  Save,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Activity,
  CheckCircle,
  UserPlus,
  Sparkles
} from 'lucide-react'
import { moduloTerapeuticoService } from '@/lib/moduloTerapeuticoService'
import MainLayout from './MainLayout'

interface Sala {
  id: string
  nome: string
  cor: string
  capacidade_criancas: number
  capacidade_profissionais: number
  especialidades: string[]
  ocupacao_atual?: number
  profissionais_alocados?: number
}

interface Profissional {
  id: string
  nome_completo: string
  especialidades: any[]
}

interface Especialidade {
  id: string
  nome: string
  cor: string
}

export default function GestaoSalasPage() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalAlocacao, setModalAlocacao] = useState(false)
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cor: '#0052CC',
    capacidade_criancas: 6,
    capacidade_profissionais: 3,
    especialidades: [] as string[]
  })
  const [filtros, setFiltros] = useState({
    busca: '',
    especialidade: '',
    status: ''
  })

  const stats = {
    totalSalas: salas.length,
    salasAtivas: salas.filter(s => s.ocupacao_atual && s.ocupacao_atual > 0).length,
    capacidadeTotal: salas.reduce((acc, s) => acc + s.capacidade_criancas, 0),
    ocupacaoMedia: salas.length > 0 ? Math.round(salas.reduce((acc, s) => acc + (s.ocupacao_atual || 0), 0) / salas.length) : 0
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const salasResult = await moduloTerapeuticoService.buscarSalas()
      
      // Dados mock temporários para profissionais e especialidades
      const profissionaisData = [
        { id: '1', nome_completo: 'Ana Silva', especialidades: [{ nome: 'Fisioterapia' }] },
        { id: '2', nome_completo: 'Carlos Santos', especialidades: [{ nome: 'Fonoaudiologia' }] },
        { id: '3', nome_completo: 'Maria Costa', especialidades: [{ nome: 'Terapia Ocupacional' }] }
      ]
      
      const especialidadesData = [
        { id: '1', nome: 'Fisioterapia', cor: '#10B981' },
        { id: '2', nome: 'Fonoaudiologia', cor: '#3B82F6' },
        { id: '3', nome: 'Terapia Ocupacional', cor: '#8B5CF6' },
        { id: '4', nome: 'Psicologia', cor: '#F59E0B' }
      ]
      
      setSalas(salasResult.data || [])
      setProfissionais(profissionaisData)
      setEspecialidades(especialidadesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const salvarSala = async () => {
    try {
      if (salaSelecionada) {
        await moduloTerapeuticoService.atualizarSala(salaSelecionada.id, formData)
      } else {
        // Para criar sala nova, vamos usar um método simulado
        console.log('Criando nova sala:', formData)
      }
      setModalAberto(false)
      carregarDados()
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar sala:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      cor: '#0052CC',
      capacidade_criancas: 6,
      capacidade_profissionais: 3,
      especialidades: []
    })
    setSalaSelecionada(null)
  }

  const editarSala = (sala: Sala) => {
    setSalaSelecionada(sala)
    setFormData({
      nome: sala.nome,
      cor: sala.cor,
      capacidade_criancas: sala.capacidade_criancas,
      capacidade_profissionais: sala.capacidade_profissionais,
      especialidades: sala.especialidades
    })
    setModalAberto(true)
  }

  const calcularOcupacao = (sala: Sala) => {
    if (!sala.ocupacao_atual || !sala.capacidade_criancas) return 0
    return Math.round((sala.ocupacao_atual / sala.capacidade_criancas) * 100)
  }

  const getStatusColor = (ocupacao: number) => {
    if (ocupacao >= 90) return 'text-red-600 bg-red-50'
    if (ocupacao >= 70) return 'text-amber-600 bg-amber-50'
    if (ocupacao >= 50) return 'text-blue-600 bg-blue-50'
    return 'text-green-600 bg-green-50'
  }

  const salasFiltradas = salas.filter(sala => {
    return (
      (filtros.busca === '' || sala.nome.toLowerCase().includes(filtros.busca.toLowerCase())) &&
      (filtros.especialidade === '' || sala.especialidades.includes(filtros.especialidade))
    )
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              Gestão de Salas
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gerencie salas, capacidades e alocação de profissionais
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Sala
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Salas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSalas}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salas Ativas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.salasAtivas}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacidade Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.capacidadeTotal}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupação Média</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.ocupacaoMedia}%</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar salas..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                value={filtros.especialidade}
                onChange={(e) => setFiltros({ ...filtros, especialidade: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas as especialidades</option>
                {especialidades.map(esp => (
                  <option key={esp.id} value={esp.nome}>{esp.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Salas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {salasFiltradas.map((sala) => {
            const ocupacao = calcularOcupacao(sala)
            return (
              <div key={sala.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: sala.cor }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sala.nome}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editarSala(sala)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Capacidade Crianças</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{sala.capacidade_criancas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Capacidade Profissionais</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{sala.capacidade_profissionais}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ocupação Atual</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-lg ${getStatusColor(ocupacao)}`}>
                      {ocupacao}%
                    </span>
                  </div>
                </div>

                {sala.especialidades && sala.especialidades.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {sala.especialidades.slice(0, 3).map((esp, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs text-gray-700 dark:text-gray-300 rounded-lg">
                          {esp}
                        </span>
                      ))}
                      {sala.especialidades.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs text-gray-500 dark:text-gray-400 rounded-lg">
                          +{sala.especialidades.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setSalaSelecionada(sala)
                      setModalAlocacao(true)
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Gerenciar Profissionais
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Nova Sala */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {salaSelecionada ? 'Editar Sala' : 'Nova Sala'}
                </h2>
                <button
                  onClick={() => {
                    setModalAberto(false)
                    resetForm()
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Sala
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Ex: Sala Azul"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capacidade Crianças
                    </label>
                    <input
                      type="number"
                      value={formData.capacidade_criancas}
                      onChange={(e) => setFormData({ ...formData, capacidade_criancas: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capacidade Profissionais
                    </label>
                    <input
                      type="number"
                      value={formData.capacidade_profissionais}
                      onChange={(e) => setFormData({ ...formData, capacidade_profissionais: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cor da Sala
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      className="w-16 h-12 border border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="#0052CC"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especialidades
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {especialidades.map((esp) => (
                      <label key={esp.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.especialidades.includes(esp.nome)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                especialidades: [...formData.especialidades, esp.nome]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                especialidades: formData.especialidades.filter(nome => nome !== esp.nome)
                              })
                            }
                          }}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{esp.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => {
                    setModalAberto(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarSala}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {salaSelecionada ? 'Atualizar' : 'Criar Sala'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Alocação de Profissionais */}
        {modalAlocacao && salaSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profissionais - {salaSelecionada.nome}
                </h2>
                <button
                  onClick={() => setModalAlocacao(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">
                    Capacidade: {salaSelecionada.capacidade_profissionais} profissionais
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Configure quais profissionais podem utilizar esta sala
                </p>
              </div>

              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Funcionalidade de alocação em desenvolvimento</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setModalAlocacao(false)}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default GestaoSalasModerna
