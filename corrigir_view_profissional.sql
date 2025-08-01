-- VERIFICAR VIEW vw_agendamentos_completo
-- Execute no Supabase SQL Editor

-- Ver definição da view
SELECT 
    'DEFINIÇÃO DA VIEW:' as info;

-- Verificar se a view existe e como está definida
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vw_agendamentos_completo';

-- Se a view não aparece acima, vamos recriar ela
-- RECRIAR VIEW CORRETAMENTE:

CREATE OR REPLACE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.tipo_sessao,
    a.observacoes,
    a.created_at,
    a.updated_at,
    
    -- Paciente
    p.id as paciente_id,
    p.nome as paciente_nome,
    p.data_nascimento as paciente_data_nascimento,
    
    -- Sala
    s.id as sala_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.cor as sala_cor,
    
    -- Unidade
    u.id as unidade_id,
    u.nome as unidade_nome,
    
    -- Profissional PRINCIPAL
    a.profissional_id,
    prof.nome as profissional_nome,
    esp.nome as especialidade_nome,
    esp.cor as especialidade_cor,
    
    -- Campos calculados
    CASE 
        WHEN a.status = 'em_atendimento' THEN 1
        ELSE 0
    END as profissional_ativo,
    
    -- Tempo de sessão
    CASE 
        WHEN a.status = 'em_atendimento' THEN 
            EXTRACT(EPOCH FROM (NOW() - a.updated_at)) / 60
        ELSE 0
    END as tempo_sessao_atual,
    
    60 as duracao_planejada, -- Assumindo 60 min por sessão
    
    CASE 
        WHEN a.status = 'em_atendimento' THEN 
            60 - EXTRACT(EPOCH FROM (NOW() - a.updated_at)) / 60
        ELSE 60
    END as tempo_restante_minutos,
    
    -- Status dinâmico
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando'
        WHEN a.status = 'pronto_para_terapia' THEN 'Pronto'
        WHEN a.status = 'em_atendimento' THEN 'Em Atendimento'
        WHEN a.status = 'finalizado' THEN 'Finalizado'
        ELSE a.status
    END as status_dinamico,
    
    -- Próxima ação
    CASE 
        WHEN a.status = 'agendado' THEN 'Iniciar Terapia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar Atendimento'
        WHEN a.status = 'em_atendimento' THEN 'Finalizar Sessão'
        ELSE 'Nenhuma'
    END as proxima_acao

FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
JOIN unidades u ON u.id = s.unidade_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
LEFT JOIN especialidades esp ON esp.id = prof.especialidade_id
WHERE a.data_agendamento >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.data_agendamento DESC, a.horario_inicio DESC;

-- Comentar a view
COMMENT ON VIEW vw_agendamentos_completo IS 'View completa de agendamentos com todas as informações necessárias para a agenda';

SELECT 'VIEW RECRIADA COM SUCESSO!' as resultado;
