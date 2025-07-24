"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Aguardando...');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from('pacientes').select('*').limit(1);
        if (error) {
          setStatus('Erro: ' + error.message);
          setErrorDetail(JSON.stringify(error, null, 2));
        } else {
          setStatus('Conexão OK!');
        }
      } catch (err: any) {
        setStatus('Erro de conexão');
        setErrorDetail(err?.message || JSON.stringify(err));
      }
    }
    checkConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg">Teste de conexão Supabase</h2>
      <p>{status}</p>
      {errorDetail && (
        <pre className="bg-gray-100 text-red-600 p-2 mt-2 rounded text-xs overflow-x-auto">
          {errorDetail}
        </pre>
      )}
    </div>
  );
}
