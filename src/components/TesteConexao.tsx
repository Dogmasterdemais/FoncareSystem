'use client'

import React, { useState } from 'react'
import { moduloTerapeuticoService } from '@/lib/moduloTerapeuticoService'
import MainLayout from './MainLayout'

export default function TesteConexao() {
  const [resultado, setResultado] = useState('')
  const [loading, setLoading] = useState(false)

  const testarConexao = async () => {
    setLoading(true)
    setResultado('Testando conexão...')
    
    try {
      // Teste 1: Buscar agendamentos simples
      console.log('=== TESTE 1: Buscar agendamentos ===')
      const { data, error } = await moduloTerapeuticoService.buscarAgendamentosTerapeuticos({
        data: new Date().toISOString().slice(0, 10)
      })
      
      if (error) {
        setResultado(`Erro: ${JSON.stringify(error, null, 2)}`)
      } else {
        setResultado(`✅ Sucesso! Encontrados ${data?.length || 0} agendamentos`)
      }
    } catch (error) {
      setResultado(`❌ Erro de conexão: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testarSalas = async () => {
    setLoading(true)
    setResultado('Testando busca de salas...')
    
    try {
      const { data, error } = await moduloTerapeuticoService.buscarSalas()
      
      if (error) {
        setResultado(`Erro nas salas: ${JSON.stringify(error, null, 2)}`)
      } else {
        setResultado(`✅ Salas encontradas: ${data?.length || 0}`)
      }
    } catch (error) {
      setResultado(`❌ Erro nas salas: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Teste de Conexão - Módulo Terapêutico</h1>
        
        <div className="space-y-4">
          <button
            onClick={testarConexao}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Agendamentos'}
          </button>
          
          <button
            onClick={testarSalas}
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testando...' : 'Testar Salas'}
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Resultado:</h3>
          <pre className="whitespace-pre-wrap text-sm">{resultado}</pre>
        </div>
      </div>
    </MainLayout>
  )
}
