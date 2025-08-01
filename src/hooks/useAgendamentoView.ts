// Hook para integração com views de agendamento
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Tipos para agendamentos com dados completos
export interface AgendamentoCompleto {
  id: string;
  paciente_id: string;
  profissional_id: string;
  sala_id: string;
  unidade_id: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  observacoes?: string;
  convenio_id?: string;
  numero_guia?: string;
  valor_procedimento?: number;
  
  // Dados da sala
  sala_nome: string;
  sala_numero?: string;
  sala_tipo: string;
  sala_cor: string;
  
  // Dados do profissional
  profissional_nome: string;
  profissional_especialidade: string;
  
  // Dados do paciente
  paciente_nome: string;
  paciente_telefone?: string;
  paciente_nascimento?: string;
  
  // Dados da unidade
  unidade_nome: string;
  
  // Dados do convênio
  convenio_nome?: string;
  
  // Profissionais da sala
  profissionais_sala: string;
}

export interface SalaParaAgendamento {
  sala_id: string;
  sala_nome: string;
  sala_numero?: string;
  sala_tipo: string;
  sala_cor: string;
  unidade_id: string;
  unidade_nome: string;
  especialidade_nome: string;
  especialidade_cor: string;
  capacidade_maxima: number;
  profissionais_alocados: number;
  vagas_disponiveis: number;
  profissionais_disponiveis: string;
}

export interface ProfissionalDisponivel {
  id: string;
  nome_completo: string;
  cargo: string;
  especialidade?: string;
  salas_alocadas?: string[];
  disponivel: boolean;
}

