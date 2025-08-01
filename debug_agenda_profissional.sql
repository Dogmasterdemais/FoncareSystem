-- DEBUG: Verificar por que profissional alocado não aparece na agenda
-- Execute no Supabase SQL Editor

-- 1. VERIFICAR AGENDAMENTOS ATUAIS
SELECT 
    'AGENDAMENTOS HOJE:' as info;

SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.status,
    p.nome as paciente_nome,
    s.nome as sala_nome,
    s.numero as sala_numero,
    prof.nome as profissional_nome,
    a.tipo_sessao,
    a.created_at
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY a.horario_inicio DESC;

-- 2. VERIFICAR VIEW QUE A AGENDA USA
SELECT 
    'DADOS DA VIEW vw_agendamentos_completo HOJE:' as info;

SELECT 
    paciente_nome,
    sala_numero,
    sala_nome,
    horario_inicio,
    horario_fim,
    status,
    profissional_nome,
    tipo_sessao,
    data_agendamento
FROM vw_agendamentos_completo 
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio DESC;

-- 3. VERIFICAR HORÁRIO ATUAL E FILTROS
SELECT 
    'HORA ATUAL E FILTROS:' as info,
    CURRENT_TIME as hora_atual,
    CURRENT_DATE as data_atual,
    (CURRENT_TIME - INTERVAL '1 hour') as uma_hora_antes,
    (CURRENT_TIME + INTERVAL '2 hours') as duas_horas_depois;

-- 4. SIMULAR FILTRO DA AGENDA (horário próximo)
SELECT 
    'AGENDAMENTOS QUE PASSARIAM NO FILTRO DE HORÁRIO:' as info;

SELECT 
    paciente_nome,
    sala_numero,
    horario_inicio,
    status,
    profissional_nome,
    tipo_sessao,
    -- Calcular diferença em minutos
    EXTRACT(EPOCH FROM (horario_inicio::time - CURRENT_TIME)) / 60 as diferenca_minutos
FROM vw_agendamentos_completo 
WHERE data_agendamento = CURRENT_DATE
    AND status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
    AND (
        -- Horário próximo (30 min antes/depois)
        ABS(EXTRACT(EPOCH FROM (horario_inicio::time - CURRENT_TIME)) / 60) <= 30
        OR status = 'em_atendimento'
        OR status = 'pronto_para_terapia'
    )
ORDER BY horario_inicio;

-- 5. VERIFICAR ÚLTIMO AGENDAMENTO CRIADO
SELECT 
    'ÚLTIMO AGENDAMENTO CRIADO:' as info;

SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.status,
    p.nome as paciente_nome,
    s.nome as sala_nome,
    prof.nome as profissional_nome,
    a.created_at,
    a.tipo_sessao
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
ORDER BY a.created_at DESC
LIMIT 5;
