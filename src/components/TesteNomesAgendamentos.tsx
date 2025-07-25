'use client'

import { useState, useEffect } from 'react';
import { moduloTerapeuticoService } from '../lib/moduloTerapeuticoService';

export default function TesteNomesAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const testarBuscaComNomes = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      console.log('🧪 Iniciando teste de busca com nomes...');
      
      const resultado = await moduloTerapeuticoService.buscarAgendamentosTerapeuticos({
        // Sem filtros para pegar todos os agendamentos
      });
      
      console.log('📊 Resultado da busca:', resultado);
      
      if (resultado.error) {
        setErro(`Erro: ${resultado.error}`);
        return;
      }
      
      setAgendamentos(resultado.data || []);
      
      // Log detalhado dos nomes
      resultado.data?.forEach((agendamento, index) => {
        console.log(`📋 Agendamento ${index + 1}:`, {
          id: agendamento.id,
          paciente: agendamento.pacientes?.nome,
          profissional: agendamento.colaboradores?.nome_completo,
          sala: agendamento.salas?.nome,
          especialidade: agendamento.especialidades?.nome,
          data: agendamento.data_agendamento,
          horario: `${agendamento.horario_inicio} - ${agendamento.horario_fim}`
        });
      });
      
    } catch (error) {
      console.error('💥 Erro no teste:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧪 Teste de Nomes nos Agendamentos</h2>
      
      <button
        onClick={testarBuscaComNomes}
        disabled={carregando}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {carregando ? 'Carregando...' : 'Testar Busca com Nomes'}
      </button>
      
      {erro && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Erro:</h3>
          <p>{erro}</p>
        </div>
      )}
      
      {agendamentos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            📊 Agendamentos Encontrados ({agendamentos.length})
          </h3>
          
          {agendamentos.map((agendamento, index) => (
            <div key={agendamento.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>ID:</strong> {agendamento.id}</p>
                  <p><strong>Paciente:</strong> 
                    <span className={agendamento.pacientes?.nome?.includes('Paciente ') ? 'text-red-600' : 'text-green-600'}>
                      {agendamento.pacientes?.nome || 'N/A'}
                    </span>
                  </p>
                  <p><strong>Profissional:</strong> 
                    <span className={agendamento.colaboradores?.nome_completo?.includes('Profissional ') ? 'text-red-600' : 'text-green-600'}>
                      {agendamento.colaboradores?.nome_completo || 'N/A'}
                    </span>
                  </p>
                </div>
                <div>
                  <p><strong>Sala:</strong> 
                    <span className={agendamento.salas?.nome?.includes('Sala ') ? 'text-red-600' : 'text-green-600'}>
                      {agendamento.salas?.nome || 'N/A'}
                    </span>
                  </p>
                  <p><strong>Especialidade:</strong> 
                    <span className={agendamento.especialidades?.nome?.includes('Especialidade ') ? 'text-red-600' : 'text-green-600'}>
                      {agendamento.especialidades?.nome || 'N/A'}
                    </span>
                  </p>
                  <p><strong>Data:</strong> {agendamento.data_agendamento}</p>
                  <p><strong>Horário:</strong> {agendamento.horario_inicio} - {agendamento.horario_fim}</p>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Status:</strong> {agendamento.status_terapeutico}</p>
                {agendamento.observacoes_supervisao && (
                  <p><strong>Observações:</strong> {agendamento.observacoes_supervisao}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!carregando && agendamentos.length === 0 && !erro && (
        <p className="text-gray-500">Nenhum agendamento encontrado. Clique no botão para testar.</p>
      )}
    </div>
  );
}
