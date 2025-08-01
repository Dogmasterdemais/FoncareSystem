-- Script para adicionar a cor da especialidade na view da agenda
-- Executar no Supabase SQL Editor

-- 1. Recriar a view vw_agendamentos_completo com a cor da especialidade
DROP VIEW IF EXISTS vw_agenda_tempo_real CASCADE;

CREATE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.paciente_id,
    a.profissional_id,
    a.sala_id,
    a.unidade_id,
    a.convenio_id,
    a.especialidade_id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.observacoes,
    a.created_at,
    a.updated_at,
    a.numero_agendamento,
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
    a.valor_procedimento,
    
    -- Campos de sessão (NOVOS)
    a.sessao_iniciada_em,
    a.sessao_pausada_em,
    a.sessao_finalizada_em,
    a.tempo_sessao_minutos,
    a.profissional_1_id,
    a.profissional_2_id,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.profissional_ativo,
    a.duracao_planejada,
    a.tipo_sessao,
    a.observacoes_sessao,
    
    -- Dados relacionados
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    p.data_nascimento as paciente_nascimento,
    
    u.nome as unidade_nome,
    conv.nome as convenio_nome,
    e.nome as especialidade_nome,
    e.cor as especialidade_cor,  -- ADICIONADO: cor da especialidade
    
    c_principal.nome_completo as profissional_nome,
    c1.nome_completo as profissional_1_nome,
    c1.cargo as profissional_1_cargo,
    c2.nome_completo as profissional_2_nome,
    c2.cargo as profissional_2_cargo,
    
    -- Tempo em tempo real
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60
        WHEN a.status = 'concluido' AND a.sessao_finalizada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (a.sessao_finalizada_em - a.sessao_iniciada_em)) / 60
        ELSE a.tempo_sessao_minutos
    END::INTEGER as tempo_sessao_atual

FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN convenios conv ON a.convenio_id = conv.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN colaboradores c_principal ON a.profissional_id = c_principal.id
LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id;

-- 2. Recriar a view vw_agenda_tempo_real
CREATE VIEW vw_agenda_tempo_real AS
SELECT 
    a.*,
    
    -- Status dinâmico
    CASE 
        WHEN a.status = 'em_atendimento' THEN 
            CASE 
                WHEN a.tipo_sessao = 'compartilhada' AND a.tempo_sessao_atual >= 30 AND a.profissional_ativo = 1 THEN 'troca_profissional'
                WHEN a.tempo_sessao_atual >= a.duracao_planejada THEN 'sessao_completa'
                ELSE 'em_andamento'
            END
        ELSE a.status
    END as status_dinamico,
    
    -- Tempo restante
    CASE 
        WHEN a.status = 'em_atendimento' THEN 
            GREATEST(0, a.duracao_planejada - a.tempo_sessao_atual)
        ELSE 0
    END as tempo_restante_minutos,
    
    -- Próxima ação
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada'
        WHEN a.status = 'chegou' THEN 'Tabular guia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar sessão'
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'compartilhada' AND a.tempo_sessao_atual >= 30 AND a.profissional_ativo = 1 THEN 'Trocar profissional'
        WHEN a.status = 'em_atendimento' AND a.tempo_sessao_atual >= a.duracao_planejada THEN 'Finalizar sessão'
        WHEN a.status = 'em_atendimento' THEN 'Sessão em andamento'
        WHEN a.status = 'concluido' THEN 'Sessão concluída'
        ELSE 'Verificar status'
    END as proxima_acao

FROM vw_agendamentos_completo a
WHERE a.data_agendamento = CURRENT_DATE
  AND a.status NOT IN ('cancelado', 'faltou')
ORDER BY a.unidade_nome, a.sala_numero, a.horario_inicio;

-- 3. Adicionar comentários
COMMENT ON VIEW vw_agendamentos_completo IS 'View completa de agendamentos com dados relacionados incluindo cor da especialidade';
COMMENT ON VIEW vw_agenda_tempo_real IS 'Agenda em tempo real com cálculos dinâmicos e cor da especialidade';

-- 4. Verificar se as views foram criadas
SELECT 'Views atualizadas com cor da especialidade!' as resultado;
