// Página de exemplo demonstrando integração completa
'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { SeletorSalasAgendamento } from '@/components/agendamento/SeletorSalasAgendamento';
import { AgendaRecepcao } from '@/components/recepcao/AgendaRecepcao';
import { useUnidade } from '@/context/UnidadeContext';
import { SalaParaAgendamento } from '@/hooks/useAgendamentoView';
import { 
  Calendar, 
  Building2, 
  CheckCircle,
  Eye,
  Settings,
  Plus
} from 'lucide-react';

export default function ExemploIntegracaoPage() {
  const { unidadeSelecionada, unidades } = useUnidade();
  const [abaSelecionada, setAbaSelecionada] = useState<'agendamento' | 'recepcao'>('agendamento');
  const [salaSelecionada, setSalaSelecionada] = useState<SalaParaAgendamento | null>(null);
  const [novoAgendamento, setNovoAgendamento] = useState({
    paciente: '',
    profissional: '',
    data: '',
    horario_inicio: '',
    horario_fim: '',
    observacoes: ''
  });

  const unidadeAtual = unidades.find(u => u.id === unidadeSelecionada);

  const handleSalaSelecionada = (sala: SalaParaAgendamento) => {
    setSalaSelecionada(sala);
    console.log('Sala selecionada:', sala);
  };

  const handleCriarAgendamento = () => {
    if (!salaSelecionada) {
      alert('Selecione uma sala primeiro');
      return;
    }
    
    console.log('Criando agendamento:', {
      ...novoAgendamento,
      sala: salaSelecionada
    });
    
    // Aqui você implementaria a lógica de criação do agendamento
    alert('Agendamento criado com sucesso!');
  };

  if (!unidadeSelecionada) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Selecione uma unidade para visualizar a integração de salas e agendamentos
              </span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Integração de Salas e Agendamentos
          </h1>
          <div className="flex items-center text-gray-600">
            <Building2 className="w-5 h-5 mr-2" />
            <span>Unidade: {unidadeAtual?.nome || 'Não identificada'}</span>
          </div>
        </div>

        {/* Navegação por abas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setAbaSelecionada('agendamento')}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${abaSelecionada === 'agendamento'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </div>
              </button>
              <button
                onClick={() => setAbaSelecionada('recepcao')}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${abaSelecionada === 'recepcao'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Agenda da Recepção
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {abaSelecionada === 'agendamento' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de agendamento */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Dados do Agendamento
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente
                  </label>
                  <input
                    type="text"
                    value={novoAgendamento.paciente}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, paciente: e.target.value }))}
                    placeholder="Nome do paciente"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={novoAgendamento.data}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário início
                    </label>
                    <input
                      type="time"
                      value={novoAgendamento.horario_inicio}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, horario_inicio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário fim
                    </label>
                    <input
                      type="time"
                      value={novoAgendamento.horario_fim}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, horario_fim: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={novoAgendamento.observacoes}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre o agendamento..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sala selecionada */}
                {salaSelecionada && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sala Selecionada
                    </h4>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: salaSelecionada.sala_cor }}
                      />
                      <div>
                        <p className="font-medium text-blue-900">
                          {salaSelecionada.sala_nome}
                          {salaSelecionada.sala_numero && ` #${salaSelecionada.sala_numero}`}
                        </p>
                        <p className="text-sm text-blue-700">
                          {salaSelecionada.especialidade_nome} • 
                          {salaSelecionada.vagas_disponiveis} vaga{salaSelecionada.vagas_disponiveis !== 1 ? 's' : ''} disponível{salaSelecionada.vagas_disponiveis !== 1 ? 'eis' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCriarAgendamento}
                  disabled={!salaSelecionada || !novoAgendamento.paciente || !novoAgendamento.data}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Agendamento
                </button>
              </div>
            </div>

            {/* Seletor de salas */}
            <SeletorSalasAgendamento
              unidadeId={unidadeSelecionada}
              onSalaSelecionada={handleSalaSelecionada}
              salaAtual={salaSelecionada?.sala_id}
            />
          </div>
        ) : (
          /* Agenda da recepção */
          <AgendaRecepcao />
        )}

        {/* Informações de desenvolvimento */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Informações de Desenvolvimento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Componentes Implementados:</h4>
              <ul className="space-y-1">
                <li>• SeletorSalasAgendamento - Seleção de salas com profissionais</li>
                <li>• AgendaRecepcao - Visualização completa dos agendamentos</li>
                <li>• useAgendamentoView - Hook para integração com views</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Funcionalidades:</h4>
              <ul className="space-y-1">
                <li>• Busca e filtros em tempo real</li>
                <li>• Visualização de profissionais por sala</li>
                <li>• Status visual das salas (ocupação)</li>
                <li>• Integração automática com views do Supabase</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
