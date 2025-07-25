'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Activity,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import MainLayout from './MainLayout'
import { moduloTerapeuticoService } from '@/lib/moduloTerapeuticoService'

export default function DashboardTerapeuticoAvancado() {
  const [estatisticas, setEstatisticas] = useState(null)
  const [periodo, setPeriodo] = useState({
    inicio: new Date().toISOString().slice(0, 10),
    fim: new Date().toISOString().slice(0, 10)
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [periodo])

  const carregarEstatisticas = async () => {
    try {
      const { data } = await moduloTerapeuticoService.buscarEstatisticasSupervisao(
        periodo.inicio, 
        periodo.fim
      )
      setEstatisticas(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Terapêutico Avançado
          </h1>
          
          <div className="flex gap-4">
            <input
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo({...periodo, inicio: e.target.value})}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={periodo.fim}
              onChange={(e) => setPeriodo({...periodo, fim: e.target.value})}
              className="px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total de Sessões</p>
                <p className="text-3xl font-bold">{estatisticas?.total_sessoes || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Taxa de Conclusão</p>
                <p className="text-3xl font-bold">{estatisticas?.percentual_conclusao || 0}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Evoluções Realizadas</p>
                <p className="text-3xl font-bold">{estatisticas?.percentual_evolucoes || 0}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Valor Total Aprovado</p>
                <p className="text-3xl font-bold">
                  R$ {(estatisticas?.valor_total_aprovado || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Gráficos e Análises Avançadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolução Temporal
            </h3>
            {/* Aqui você pode integrar Chart.js ou similar */}
            <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de linha temporal será implementado aqui</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição por Especialidade
            </h3>
            <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de pizza será implementado aqui</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
