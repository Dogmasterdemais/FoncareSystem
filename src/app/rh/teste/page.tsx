'use client';

import { useEffect, useState } from 'react';
import { rhService, Colaborador, Unidade } from '../../../lib/rhService';

export default function TestePage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testarConexao();
  }, []);

  const testarConexao = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Testando conexão com Supabase...');
      
      // Testar busca de unidades
      const unidadesData = await rhService.unidadeService.listar();
      console.log('Unidades encontradas:', unidadesData);
      setUnidades(unidadesData);

      // Testar busca de colaboradores
      const colaboradoresData = await rhService.colaboradorService.listar();
      console.log('Colaboradores encontrados:', colaboradoresData);
      setColaboradores(colaboradoresData);

    } catch (err: any) {
      console.error('Erro no teste:', err);
      setError(err?.message || err?.toString() || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão RH</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão RH</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
        </div>
        <button 
          onClick={testarConexao}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão RH</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Unidades ({unidades.length})</h2>
          {unidades.length === 0 ? (
            <p className="text-gray-500">Nenhuma unidade encontrada</p>
          ) : (
            <ul className="space-y-2">
              {unidades.map((unidade: any) => (
                <li key={unidade.id} className="border-b pb-1">
                  <strong>{unidade.nome}</strong>
                  <br />
                  <small className="text-gray-600">ID: {unidade.id}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Colaboradores ({colaboradores.length})</h2>
          {colaboradores.length === 0 ? (
            <p className="text-gray-500">Nenhum colaborador encontrado</p>
          ) : (
            <ul className="space-y-2">
              {colaboradores.slice(0, 5).map((colaborador: any) => (
                <li key={colaborador.id} className="border-b pb-1">
                  <strong>{colaborador.nome_completo}</strong>
                  <br />
                  <small className="text-gray-600">
                    {colaborador.cargo} - {colaborador.regime_contratacao}
                  </small>
                </li>
              ))}
              {colaboradores.length > 5 && (
                <li className="text-gray-500">
                  ... e mais {colaboradores.length - 5} colaboradores
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>Sucesso!</strong> Conexão com o banco de dados funcionando corretamente.
      </div>
    </div>
  );
}
