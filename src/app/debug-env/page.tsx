'use client';

import { useEffect, useState } from 'react';

export default function DebugEnv() {
  const [envVars, setEnvVars] = useState<any>({});
  const [supabaseTest, setSupabaseTest] = useState<any>({});

  useEffect(() => {
    // Verificar variáveis de ambiente
    const vars = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida ✅' : 'Não definida ❌',
      googleMaps: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Definida ✅' : 'Não definida ❌',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Não definida',
      nodeEnv: process.env.NODE_ENV
    };
    setEnvVars(vars);

    // Teste de conexão Supabase
    const testSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setSupabaseTest({
            status: 'erro',
            message: 'Variáveis de ambiente não configuradas'
          });
          return;
        }

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Teste simples de conexão
        const { data, error } = await supabase
          .from('pacientes')
          .select('count')
          .limit(1);

        if (error) {
          setSupabaseTest({
            status: 'erro',
            message: error.message,
            code: error.code
          });
        } else {
          setSupabaseTest({
            status: 'sucesso',
            message: 'Conexão com Supabase estabelecida com sucesso!',
            data: data
          });
        }
      } catch (err: any) {
        setSupabaseTest({
          status: 'erro',
          message: err.message
        });
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug - Variáveis de Ambiente</h1>
        
        {/* Variáveis de Ambiente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📝 Variáveis de Ambiente</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className={envVars.supabaseUrl ? 'text-green-600' : 'text-red-600'}>
                {envVars.supabaseUrl || 'Não definida ❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className={envVars.supabaseKey.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {envVars.supabaseKey}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:</span>
              <span className={envVars.googleMaps.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {envVars.googleMaps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NODE_ENV:</span>
              <span className="text-blue-600">{envVars.nodeEnv}</span>
            </div>
          </div>
        </div>

        {/* Teste Supabase */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🗄️ Teste de Conexão Supabase</h2>
          
          {supabaseTest.status === 'sucesso' && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="flex items-center">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <span className="text-green-800 font-medium">{supabaseTest.message}</span>
              </div>
            </div>
          )}
          
          {supabaseTest.status === 'erro' && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <div className="flex items-center mb-2">
                <span className="text-red-600 text-xl mr-2">❌</span>
                <span className="text-red-800 font-medium">Erro de Conexão</span>
              </div>
              <p className="text-red-700 text-sm">{supabaseTest.message}</p>
              {supabaseTest.code && (
                <p className="text-red-600 text-xs mt-1">Código: {supabaseTest.code}</p>
              )}
            </div>
          )}
          
          {!supabaseTest.status && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex items-center">
                <span className="text-blue-600 text-xl mr-2">⏳</span>
                <span className="text-blue-800">Testando conexão...</span>
              </div>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Como Configurar na Vercel:</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Acesse o painel da Vercel</li>
            <li>Vá em <strong>Settings → Environment Variables</strong></li>
            <li>Adicione as variáveis:</li>
          </ol>
          <div className="bg-yellow-100 p-3 rounded mt-3 font-mono text-sm">
            <div>NEXT_PUBLIC_SUPABASE_URL = {envVars.supabaseUrl || 'https://urpfjihtkvvqehjppbrg.supabase.co'}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6...</div>
            <div>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSyBsEYe05izIGga0Brfdg3RdHuyzxOd-gUo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
