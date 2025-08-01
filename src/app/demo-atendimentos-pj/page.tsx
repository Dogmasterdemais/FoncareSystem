'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

// Simulação de dados para demonstração
const mockData = {
  profissional: {
    id: '1d8360d5-fc69-470b-a39c-93665976675a',
    nome: 'Douglas Henrique Nogueira Araújo',
    cargo: 'Fonoaudiólogo'
  },
  sala: {
    id: 'sala-001',
    numero: '101',
    nome: 'Sala de Fonoaudiologia 1',
    valor_hora: 85.00,
    valor_evolucao: 25.00
  },
  periodo: {
    ano: 2025,
    mes: 7
  }
};

const mockAtendimentos = [
  {
    id: 'atend-001',
    paciente: 'Ana Silva',
    data: '2025-07-23',
    hora_inicio: '08:00',
    hora_fim: '08:50',
    duracao_minutos: 50,
    tem_evolucao: true,
    evolucao_no_prazo: true,
    valor_hora: 85.00,
    valor_evolucao: 25.00,
    valor_total: 95.83 // (85 * 50/60) + 25
  },
  {
    id: 'atend-002',
    paciente: 'João Santos',
    data: '2025-07-23',
    hora_inicio: '09:00',
    hora_fim: '09:50',
    duracao_minutos: 50,
    tem_evolucao: false,
    evolucao_no_prazo: false,
    valor_hora: 85.00,
    valor_evolucao: 0,
    valor_total: 70.83 // (85 * 50/60) + 0
  },
  {
    id: 'atend-003',
    paciente: 'Maria Oliveira',
    data: '2025-07-23',
    hora_inicio: '10:00',
    hora_fim: '10:45',
    duracao_minutos: 45,
    tem_evolucao: true,
    evolucao_no_prazo: false, // Evolução atrasada
    valor_hora: 85.00,
    valor_evolucao: 25.00,
    valor_total: 88.75 // (85 * 45/60) + 25
  }
];

const DemoAtendimentosPJ: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState(mockAtendimentos);
  const [resumoMensal, setResumoMensal] = useState({
    total_atendimentos: 0,
    total_horas: 0,
    total_evolucoes: 0,
    valor_total: 0,
    taxa_evolucao: 0,
    evolucoes_atrasadas: 0
  });

  useEffect(() => {
    calcularResumo();
  }, [atendimentos]);

  const calcularResumo = () => {
    const total_atendimentos = atendimentos.length;
    const total_horas = atendimentos.reduce((sum, a) => sum + (a.duracao_minutos / 60), 0);
    const total_evolucoes = atendimentos.filter(a => a.tem_evolucao).length;
    const valor_total = atendimentos.reduce((sum, a) => sum + a.valor_total, 0);
    const taxa_evolucao = total_atendimentos > 0 ? (total_evolucoes / total_atendimentos) * 100 : 0;
    const evolucoes_atrasadas = atendimentos.filter(a => a.tem_evolucao && !a.evolucao_no_prazo).length;

    setResumoMensal({
      total_atendimentos,
      total_horas,
      total_evolucoes,
      valor_total,
      taxa_evolucao,
      evolucoes_atrasadas
    });
  };

  const adicionarEvolucao = (atendimentoId: string) => {
    setAtendimentos(prev => prev.map(a => 
      a.id === atendimentoId 
        ? { 
            ...a, 
            tem_evolucao: true, 
            evolucao_no_prazo: true,
            valor_evolucao: 25.00,
            valor_total: (a.valor_hora * a.duracao_minutos / 60) + 25.00
          }
        : a
    ));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Pagamentos PJ - Demonstração
        </h1>
        <p className="text-gray-600">
          Fluxo: Atendimento → Evolução (12h) → Cálculo de Pagamento
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900">{resumoMensal.total_atendimentos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Horas</p>
              <p className="text-2xl font-bold text-gray-900">{resumoMensal.total_horas.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Evolução</p>
              <p className="text-2xl font-bold text-gray-900">{resumoMensal.taxa_evolucao.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {resumoMensal.valor_total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Profissional */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profissional</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nome</p>
            <p className="font-medium">{mockData.profissional.nome}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cargo</p>
            <p className="font-medium">{mockData.profissional.cargo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sala</p>
            <p className="font-medium">{mockData.sala.numero} - {mockData.sala.nome}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">Valor/Hora</p>
            <p className="font-medium text-green-600">R$ {mockData.sala.valor_hora.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor/Evolução</p>
            <p className="font-medium text-blue-600">R$ {mockData.sala.valor_evolucao.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Atendimentos do Dia</h2>
        
        <div className="space-y-4">
          {atendimentos.map((atendimento) => (
            <div key={atendimento.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{atendimento.paciente}</span>
                    <span className="ml-4 text-sm text-gray-600">
                      {atendimento.hora_inicio} - {atendimento.hora_fim} ({atendimento.duracao_minutos}min)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Valor Hora:</span>
                      <p className="font-medium">R$ {(atendimento.valor_hora * atendimento.duracao_minutos / 60).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor Evolução:</span>
                      <p className="font-medium">R$ {atendimento.valor_evolucao.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-bold text-green-600">R$ {atendimento.valor_total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
                      {atendimento.tem_evolucao ? (
                        <div className="flex items-center">
                          <CheckCircle className={`w-4 h-4 mr-1 ${atendimento.evolucao_no_prazo ? 'text-green-600' : 'text-yellow-600'}`} />
                          <span className={`text-sm ${atendimento.evolucao_no_prazo ? 'text-green-600' : 'text-yellow-600'}`}>
                            {atendimento.evolucao_no_prazo ? 'Evolução OK' : 'Evolução Atrasada'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                          <span className="text-sm text-red-600">Sem Evolução</span>
                          <button
                            onClick={() => adicionarEvolucao(atendimento.id)}
                            className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Adicionar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alertas */}
        {resumoMensal.evolucoes_atrasadas > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                {resumoMensal.evolucoes_atrasadas} evolução(ões) atrasada(s) - Pode impactar no pagamento
              </span>
            </div>
          </div>
        )}

        {/* Fórmula de Cálculo */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💰 Fórmula de Pagamento PJ:</h3>
          <p className="text-blue-800 text-sm">
            <strong>Valor Total = (Valor/Hora × Tempo em horas) + (Valor/Evolução × Número de evoluções)</strong>
          </p>
          <p className="text-blue-700 text-xs mt-1">
            ⚠️ Apenas atendimentos com evolução registrada em até 12h são pagos integralmente
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoAtendimentosPJ;
