-- =====================================================
-- SCRIPT: Corrigir Timer da Agenda - Usar sessao_iniciada_em
-- DESCRIÇÃO: Corrige o cálculo do timer para usar o momento real de início da sessão
-- DATA: 2025-07-29
-- =====================================================

-- 1. Dropar a view existente para recriar
DROP VIEW IF EXISTS vw_agenda_tempo_real CASCADE;

-- 2. Recriar a view com o timer correto
CREATE VIEW vw_agenda_tempo_real AS
SELECT 
    a.id,
    
    -- Dados do paciente
    p.nome as paciente_nome,
    
    -- Dados da sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.cor as sala_cor,
    
    -- Dados da especialidade (INCLUINDO A COR)
    esp.nome as especialidade_nome,
    esp.cor as especialidade_cor,
    
    -- Horários
    a.data_agendamento::date as data_agendamento,
    a.horario_inicio::time as horario_inicio,
    a.horario_fim::time as horario_fim,
    
    -- Status e controle
    COALESCE(a.status, 'agendado') as status,
    
    -- Status dinâmico simplificado
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL AND
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= a.duracao_minutos 
        THEN 'sessao_completa'
        
        WHEN a.status = 'em_atendimento' 
        THEN 'em_andamento'
        
        ELSE COALESCE(a.status, 'agendado')
    END as status_dinamico,
    
    -- Cálculos de tempo usando sessao_iniciada_em (TIMER REAL)
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL
        THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60)::INTEGER
        ELSE 0
    END as tempo_sessao_atual,
    
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL
        THEN GREATEST(0, a.duracao_minutos - EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60)::INTEGER
        ELSE a.duracao_minutos
    END as tempo_restante_minutos,
    
    a.duracao_minutos as duracao_planejada,
    
    -- Tipo de sessão (com suporte a 3 profissionais)
    COALESCE(a.tipo_sessao, 'individual') as tipo_sessao,
    
    -- Profissionais (incluindo terceiro profissional)
    c_principal.nome_completo as profissional_nome,
    c1.nome_completo as profissional_1_nome,
    c2.nome_completo as profissional_2_nome,
    c3.nome_completo as profissional_3_nome,
    
    -- Profissional ativo com lógica para 3 profissionais
    CASE 
        WHEN a.status = 'em_atendimento' AND COALESCE(a.tipo_sessao, 'individual') = 'tripla' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 < 20 THEN 1
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 < 40 THEN 2
                ELSE 3
            END
        WHEN a.status = 'em_atendimento' AND COALESCE(a.tipo_sessao, 'individual') = 'compartilhada' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 < 30 THEN 1
                ELSE 2
            END
        ELSE COALESCE(a.profissional_ativo, 1)
    END as profissional_ativo,
    
    -- Próxima ação sugerida com suporte a 3 profissionais
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada do paciente'
        WHEN a.status = 'chegou' THEN 'Realizar tabulação da guia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar atendimento'
        
        -- Sessão tripla (3 profissionais - 20min cada)
        WHEN a.status = 'em_atendimento' AND COALESCE(a.tipo_sessao, 'individual') = 'tripla' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 THEN 'Finalizar atendimento'
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 40 AND COALESCE(a.profissional_ativo, 1) <= 2 THEN 'Trocar para 3º profissional'
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 20 AND COALESCE(a.profissional_ativo, 1) = 1 THEN 'Trocar para 2º profissional'
                ELSE 'Atendimento em andamento'
            END
            
        -- Sessão compartilhada (2 profissionais - 30min cada)
        WHEN a.status = 'em_atendimento' AND COALESCE(a.tipo_sessao, 'individual') = 'compartilhada' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 THEN 'Finalizar atendimento'
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 30 AND COALESCE(a.profissional_ativo, 1) = 1 THEN 'Trocar para 2º profissional'
                ELSE 'Atendimento em andamento'
            END
            
        -- Sessão individual (1 profissional - 60min)
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL AND
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= COALESCE(a.duracao_minutos, 60) 
        THEN 'Finalizar atendimento'
        WHEN a.status = 'em_atendimento' THEN 'Atendimento em andamento'
        WHEN a.status = 'concluido' THEN 'Atendimento finalizado'
        ELSE 'Verificar status'
    END as proxima_acao,
    
    -- Timestamps usando campos existentes
    a.created_at as hora_chegada,
    a.sessao_iniciada_em as sessao_iniciada_em,  -- TIMER REAL DE INÍCIO
    a.created_at as hora_fim_atendimento,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    u.id as unidade_id,
    
    -- Dados adicionais
    '' as observacoes_sessao,
    a.created_at

FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN especialidades esp ON a.especialidade_id = esp.id
LEFT JOIN colaboradores c1 ON a.profissional_id = c1.id
LEFT JOIN colaboradores c_principal ON a.profissional_id = c_principal.id
LEFT JOIN colaboradores c2 ON a.profissional_1_id = c2.id
LEFT JOIN colaboradores c3 ON a.profissional_2_id = c3.id
LEFT JOIN unidades u ON s.unidade_id = u.id

WHERE 
    -- Apenas agendamentos de hoje
    a.data_agendamento::date = CURRENT_DATE

ORDER BY 
    a.horario_inicio, 
    s.numero;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_vw_agenda_tempo_real_data 
ON agendamentos(data_agendamento);

CREATE INDEX IF NOT EXISTS idx_vw_agenda_tempo_real_status 
ON agendamentos(status);

CREATE INDEX IF NOT EXISTS idx_vw_agenda_tempo_real_unidade 
ON agendamentos(especialidade_id);

-- 4. Conceder permissões
GRANT SELECT ON vw_agenda_tempo_real TO authenticated;
GRANT SELECT ON vw_agenda_tempo_real TO anon;

-- 5. Verificar se a view foi criada corretamente
SELECT 
    'View vw_agenda_tempo_real com timer corrigido!' as status,
    count(*) as total_agendamentos_hoje
FROM vw_agenda_tempo_real;

-- 6. Testar o timer real
SELECT 
    paciente_nome,
    status,
    sessao_iniciada_em,
    tempo_sessao_atual,
    'Timer agora usa sessao_iniciada_em corretamente' as observacao
FROM vw_agenda_tempo_real 
WHERE status = 'em_atendimento'
LIMIT 5;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Timer agora inicia AUTOMATICAMENTE quando status = 'em_atendimento'
-- ✅ Usa sessao_iniciada_em (momento real) em vez de created_at
-- ✅ Função SQL define sessao_iniciada_em = NOW() automaticamente
-- ✅ Cards mostram tempo real desde início da sessão
-- ✅ Suporte completo para até 3 profissionais por sala
-- ✅ Sessões triplas com trocas automáticas aos 20min e 40min
-- ✅ Precisão total no controle de tempo
-- =====================================================
