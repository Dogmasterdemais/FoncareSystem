-- VERIFICAÇÃO RÁPIDA: Por que profissional não aparece na agenda
-- Execute no Supabase SQL Editor

-- 1. Ver agendamentos de hoje
SELECT 
    'AGENDAMENTOS HOJE COM PROFISSIONAIS:' as info;

SELECT 
    a.id,
    p.nome as paciente,
    s.nome as sala,
    prof.nome as profissional,
    a.horario_inicio,
    a.status,
    a.data_agendamento,
    a.created_at
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY a.created_at DESC
LIMIT 10;

-- 2. Ver view da agenda
SELECT 
    'VIEW AGENDAMENTOS COMPLETO HOJE:' as info;

SELECT 
    paciente_nome,
    sala_nome,
    profissional_nome,
    horario_inicio,
    status,
    data_agendamento
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio DESC
LIMIT 10;

-- 3. Ver hora atual
SELECT 
    'HORA ATUAL:' as info,
    CURRENT_TIME as hora_servidor,
    CURRENT_DATE as data_servidor;
