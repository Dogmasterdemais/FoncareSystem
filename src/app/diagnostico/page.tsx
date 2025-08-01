'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function DiagnosticoPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const diagnostics: DiagnosticResult[] = []

    // Test 1: Environment Variables
    diagnostics.push({
      test: 'Variáveis de Ambiente',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'success' : 'error',
      message: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? 'Variáveis de ambiente carregadas' 
        : 'Variáveis de ambiente não encontradas',
      details: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'PRESENT' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'undefined'
      }
    })

    // Test 2: Supabase Connection
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase.from('pacientes').select('count').limit(1)
        
        if (error) {
          diagnostics.push({
            test: 'Conexão Supabase',
            status: 'error',
            message: 'Erro ao conectar com Supabase',
            details: {
              error: error.message,
              code: error.code,
              hint: error.hint
            }
          })
        } else {
          diagnostics.push({
            test: 'Conexão Supabase',
            status: 'success',
            message: 'Conexão com Supabase OK',
            details: { response: 'Connection successful' }
          })
        }
      } else {
        diagnostics.push({
          test: 'Conexão Supabase',
          status: 'error',
          message: 'Variáveis do Supabase não configuradas',
          details: { error: 'Missing environment variables' }
        })
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Conexão Supabase',
        status: 'error',
        message: 'Erro crítico na conexão',
        details: { error: error.message }
      })
    }

    // Test 3: Google Maps API
    try {
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        )
        
        diagnostics.push({
          test: 'Google Maps API',
          status: response.ok ? 'success' : 'warning',
          message: response.ok ? 'Google Maps API OK' : 'Google Maps API com problemas',
          details: { status: response.status, statusText: response.statusText }
        })
      } else {
        diagnostics.push({
          test: 'Google Maps API',
          status: 'error',
          message: 'Chave do Google Maps não configurada',
          details: { error: 'Missing API key' }
        })
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Google Maps API',
        status: 'warning',
        message: 'Não foi possível testar Google Maps',
        details: { error: error.message }
      })
    }

    // Test 4: Browser/Runtime Info
    diagnostics.push({
      test: 'Informações do Runtime',
      status: 'success',
      message: 'Informações coletadas',
      details: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server Side',
        timestamp: new Date().toISOString(),
        location: typeof window !== 'undefined' ? window.location.href : 'Server Side',
        isClient: typeof window !== 'undefined'
      }
    })

    setResults(diagnostics)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg">Executando diagnóstico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔧 Diagnóstico do Sistema FoncareSystem
            </h1>
            <p className="text-gray-600">
              Verificação completa de conectividade e configurações
            </p>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                    <h3 className="text-lg font-semibold">{result.test}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{result.message}</p>
                
                {result.details && (
                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="text-sm font-semibold mb-2">Detalhes:</h4>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📋 Como Interpretar os Resultados
            </h3>
            <ul className="text-blue-700 space-y-1">
              <li><strong>✅ SUCCESS:</strong> Tudo funcionando corretamente</li>
              <li><strong>⚠️ WARNING:</strong> Funcional, mas com possíveis problemas</li>
              <li><strong>❌ ERROR:</strong> Não funcionando - requer ação imediata</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setLoading(true); runDiagnostics() }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Executar Diagnóstico Novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
