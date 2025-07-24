'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TesteDadosReais() {
  const [resultados, setResultados] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testarTodosOsDados = async () => {
      console.log('🔍 Iniciando teste de dados reais...');
      
      try {
        const teste: any = {
          pacientes: null,
          agendamentos: null,
          colaboradores: null,
          faturamento: null
        };

        // 1. Testar pacientes
        console.log('1. 👥 Testando pacientes...');
        const { data: pacientes, error: errorPacientes } = await supabase
          .from('vw_pacientes_com_unidade')
          .select('id, nome, cep, cidade, bairro, unidade_nome')
          .limit(10);
        
        teste.pacientes = {
          sucesso: !errorPacientes,
          total: pacientes?.length || 0,
          dados: pacientes || [],
          erro: errorPacientes?.message
        };

        // 2. Testar agendamentos
        console.log('2. 📅 Testando agendamentos...');
        const { data: agendamentos, error: errorAgendamentos } = await supabase
          .from('vw_agendamentos_completo')
          .select('id, data_agendamento, status, especialidade_nome, valor_procedimento')
          .limit(10);
        
        teste.agendamentos = {
          sucesso: !errorAgendamentos,
          total: agendamentos?.length || 0,
          dados: agendamentos || [],
          erro: errorAgendamentos?.message
        };

        // 3. Testar colaboradores
        console.log('3. 👨‍⚕️ Testando colaboradores...');
        const { data: colaboradores, error: errorColaboradores } = await supabase
          .from('vw_colaboradores_completo')
          .select('id, nome_completo, cargo, status, unidade_nome')
          .limit(10);
        
        teste.colaboradores = {
          sucesso: !errorColaboradores,
          total: colaboradores?.length || 0,
          dados: colaboradores || [],
          erro: errorColaboradores?.message
        };

        // 4. Testar faturamento
        console.log('4. 💰 Testando faturamento...');
        const { data: faturamento, error: errorFaturamento } = await supabase
          .from('vw_faturamento_completo')
          .select('id, data_agendamento, valor_procedimento, convenio_nome, status_faturamento')
          .limit(10);
        
        teste.faturamento = {
          sucesso: !errorFaturamento,
          total: faturamento?.length || 0,
          dados: faturamento || [],
          erro: errorFaturamento?.message
        };

        setResultados(teste);
        setLoading(false);
        
        console.log('🎉 Teste de dados concluído!', teste);
        
      } catch (error) {
        console.error('❌ Erro durante teste:', error);
        setLoading(false);
      }
    };

    testarTodosOsDados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🔍 Testando dados reais do banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔍 Teste de Dados Reais</h1>
          <p className="text-gray-600 mt-2">Verificação das tabelas do Supabase</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pacientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              👥 Pacientes
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                resultados.pacientes?.sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {resultados.pacientes?.sucesso ? '✅ OK' : '❌ Erro'}
              </span>
            </h2>
            
            <p className="text-gray-600 mb-3">
              <strong>Total encontrado:</strong> {resultados.pacientes?.total || 0}
            </p>
            
            {resultados.pacientes?.erro && (
              <p className="text-red-600 text-sm mb-3">Erro: {resultados.pacientes.erro}</p>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {resultados.pacientes?.dados?.map((p: any, i: number) => (
                <div key={i} className="border p-2 rounded text-sm">
                  <strong>{p.nome}</strong><br />
                  CEP: {p.cep} - {p.bairro}, {p.cidade}<br />
                  Unidade: {p.unidade_nome}
                </div>
              ))}
            </div>
          </div>

          {/* Agendamentos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              📅 Agendamentos
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                resultados.agendamentos?.sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {resultados.agendamentos?.sucesso ? '✅ OK' : '❌ Erro'}
              </span>
            </h2>
            
            <p className="text-gray-600 mb-3">
              <strong>Total encontrado:</strong> {resultados.agendamentos?.total || 0}
            </p>
            
            {resultados.agendamentos?.erro && (
              <p className="text-red-600 text-sm mb-3">Erro: {resultados.agendamentos.erro}</p>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {resultados.agendamentos?.dados?.map((a: any, i: number) => (
                <div key={i} className="border p-2 rounded text-sm">
                  <strong>{a.especialidade_nome}</strong><br />
                  Data: {a.data_agendamento} - Status: {a.status}<br />
                  {a.valor_procedimento && <span>Valor: R$ {a.valor_procedimento}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Colaboradores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              👨‍⚕️ Colaboradores
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                resultados.colaboradores?.sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {resultados.colaboradores?.sucesso ? '✅ OK' : '❌ Erro'}
              </span>
            </h2>
            
            <p className="text-gray-600 mb-3">
              <strong>Total encontrado:</strong> {resultados.colaboradores?.total || 0}
            </p>
            
            {resultados.colaboradores?.erro && (
              <p className="text-red-600 text-sm mb-3">Erro: {resultados.colaboradores.erro}</p>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {resultados.colaboradores?.dados?.map((c: any, i: number) => (
                <div key={i} className="border p-2 rounded text-sm">
                  <strong>{c.nome_completo}</strong><br />
                  Cargo: {c.cargo} - Status: {c.status}<br />
                  Unidade: {c.unidade_nome}
                </div>
              ))}
            </div>
          </div>

          {/* Faturamento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              💰 Faturamento
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                resultados.faturamento?.sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {resultados.faturamento?.sucesso ? '✅ OK' : '❌ Erro'}
              </span>
            </h2>
            
            <p className="text-gray-600 mb-3">
              <strong>Total encontrado:</strong> {resultados.faturamento?.total || 0}
            </p>
            
            {resultados.faturamento?.erro && (
              <p className="text-red-600 text-sm mb-3">Erro: {resultados.faturamento.erro}</p>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {resultados.faturamento?.dados?.map((f: any, i: number) => (
                <div key={i} className="border p-2 rounded text-sm">
                  <strong>R$ {f.valor_procedimento}</strong><br />
                  Data: {f.data_agendamento}<br />
                  Convênio: {f.convenio_nome}<br />
                  Status: {f.status_faturamento || 'Sem status'}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Resumo dos Dados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Pacientes:</span><br />
              {resultados.pacientes?.total || 0} registros
            </div>
            <div>
              <span className="font-medium">Agendamentos:</span><br />
              {resultados.agendamentos?.total || 0} registros
            </div>
            <div>
              <span className="font-medium">Colaboradores:</span><br />
              {resultados.colaboradores?.total || 0} registros
            </div>
            <div>
              <span className="font-medium">Faturamento:</span><br />
              {resultados.faturamento?.total || 0} registros
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <a 
            href="/dashboard-executivo" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            🚀 Ir para Dashboard Executivo
          </a>
        </div>
      </div>
    </div>
  );
}
