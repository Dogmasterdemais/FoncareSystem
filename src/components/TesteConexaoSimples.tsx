'use client'

import { useEffect, useState } from 'react'
import { moduloTerapeuticoService } from '@/lib/moduloTerapeuticoService'

export default function TesteConexaoSimples() {
  const [resultado, setResultado] = useState<string>('Aguardando...')
  const [resultadoBasico, setResultadoBasico] = useState<string>('Aguardando...')
  const [agendamentos, setAgendamentos] = useState<any[]>([])

  useEffect(() => {
    testarConexaoBasica()
  }, [])

  const testarConexaoBasica = async () => {
    try {
      setResultadoBasico('🔍 Testando conexão básica...')
      
      const resultado = await moduloTerapeuticoService.testarConexaoSimples()
      
      if (resultado.sucesso) {
        setResultadoBasico(`✅ Conexão básica OK! ${resultado.dados?.length || 0} registros`)
        console.log('📊 Dados básicos:', resultado.dados)
      } else {
        setResultadoBasico(`❌ Erro na conexão básica: ${JSON.stringify(resultado.erro)}`)
      }
    } catch (error) {
      setResultadoBasico(`💥 Erro na conexão básica: ${error}`)
    }
  }

  const testarConexaoCompleta = async () => {
    try {
      setResultado('🔍 Testando busca completa...')
      
      const { data, error } = await moduloTerapeuticoService.buscarAgendamentosTerapeuticos({})
      
      if (error) {
        setResultado(`❌ Erro: ${error}`)
      } else {
        setResultado(`✅ Sucesso! ${data.length} agendamentos encontrados`)
        setAgendamentos(data.slice(0, 3)) // Mostra apenas os 3 primeiros
      }
    } catch (error) {
      setResultado(`💥 Erro na conexão: ${error}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Teste de Conexão - Debug Avançado</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">🔧 Teste Básico:</h2>
        <p className="text-lg">{resultadoBasico}</p>
        <button 
          onClick={testarConexaoBasica}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          🔄 Testar Conexão Básica
        </button>
      </div>

      <div className="bg-green-50 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">📋 Teste Completo:</h2>
        <p className="text-lg">{resultado}</p>
        <button 
          onClick={testarConexaoCompleta}
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          🔄 Testar Busca Completa
        </button>
      </div>

      {agendamentos.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">📋 Primeiros Agendamentos:</h2>
          {agendamentos.map((agendamento, index) => (
            <div key={index} className="bg-white p-3 mb-2 rounded border">
              <p><strong>ID:</strong> {agendamento.id}</p>
              <p><strong>Paciente:</strong> {agendamento.paciente?.nome}</p>
              <p><strong>Data:</strong> {agendamento.data_agendamento}</p>
              <p><strong>Status:</strong> {agendamento.status_terapeutico}</p>
              <p><strong>Evolução Realizada:</strong> {agendamento.evolucao_realizada ? 'Sim' : 'Não'}</p>
              <p><strong>Supervisionado:</strong> {agendamento.supervisionado ? 'Sim' : 'Não'}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">💡 Instruções:</h3>
        <ol className="text-sm">
          <li>1. Primeiro teste a conexão básica</li>
          <li>2. Se funcionar, teste a busca completa</li>
          <li>3. Verifique o console do navegador para logs detalhados</li>
        </ol>
      </div>
    </div>
  )
}
