import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Play, CheckCircle, AlertCircle, Users, Timer } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useUnidade } from '../context/UnidadeContext';

interface PacienteTerapia {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  status_dinamico: string;
  tempo_sessao_atual: number;
  tempo_restante_minutos: number;
  duracao_planejada: number;
  tipo_sessao: string;
  profissional_ativo: number;
  profissional_nome: string;
  profissional_2_nome?: string;
  profissional_3_nome?: string;
  especialidade_nome: string;
  especialidade_cor?: string;
  sessao_iniciada_em?: string;
  proxima_acao: string;
}

interface SalaTerapia {
  sala_id: string;
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  unidade_nome: string;
  pacientes: PacienteTerapia[];
  profissionais_ativos: {
    profissional_1?: string;
    profissional_2?: string;
    profissional_3?: string;
  };
  capacidade_maxima: number;
  ocupacao_atual: number;
}

interface AgendaSalasProfissionaisProps {
  // Usa contexto global de unidade
}

export default function AgendaSalasProfissionais({ }: AgendaSalasProfissionaisProps) {
  const { unidadeSelecionada, unidades } = useUnidade();
  const [salas, setSalas] = useState<SalaTerapia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null);

  // Função para obter nome da unidade selecionada
  const getNomeUnidadeSelecionada = () => {
    if (!unidadeSelecionada) return '';
    const unidade = unidades.find(u => u.id === unidadeSelecionada);
    return unidade?.nome || '';
  };

  // Buscar dados organizados por sala
  const buscarDadosSalas = async () => {
    try {
      console.log('🚀 Iniciando buscarDadosSalas...');
      
      // Primeiro executar processamento automático de transições (opcional)
      try {
        await supabase.rpc('executar_processamento_automatico');
        console.log('✅ Processamento automático executado');
      } catch (rpcError) {
        console.warn('⚠️ RPC executar_processamento_automatico falhou (ignorando):', rpcError);
      }
      
      // CORREÇÃO: Buscar agendamentos do dia todo, não apenas do horário próximo
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0]; // YYYY-MM-DD
      const horaAtual = agora.getHours();
      const minutoAtual = agora.getMinutes();
      const horarioAtual = `${horaAtual.toString().padStart(2, '0')}:${minutoAtual.toString().padStart(2, '0')}:00`;

      console.log(`📅 Buscando agendamentos para: ${dataHoje}, unidade: ${unidadeSelecionada || 'TODAS'}`);

      // Tentar buscar agendamentos da view primeiro
      let agendamentosData: any[] = [];
      let agendamentosError: any = null;

      try {
        // Primeira tentativa: usar a view
        let queryAgendamentos = supabase
          .from('vw_agendamentos_completo')
          .select('*')
          .eq('data_agendamento', dataHoje)
          .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento']);

        if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
          queryAgendamentos = queryAgendamentos.eq('unidade_id', unidadeSelecionada);
        }

        const result = await queryAgendamentos.order('sala_numero').order('horario_inicio');
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        agendamentosData = result.data || [];
        console.log('✅ Dados obtidos da view vw_agendamentos_completo');

      } catch (viewError) {
        console.warn('⚠️ View vw_agendamentos_completo falhou, tentando query direta:', viewError);

        // Segunda tentativa: query direta
        let queryDireta = supabase
          .from('agendamentos')
          .select(`
            id,
            paciente_nome,
            horario_inicio,
            horario_fim,
            status,
            data_agendamento,
            sala_id,
            profissional_id,
            salas(
              id,
              numero,
              nome,
              cor,
              unidade_id,
              unidades(
                nome
              )
            ),
            profissionais(
              id,
              nome,
              especialidades(
                nome,
                cor
              )
            )
          `)
          .eq('data_agendamento', dataHoje)
          .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento']);

        if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
          queryDireta = queryDireta.eq('salas.unidade_id', unidadeSelecionada);
        }

        const resultDireto = await queryDireta.order('salas.numero').order('horario_inicio');
        
        if (resultDireto.error) {
          throw new Error(`Erro na query direta: ${resultDireto.error.message}`);
        }

        agendamentosData = resultDireto.data || [];
        console.log('✅ Dados obtidos da query direta de agendamentos');

        // Transformar dados da query direta para formato da view
        agendamentosData = agendamentosData.map((agendamento: any) => ({
          id: agendamento.id,
          paciente_nome: agendamento.paciente_nome,
          horario_inicio: agendamento.horario_inicio,
          horario_fim: agendamento.horario_fim,
          status: agendamento.status,
          data_agendamento: agendamento.data_agendamento,
          sala_id: agendamento.sala_id,
          sala_numero: agendamento.salas?.numero,
          sala_nome: agendamento.salas?.nome,
          sala_cor: agendamento.salas?.cor,
          unidade_id: agendamento.salas?.unidade_id,
          unidade_nome: agendamento.salas?.unidades?.nome,
          profissional_id: agendamento.profissional_id,
          profissional_nome: agendamento.profissionais?.nome,
          especialidade_nome: agendamento.profissionais?.especialidades?.[0]?.nome,
          especialidade_cor: agendamento.profissionais?.especialidades?.[0]?.cor,
          status_dinamico: agendamento.status,
          tempo_sessao_atual: 0,
          tempo_restante_minutos: 0,
          duracao_planejada: 60,
          tipo_sessao: 'individual',
          profissional_ativo: 1,
          proxima_acao: 'aguardando'
        }));
      }

      console.log(`🔍 Agenda Salas Principal: Encontrados ${agendamentosData?.length || 0} agendamentos relevantes para hoje (${dataHoje})`);
      console.log('📋 Agendamentos encontrados:', agendamentosData);

      // Buscar TODAS as salas da unidade (mesmo sem agendamentos)
      console.log('🏢 Buscando salas...');
      let querySalas = supabase
        .from('salas')
        .select(`
          id,
          numero,
          nome,
          cor,
          unidade_id,
          ativo,
          unidades(
            nome
          )
        `)
        .eq('ativo', true);

      if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
        querySalas = querySalas.eq('unidade_id', unidadeSelecionada);
      }

      const { data: salasData, error: salasError } = await querySalas.order('numero');

      if (salasError) {
        throw new Error(`Erro ao buscar salas: ${salasError.message}`);
      }

      console.log(`🏢 Encontradas ${salasData?.length || 0} salas`);
      console.log('🏢 Salas encontradas:', salasData);

      // PRIMEIRO: Criar mapa de salas (incluindo vazias)
      const salasMap = new Map<string, SalaTerapia>();
      
      console.log('🏗️ Criando entradas para todas as salas...');
      salasData?.forEach((sala: any) => {
        const salaKey = sala.id;
        salasMap.set(salaKey, {
          sala_id: sala.id,
          sala_nome: sala.nome,
          sala_numero: sala.numero,
          sala_cor: sala.cor || '#E5E7EB',
          unidade_nome: sala.unidades?.nome || 'Unidade não definida',
          pacientes: [],
          profissionais_ativos: {},
          capacidade_maxima: 6,
          ocupacao_atual: 0
        });
      });
      
      console.log(`🏢 Criadas ${salasMap.size} salas (incluindo vazias)`);
      
      // Função auxiliar para processar profissionais
      const processarProfissionaisSalas = (profissionaisSalas: any[]) => {
        console.log(`👨‍⚕️ Processando ${profissionaisSalas?.length || 0} profissionais alocados`);
        console.log('👨‍⚕️ Dados dos profissionais:', profissionaisSalas);
        
        // Agrupar profissionais por sala
        const profissionaisPorSala = new Map<string, any[]>();
        profissionaisSalas?.forEach((ps: any) => {
          if (!profissionaisPorSala.has(ps.sala_id)) {
            profissionaisPorSala.set(ps.sala_id, []);
          }
          profissionaisPorSala.get(ps.sala_id)?.push(ps);
        });
        
        console.log(`👨‍⚕️ Profissionais agrupados por ${profissionaisPorSala.size} salas`);
        
        // Aplicar profissionais às salas
        profissionaisPorSala.forEach((profissionais, salaId) => {
          const sala = salasMap.get(salaId);
          if (sala) {
            console.log(`👨‍⚕️ Processando sala ${sala.sala_numero} com ${profissionais.length} profissionais`);
            
            // Alocar até 3 profissionais por sala
            profissionais.slice(0, 3).forEach((ps: any, index: number) => {
              const posicaoProf = `profissional_${index + 1}` as keyof typeof sala.profissionais_ativos;
              
              // CORREÇÃO: Buscar nome em diferentes estruturas
              let nomeProfissional = 'Nome não encontrado';
              if (ps.nome) {
                nomeProfissional = ps.nome;
              } else if (ps.profissional_nome) {
                nomeProfissional = ps.profissional_nome;
              } else if (ps.profissionais?.nome) {
                nomeProfissional = ps.profissionais.nome;
              }
              
              console.log(`👨‍⚕️ DEBUG: Estrutura do profissional:`, JSON.stringify(ps, null, 2));
              console.log(`👨‍⚕️ DEBUG: Propriedades disponíveis:`, Object.keys(ps));
              console.log(`👨‍⚕️ Nome extraído: ${nomeProfissional}`);
              
              sala.profissionais_ativos[posicaoProf] = nomeProfissional;
              
              console.log(`👨‍⚕️ Sala ${sala.sala_numero}: ${nomeProfissional} alocado como Prof. ${index + 1}`);
            });
          } else {
            console.warn(`⚠️ Sala ${salaId} não encontrada no mapa de salas`);
          }
        });
        
        console.log(`✅ Profissionais aplicados às salas:`);
        salasMap.forEach((sala, salaId) => {
          const profs = Object.values(sala.profissionais_ativos).filter(p => p).length;
          if (profs > 0) {
            console.log(`  Sala ${sala.sala_numero}: ${profs} profissionais alocados`);
          }
        });
      };
      
      // BUSCAR PROFISSIONAIS ALOCADOS NAS SALAS
      console.log('👨‍⚕️ Buscando profissionais alocados nas salas...');
      console.log(`📅 Data de referência: ${dataHoje}`);
      console.log(`🏢 Unidade selecionada: ${unidadeSelecionada || 'TODAS'}`);
      
      try {
        // Primeira tentativa: query completa com joins
        console.log('🔄 Tentando query completa com joins...');
        let queryProfissionaisSalas = supabase
          .from('profissionais_salas')
          .select(`
            sala_id,
            profissional_id,
            turno,
            profissionais(
              id,
              nome,
              especialidades(
                nome,
                cor
              )
            ),
            salas(
              id,
              numero,
              unidade_id
            )
          `)
          .eq('ativo', true)
          .lte('data_inicio', dataHoje)
          .or(`data_fim.is.null,data_fim.gte.${dataHoje}`);

        // TESTE: Desabilitando filtro de unidade temporariamente
        console.log(`🧪 TESTE: Desabilitando filtro de unidade (unidadeSelecionada: ${unidadeSelecionada})`);
        // if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
        //   queryProfissionaisSalas = queryProfissionaisSalas.eq('salas.unidade_id', unidadeSelecionada);
        // }

        const { data: profissionaisSalas, error: profissionaisSalasError } = await queryProfissionaisSalas;
        
        if (profissionaisSalasError) {
          throw new Error(`Erro na query completa: ${profissionaisSalasError.message}`);
        }
        
        console.log(`👨‍⚕️ Query completa funcionou: ${profissionaisSalas?.length || 0} registros`);
        processarProfissionaisSalas(profissionaisSalas);
        
      } catch (error) {
        console.warn('⚠️ Query completa falhou, tentando query simples:', error);
        
        // Segunda tentativa: query simples
        const { data: profissionaisSalasSimples, error: errorSimples } = await supabase
          .from('profissionais_salas')
          .select('sala_id, profissional_id, turno')
          .eq('ativo', true)
          .lte('data_inicio', dataHoje)
          .or(`data_fim.is.null,data_fim.gte.${dataHoje}`);
        
        if (errorSimples) {
          console.error('❌ Query simples também falhou:', errorSimples);
        } else {
          console.log(`👨‍⚕️ Query simples funcionou: ${profissionaisSalasSimples?.length || 0} registros`);
          
          // Buscar nomes dos profissionais separadamente
          if (profissionaisSalasSimples && profissionaisSalasSimples.length > 0) {
            const profissionalIds = profissionaisSalasSimples.map(ps => ps.profissional_id);
            console.log(`👨‍⚕️ IDs dos profissionais para buscar nomes:`, profissionalIds);
            
            const { data: profissionais, error: profissionaisError } = await supabase
              .from('profissionais')
              .select('id, nome')
              .in('id', profissionalIds);
            
            if (profissionaisError) {
              console.error('❌ Erro ao buscar nomes dos profissionais:', profissionaisError);
            } else {
              console.log(`👨‍⚕️ Nomes encontrados:`, profissionais);
            }
            
            // Combinar dados
            const profissionaisCombinados = profissionaisSalasSimples.map(ps => {
              const profissional = profissionais?.find(p => p.id === ps.profissional_id);
              return {
                ...ps,
                nome: profissional?.nome || 'Nome não encontrado',
                profissional_nome: profissional?.nome || 'Nome não encontrado'
              };
            });
            
            console.log(`👨‍⚕️ Dados combinados finais:`, profissionaisCombinados);
            processarProfissionaisSalas(profissionaisCombinados);
          }
        }
      }
      
      // DEPOIS: Adicionar agendamentos às salas correspondentes
      console.log('📅 Adicionando agendamentos às salas...');
      agendamentosData?.forEach((agendamento: any) => {
        const salaKey = agendamento.sala_id;
        
        // Calcular se está próximo do horário atual (para destacar visualmente)
        const horarioAgendamento = agendamento.horario_inicio;
        const horaAgendamento = parseInt(horarioAgendamento.split(':')[0]);
        const minutoAgendamento = parseInt(horarioAgendamento.split(':')[1]);
        
        const agendamentoMinutos = horaAgendamento * 60 + minutoAgendamento;
        const atualMinutos = horaAtual * 60 + minutoAtual;
        const diferencaMinutos = Math.abs(agendamentoMinutos - atualMinutos);
        
        // Marcar se está próximo do horário (para destacar na UI)
        const proximoDoHorario = diferencaMinutos <= 30;
        
        // Buscar a sala (que já foi criada)
        const sala = salasMap.get(salaKey);
        if (sala) {
          // Adicionar informação se está próximo do horário
          const agendamentoComProximidade = {
            ...agendamento,
            proximo_do_horario: proximoDoHorario
          };
          
          console.log(`➕ Adicionando agendamento: ${agendamento.paciente_nome} - Sala ${agendamento.sala_numero} - ${agendamento.horario_inicio} - Prof: ${agendamento.profissional_nome || 'SEM PROF'}`);
          
          sala.pacientes.push(agendamentoComProximidade);
            
          // Contar ocupação atual (pacientes em atendimento)
          if (agendamento.status === 'em_atendimento') {
            sala.ocupacao_atual += 1;
          }

          // CORREÇÃO: NÃO sobrescrever profissionais_ativos vindos de profissionais_salas
          // Os profissionais alocados já foram definidos na função processarProfissionaisSalas
          // e não devem ser alterados pelos agendamentos individuais
          console.log(`📌 Mantendo profissionais alocados da sala ${sala.sala_numero}: ${Object.values(sala.profissionais_ativos).filter(p => p).length} profissionais`);
        } else {
          console.warn(`⚠️ Agendamento para sala inexistente: ${salaKey}`);
        }
      });

      const salasArray = Array.from(salasMap.values());
      console.log(`🏢 Total de salas na agenda: ${salasArray.length}`);
      salasArray.forEach(sala => {
        const status = sala.pacientes.length > 0 ? `${sala.pacientes.length} pacientes` : 'VAZIA';
        console.log(`  Sala ${sala.sala_numero}: ${status}`);
      });

      setSalas(salasArray);
      setLoading(false);
      console.log('✅ buscarDadosSalas concluída com sucesso');

    } catch (error: any) {
      console.error('❌ Erro em buscarDadosSalas:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Atualizar status do agendamento
  const atualizarStatusAgendamento = async (agendamentoId: string, novoStatus: string) => {
    try {
      setAtualizandoStatus(agendamentoId);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId);

      if (error) {
        throw error;
      }

      // Recarregar dados após atualização
      await buscarDadosSalas();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do agendamento');
    } finally {
      setAtualizandoStatus(null);
    }
  };

  // useEffect para carregar dados e configurar auto-refresh
  useEffect(() => {
    console.log('🔄 AgendaSalasProfissionais: useEffect executado - buscando dados...');
    buscarDadosSalas();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Recarregamento automático (30s)');
      buscarDadosSalas();
    }, 30000);

    return () => clearInterval(interval);
  }, [unidadeSelecionada]);

  // Função para obter cor do status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pronto_para_terapia':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_atendimento':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'concluido':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'pronto_para_terapia':
        return 'Pronto';
      case 'em_atendimento':
        return 'Em Atendimento';
      case 'concluido':
        return 'Concluído';
      default:
        return 'Status Desconhecido';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Clock className="h-4 w-4" />;
      case 'pronto_para_terapia':
        return <AlertCircle className="h-4 w-4" />;
      case 'em_atendimento':
        return <Play className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agenda das salas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar agenda</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={buscarDadosSalas}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📅 Agenda das Salas</h1>
            <p className="text-gray-600 mt-1">
              {getNomeUnidadeSelecionada()} • {salas.length} salas • Atualização automática
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <Timer className="h-4 w-4 inline mr-1" />
              Última atualização: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={buscarDadosSalas}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {salas.map((sala) => (
          <div key={sala.sala_id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            {/* Header da Sala */}
            <div 
              className="p-4 rounded-t-lg"
              style={{ backgroundColor: sala.sala_cor || '#E5E7EB' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Sala {sala.sala_numero}</h3>
                  <p className="text-sm text-gray-600">{sala.sala_nome}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{sala.ocupacao_atual}/{sala.capacidade_maxima}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Profissionais */}
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-2">👨‍⚕️ Profissionais na Sala</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`p-2 rounded ${sala.profissionais_ativos.profissional_1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <div className="font-medium">Prof. 1</div>
                  <div className="truncate">{sala.profissionais_ativos.profissional_1 || 'Livre'}</div>
                </div>
                <div className={`p-2 rounded ${sala.profissionais_ativos.profissional_2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <div className="font-medium">Prof. 2</div>
                  <div className="truncate">{sala.profissionais_ativos.profissional_2 || 'Livre'}</div>
                </div>
                <div className={`p-2 rounded ${sala.profissionais_ativos.profissional_3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  <div className="font-medium">Prof. 3</div>
                  <div className="truncate">{sala.profissionais_ativos.profissional_3 || 'Livre'}</div>
                </div>
              </div>
            </div>

            {/* Pacientes na sala */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">👶 Pacientes ({sala.pacientes.length})</h4>
              
              {sala.pacientes.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  <User className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">Nenhum agendamento hoje</p>
                  <p className="text-xs">Sala disponível para uso</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sala.pacientes.map((paciente) => (
                    <div
                      key={paciente.id}
                      className={`p-3 border rounded-lg hover:shadow-sm transition-shadow ${
                        (paciente as any).proximo_do_horario ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 truncate">
                          {paciente.paciente_nome}
                        </h5>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {paciente.horario_inicio}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(paciente.status)}`}>
                          {getStatusIcon(paciente.status)}
                          <span className="ml-1">{getStatusText(paciente.status)}</span>
                        </div>
                        
                        {paciente.status === 'pronto_para_terapia' && (
                          <button
                            onClick={() => atualizarStatusAgendamento(paciente.id, 'em_atendimento')}
                            disabled={atualizandoStatus === paciente.id}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {atualizandoStatus === paciente.id ? 'Iniciando...' : 'Iniciar'}
                          </button>
                        )}
                        
                        {paciente.status === 'em_atendimento' && (
                          <button
                            onClick={() => atualizarStatusAgendamento(paciente.id, 'concluido')}
                            disabled={atualizandoStatus === paciente.id}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                          >
                            {atualizandoStatus === paciente.id ? 'Concluindo...' : 'Concluir'}
                          </button>
                        )}
                      </div>
                      
                      {paciente.profissional_nome && (
                        <div className="mt-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          Prof: {paciente.profissional_nome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer com estatísticas */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{salas.length}</div>
            <div className="text-sm text-gray-600">Total de Salas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {salas.reduce((acc, sala) => acc + sala.pacientes.filter(p => p.status === 'em_atendimento').length, 0)}
            </div>
            <div className="text-sm text-gray-600">Em Atendimento</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {salas.reduce((acc, sala) => acc + sala.pacientes.filter(p => p.status === 'pronto_para_terapia').length, 0)}
            </div>
            <div className="text-sm text-gray-600">Aguardando</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {salas.reduce((acc, sala) => acc + Object.values(sala.profissionais_ativos).filter(p => p).length, 0)}
            </div>
            <div className="text-sm text-gray-600">Profissionais Alocados</div>
          </div>
        </div>
      </div>
    </div>
  );
}
