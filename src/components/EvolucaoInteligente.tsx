'use client'

import React, { useState } from 'react'
import { FileText, Target, Brain, Star } from 'lucide-react'
import MainLayout from './MainLayout'

export default function EvolucaoInteligente() {
  const [evolucao, setEvolucao] = useState({
    conteudo_evolucao: '',
    objetivos_alcancados: '',
    observacoes_comportamentais: '',
    proximos_passos: '',
    materiais_utilizados: [],
    qualidade_sessao: 5
  })

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Evolução de Sessão Inteligente
          </h1>

          {/* Template inteligente com IA para sugestões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Conteúdo da Evolução
              </label>
              <textarea
                value={evolucao.conteudo_evolucao}
                onChange={(e) => setEvolucao({...evolucao, conteudo_evolucao: e.target.value})}
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl"
                placeholder="Descreva o que foi trabalhado na sessão..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Objetivos Alcançados
              </label>
              <textarea
                value={evolucao.objetivos_alcancados}
                onChange={(e) => setEvolucao({...evolucao, objetivos_alcancados: e.target.value})}
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl"
                placeholder="Quais objetivos foram atingidos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Brain className="w-4 h-4 inline mr-2" />
                Observações Comportamentais
              </label>
              <textarea
                value={evolucao.observacoes_comportamentais}
                onChange={(e) => setEvolucao({...evolucao, observacoes_comportamentais: e.target.value})}
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl"
                placeholder="Como foi o comportamento do paciente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Qualidade da Sessão (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={evolucao.qualidade_sessao}
                onChange={(e) => setEvolucao({...evolucao, qualidade_sessao: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Baixa</span>
                <span className="font-semibold">{evolucao.qualidade_sessao}</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