export const useAgendamentoView = () => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoCompleto[]>([]);
  const [salasDisponiveis, setSalasDisponiveis] = useState<SalaParaAgendamento[]>([]);
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState<ProfissionalDisponivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar agendamentos usando view (se existir) ou query manual
  const carregarAgendamentos = useCallback(async (unidadeId?: string, dataInicio?: string, dataFim?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro tenta usar a view
      let query = supabase
        .from('vw_agendamentos_completo')
        .select('*');
      
      if (unidadeId) {
        query = query.eq('unidade_id', unidadeId);
      }
      
      if (dataInicio) {
        query = query.gte('data_agendamento', dataInicio);
      }
      
      if (dataFim) {
        query = query.lte('data_agendamento', dataFim);
      }
      
      const { data: viewData, error: viewError } = await query
        .order('data_agendamento', { ascending: false })
        .order('horario_inicio', { ascending: true })
        .limit(100);

      if (viewError && viewError.message.includes('does not exist')) {
        // Se a view não existir, usar query manual
        console.log('📋 View não encontrada, usando query manual...');
        const agendamentosQuery = supabase
          .from('agendamentos')
          .select(`
            *,
            salas:sala_id (
              nome,
              numero,
              tipo,
              cor
            ),
            colaboradores:profissional_id (
              nome_completo,
              cargo
            ),
            pacientes:paciente_id (
              nome,
              telefone,
              data_nascimento
            ),
            unidades:unidade_id (
              nome
            ),
            convenios:convenio_id (
              nome
            )
          `);
        
        if (unidadeId) {
          agendamentosQuery.eq('unidade_id', unidadeId);
        }
        
        if (dataInicio) {
          agendamentosQuery.gte('data_agendamento', dataInicio);
        }
        
        if (dataFim) {
          agendamentosQuery.lte('data_agendamento', dataFim);
        }
        
        const { data: manualData, error: manualError } = await agendamentosQuery
          .order('data_agendamento', { ascending: false })
          .order('horario_inicio', { ascending: true })
          .limit(100);
        
        if (manualError) {
          throw new Error(`Erro ao carregar agendamentos: ${manualError.message}`);
        }
        
        // Transformar dados manuais para o formato da view
        const agendamentosFormatados: AgendamentoCompleto[] = (manualData || []).map(ag => ({
          ...ag,
          sala_nome: ag.salas?.nome || 'Sala não informada',
          sala_numero: ag.salas?.numero,
          sala_tipo: ag.salas?.tipo || 'indefinido',
          sala_cor: ag.salas?.cor || '#6B7280',
          profissional_nome: ag.colaboradores?.nome_completo || 'Profissional não informado',
          profissional_especialidade: ag.colaboradores?.cargo || 'Não informado',
          paciente_nome: ag.pacientes?.nome || 'Paciente não informado',
          paciente_telefone: ag.pacientes?.telefone,
          paciente_nascimento: ag.pacientes?.data_nascimento,
          unidade_nome: ag.unidades?.nome || 'Unidade não informada',
          convenio_nome: ag.convenios?.nome,
          profissionais_sala: 'Carregando...'
        }));
        
        setAgendamentos(agendamentosFormatados);
      } else if (viewError) {
        throw new Error(`Erro na view de agendamentos: ${viewError.message}`);
      } else {
        setAgendamentos(viewData || []);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar agendamentos:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar salas disponíveis para agendamento
  const carregarSalasDisponiveis = useCallback(async (unidadeId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro tenta usar a view
      let query = supabase
        .from('vw_salas_para_agendamento')
        .select('*');
      
      if (unidadeId) {
        query = query.eq('unidade_id', unidadeId);
      }
      
      const { data: viewData, error: viewError } = await query
        .order('sala_nome');

      if (viewError && viewError.message.includes('does not exist')) {
        // Se a view não existir, usar query manual
        console.log('📋 View de salas não encontrada, usando query manual...');
        
        const { data: salasData, error: salasError } = await supabase
          .from('salas')
          .select(`
            id,
            nome,
            numero,
            tipo,
            cor,
            capacidade_maxima,
            unidade_id,
            unidades:unidade_id (
              nome
            ),
            profissionais_salas!inner (
              ativo,
              colaboradores:profissional_id (
                nome_completo,
                cargo,
                status
              )
            )
          `)
          .eq('ativo', true)
          .eq('profissionais_salas.ativo', true)
          .eq('unidade_id', unidadeId);
        
        if (salasError) {
          throw new Error(`Erro ao carregar salas: ${salasError.message}`);
        }
        
        // Transformar dados para o formato esperado
        const salasFormatadas: SalaParaAgendamento[] = (salasData || []).map(sala => {
          const profissionaisAtivos = sala.profissionais_salas?.filter(ps => 
            ps.ativo && ps.colaboradores?.status === 'ativo'
          ) || [];
          
          return {
            sala_id: sala.id,
            sala_nome: sala.nome,
            sala_numero: sala.numero,
            sala_tipo: sala.tipo,
            sala_cor: sala.cor,
            unidade_id: sala.unidade_id,
            unidade_nome: sala.unidades?.nome || 'Unidade não informada',
            especialidade_nome: sala.tipo === 'terapia' ? 'Terapia' : 'Consulta',
            especialidade_cor: sala.cor,
            capacidade_maxima: sala.capacidade_maxima,
            profissionais_alocados: profissionaisAtivos.length,
            vagas_disponiveis: sala.capacidade_maxima - profissionaisAtivos.length,
            profissionais_disponiveis: profissionaisAtivos
              .map(ps => `${ps.colaboradores?.nome_completo} (${ps.colaboradores?.cargo})`)
              .join(', ') || 'Nenhum profissional alocado'
          };
        });
        
        setSalasDisponiveis(salasFormatadas);
      } else if (viewError) {
        throw new Error(`Erro na view de salas: ${viewError.message}`);
      } else {
        setSalasDisponiveis(viewData || []);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar salas:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar profissionais disponíveis
  const carregarProfissionaisDisponiveis = useCallback(async (unidadeId?: string) => {
    try {
      const { data: profissionais, error } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          cargo,
          status,
          profissionais_salas (
            sala_id,
            ativo,
            salas:sala_id (
              nome,
              unidade_id
            )
          )
        `)
        .eq('status', 'ativo')
        .eq('regime_contratacao', 'PJ');
      
      if (error) {
        throw new Error(`Erro ao carregar profissionais: ${error.message}`);
      }
      
      const profissionaisFormatados: ProfissionalDisponivel[] = (profissionais || []).map(prof => {
        const salasAlocadas = prof.profissionais_salas?.filter(ps => 
          ps.ativo && (!unidadeId || ps.salas?.unidade_id === unidadeId)
        ).map(ps => ps.salas?.nome).filter(Boolean) || [];
        
        return {
          id: prof.id,
          nome_completo: prof.nome_completo,
          cargo: prof.cargo,
          especialidade: prof.cargo,
          salas_alocadas: salasAlocadas,
          disponivel: salasAlocadas.length > 0
        };
      });
      
      setProfissionaisDisponiveis(profissionaisFormatados);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar profissionais:', errorMessage);
    }
  }, []);

  return {
    agendamentos,
    salasDisponiveis,
    profissionaisDisponiveis,
    loading,
    error,
    carregarAgendamentos,
    carregarSalasDisponiveis,
    carregarProfissionaisDisponiveis
  };
};
