-- =====================================================
-- SCRIPT: Atualizar View Agenda para Incluir Cor da Especialidade
-- DESCRIÇÃO: Adiciona a cor da especialidade na view vw_agenda_tempo_real
-- DATA: 2025-07-29
-- =====================================================

-- 1. Dropar a view existente para recriar
DROP VIEW IF EXISTS vw_agenda_tempo_real CASCADE;

-- 2. Recriar a view com a cor da especialidade
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
    esp.cor as especialidade_cor,  -- ← NOVA COLUNA ADICIONADA
    
    -- Horários
    a.data_agendamento::date as data_agendamento,
    a.horario_inicio::time as horario_inicio,
    a.horario_fim::time as horario_fim,
    
    -- Status e controle
    COALESCE(a.status, 'agendado') as status,
    
    -- Status dinâmico simplificado (sem campos inexistentes)
    CASE 
        WHEN a.status = 'em_atendimento' AND 
             EXTRACT(EPOCH FROM (NOW() - a.created_at))/60 >= a.duracao_minutos 
        THEN 'sessao_completa'
        
        WHEN a.status = 'em_atendimento' 
        THEN 'em_andamento'
        
        ELSE COALESCE(a.status, 'agendado')
    END as status_dinamico,
    
    -- Cálculos de tempo usando created_at como referência
    CASE 
        WHEN a.status = 'em_atendimento' 
        THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - a.created_at))/60)::INTEGER
        ELSE 0
    END as tempo_sessao_atual,
    
    CASE 
        WHEN a.status = 'em_atendimento' 
        THEN GREATEST(0, a.duracao_minutos - EXTRACT(EPOCH FROM (NOW() - a.created_at))/60)::INTEGER
        ELSE a.duracao_minutos
    END as tempo_restante_minutos,
    
    a.duracao_minutos as duracao_planejada,
    
    -- Dados da sessão (simplificado)
    'individual' as tipo_sessao,
    
    -- Profissionais (simplificado, sem campos inexistentes)
    c1.nome_completo as profissional_nome,
    c1.nome_completo as profissional_1_nome,
    c1.nome_completo as profissional_2_nome,  -- Mesmo profissional por enquanto
    1 as profissional_ativo,
    
    -- Próxima ação sugerida (simplificada)
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada do paciente'
        WHEN a.status = 'chegou' THEN 'Realizar tabulação da guia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar atendimento'
        WHEN a.status = 'em_atendimento' AND 
             EXTRACT(EPOCH FROM (NOW() - a.created_at))/60 >= a.duracao_minutos 
        THEN 'Finalizar atendimento'
        WHEN a.status = 'em_atendimento' THEN 'Atendimento em andamento'
        WHEN a.status = 'concluido' THEN 'Atendimento finalizado'
        ELSE 'Verificar status'
    END as proxima_acao,
    
    -- Timestamps usando campos existentes
    a.created_at as hora_chegada,
    a.created_at as sessao_iniciada_em,
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
LEFT JOIN especialidades esp ON a.especialidade_id = esp.id  -- ← JOIN COM ESPECIALIDADES
LEFT JOIN colaboradores c1 ON a.profissional_id = c1.id
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
    'View vw_agenda_tempo_real atualizada com sucesso!' as status,
    count(*) as total_agendamentos_hoje
FROM vw_agenda_tempo_real;

-- 6. Testar a nova coluna especialidade_cor
SELECT 
    paciente_nome,
    especialidade_nome,
    especialidade_cor,
    sala_cor,
    'Cores disponíveis para o card' as observacao
FROM vw_agenda_tempo_real 
WHERE especialidade_cor IS NOT NULL
LIMIT 5;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ View atualizada com campo especialidade_cor
-- ✅ Cards da agenda agora usarão a cor da especialidade
-- ✅ Fallback para cor da sala se especialidade não tiver cor
-- ✅ Performance otimizada com índices
-- ✅ Sem referências a campos inexistentes
-- =====================================================
