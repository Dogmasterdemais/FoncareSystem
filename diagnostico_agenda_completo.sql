-- DIAGNÓSTICO COMPLETO: Por que agenda não mostra profissionais
-- Execute este script no Supabase SQL Editor

SELECT '=== DIAGNÓSTICO AGENDA - PROFISSIONAIS ===' as titulo;

-- 1. AGENDAMENTOS HOJE
SELECT 
    '1. AGENDAMENTOS HOJE:' as secao,
    COUNT(*) as total_agendamentos
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE;

-- 2. AGENDAMENTOS COM PROFISSIONAIS
SELECT 
    '2. AGENDAMENTOS COM PROFISSIONAIS HOJE:' as secao;

SELECT 
    a.id,
    p.nome as paciente,
    s.nome as sala,
    s.numero as sala_numero,
    prof.nome as profissional,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.data_agendamento,
    a.created_at,
    u.nome as unidade
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
JOIN unidades u ON u.id = s.unidade_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY a.created_at DESC;

-- 3. VIEW COMPLETA HOJE
SELECT 
    '3. VIEW VW_AGENDAMENTOS_COMPLETO HOJE:' as secao;

SELECT 
    sala_numero,
    sala_nome,
    paciente_nome,
    profissional_nome,
    horario_inicio,
    horario_fim,
    status,
    unidade_nome,
    data_agendamento
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio DESC;

-- 4. VERIFICAR PROFISSIONAIS ATIVOS
SELECT 
    '4. PROFISSIONAIS ATIVOS:' as secao;

SELECT 
    id,
    nome,
    especialidade_id,
    ativo
FROM profissionais 
WHERE ativo = true
ORDER BY nome;

-- 5. VERIFICAR HORÁRIO ATUAL
SELECT 
    '5. HORA ATUAL DO SERVIDOR:' as secao,
    CURRENT_TIME as hora_atual,
    CURRENT_DATE as data_atual,
    EXTRACT(HOUR FROM CURRENT_TIME) as hora_numero,
    EXTRACT(MINUTE FROM CURRENT_TIME) as minuto_numero;

-- 6. SIMULAÇÃO DO FILTRO DE HORÁRIO (testando lógica da agenda)
SELECT 
    '6. AGENDAMENTOS QUE DEVERIAM APARECER (sem filtro de horário):' as secao;

SELECT 
    paciente_nome,
    sala_numero,
    profissional_nome,
    horario_inicio,
    status,
    -- Calcular diferença do horário atual
    EXTRACT(EPOCH FROM (horario_inicio::time - CURRENT_TIME)) / 60 as diferenca_minutos_do_atual
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE
    AND status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
ORDER BY horario_inicio;

-- 7. ÚLTIMO AGENDAMENTO CRIADO
SELECT 
    '7. ÚLTIMOS AGENDAMENTOS CRIADOS:' as secao;

SELECT 
    'ID: ' || a.id as info,
    'Paciente: ' || p.nome as paciente,
    'Sala: ' || s.nome || ' (' || s.numero || ')' as sala,
    'Profissional: ' || COALESCE(prof.nome, 'NÃO DEFINIDO') as profissional,
    'Horário: ' || a.horario_inicio as horario,
    'Status: ' || a.status as status,
    'Criado em: ' || a.created_at as criado
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
ORDER BY a.created_at DESC
LIMIT 3;
