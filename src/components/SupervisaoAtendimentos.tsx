import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, TrendingUp, MapPin, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SupervisaoSala {
  unidade_nome: string;
  sala_nome: string;
  sala_numero: string;
  sala_tipo: string;
  agendados_hoje: number;
  chegaram_hoje: number;
  em_atendimento_agora: number;
  concluidos_hoje: number;
  proximos_agendamentos: number;
}

interface SupervisaoAtendimentosProps {
  unidadeSelecionada?: string;
}

export default function SupervisaoAtendimentos({ unidadeSelecionada }: SupervisaoAtendimentosProps) {
  const [salas, setSalas] = useState<SupervisaoSala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados de supervisão
  const buscarDadosSuperviso = async () => {
    try {
      let query = supabase
        .from('vw_supervisao_atendimentos')
        .select('*');

      if (unidadeSelecionada) {
        query = query.eq('unidade_nome', unidadeSelecionada);
      }

      const { data, error } = await query.order('unidade_nome, sala_numero');

      if (error) throw error;

      setSalas(data || []);
    } catch (err) {
      console.error('Erro ao buscar dados de supervisão:', err);
      setError('Erro ao carregar dados de supervisão');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar automaticamente a cada 1 minuto
  useEffect(() => {
    buscarDadosSuperviso();
    
    const interval = setInterval(buscarDadosSuperviso, 60000);
    return () => clearInterval(interval);
  }, [unidadeSelecionada]);

  // Calcular totais
  const totais = {
    agendados: salas.reduce((sum, sala) => sum + sala.agendados_hoje, 0),
    chegaram: salas.reduce((sum, sala) => sum + sala.chegaram_hoje, 0),
    em_atendimento: salas.reduce((sum, sala) => sum + sala.em_atendimento_agora, 0),
    concluidos: salas.reduce((sum, sala) => sum + sala.concluidos_hoje, 0),
    proximos: salas.reduce((sum, sala) => sum + sala.proximos_agendamentos, 0),
  };

  // Calcular taxa de ocupação
  const calcularOcupacao = (sala: SupervisaoSala) => {
    if (sala.agendados_hoje === 0) return 0;
    return Math.round((sala.concluidos_hoje / sala.agendados_hoje) * 100);
  };

  // Obter cor baseada na ocupação
  const getCorOcupacao = (ocupacao: number) => {
    if (ocupacao >= 80) return 'text-green-600 bg-green-50';
    if (ocupacao >= 60) return 'text-yellow-600 bg-yellow-50';
    if (ocupacao >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando supervisão...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={() => {
            setError(null);
            buscarDadosSuperviso();
          }}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Supervisão de Atendimentos
        </h1>
        <div className="text-sm text-gray-600">
          Atualização automática a cada minuto
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{totais.agendados}</div>
              <div className="text-sm text-blue-600">Agendados Hoje</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <User className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-700">{totais.chegaram}</div>
              <div className="text-sm text-orange-600">Chegaram</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{totais.em_atendimento}</div>
              <div className="text-sm text-blue-600">Em Atendimento</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-700">{totais.concluidos}</div>
              <div className="text-sm text-green-600">Concluídos</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-700">{totais.proximos}</div>
              <div className="text-sm text-purple-600">Próximos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de Ocupação Geral */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Taxa de Ocupação Geral</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso do Dia</span>
              <span>{totais.agendados > 0 ? Math.round((totais.concluidos / totais.agendados) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                style={{
                  width: `${totais.agendados > 0 ? Math.round((totais.concluidos / totais.agendados) * 100) : 0}%`
                }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {totais.concluidos} / {totais.agendados}
            </div>
            <div className="text-sm text-gray-600">Sessões</div>
          </div>
        </div>
      </div>

      {/* Detalhamento por Sala */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">🏥 Atendimentos por Sala</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sala</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Agendados</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chegaram</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Em Atendimento</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Concluídos</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Próximos</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ocupação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma sala encontrada</p>
                  </td>
                </tr>
              ) : (
                salas.map((sala, index) => {
                  const ocupacao = calcularOcupacao(sala);
                  const corOcupacao = getCorOcupacao(ocupacao);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {sala.sala_nome} ({sala.sala_numero})
                          </div>
                          <div className="text-sm text-gray-500">
                            {sala.unidade_nome} • {sala.sala_tipo}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sala.agendados_hoje}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {sala.chegaram_hoje}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sala.em_atendimento_agora}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sala.concluidos_hoje}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {sala.proximos_agendamentos}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${corOcupacao}`}>
                          {ocupacao}%
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sala mais ocupada */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-3">🏆 Sala Mais Ocupada</h4>
          {salas.length > 0 ? (
            (() => {
              const salaMaisOcupada = salas.reduce((prev, current) => 
                calcularOcupacao(current) > calcularOcupacao(prev) ? current : prev
              );
              const ocupacao = calcularOcupacao(salaMaisOcupada);
              
              return (
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {salaMaisOcupada.sala_nome}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {salaMaisOcupada.unidade_nome}
                  </div>
                  <div className={`text-lg font-semibold ${getCorOcupacao(ocupacao).split(' ')[0]}`}>
                    {ocupacao}% de ocupação
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-gray-500">Nenhum dado disponível</p>
          )}
        </div>

        {/* Salas em atendimento */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-3">⚡ Salas Ativas</h4>
          <div className="text-2xl font-bold text-blue-600">
            {salas.filter(sala => sala.em_atendimento_agora > 0).length}
          </div>
          <div className="text-sm text-gray-600">
            de {salas.length} salas totais
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${salas.length > 0 ? (salas.filter(sala => sala.em_atendimento_agora > 0).length / salas.length) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        {/* Produtividade */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-3">📊 Produtividade</h4>
          <div className="text-2xl font-bold text-green-600">
            {totais.agendados > 0 ? Math.round((totais.concluidos / totais.agendados) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">
            Taxa de conclusão geral
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {totais.concluidos} concluídos de {totais.agendados} agendados
          </div>
        </div>
      </div>
    </div>
  );
}
