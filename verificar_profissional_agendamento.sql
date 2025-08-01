-- VERIFICAR: Por que agendamentos não têm profissional
-- Execute no Supabase SQL Editor

-- 1. Ver agendamentos atuais com detalhes do profissional
SELECT 
    'AGENDAMENTOS DE HOJE - DETALHES:' as info;

SELECT 
    a.id,
    p.nome as paciente,
    s.nome as sala,
    s.numero as sala_numero,
    a.profissional_id,
    prof.nome as profissional_nome,
    a.horario_inicio,
    a.status,
    a.created_at,
    a.updated_at
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY a.created_at DESC;

-- 2. Ver se existem profissionais disponíveis
SELECT 
    'PROFISSIONAIS ATIVOS:' as info;

SELECT 
    id,
    nome,
    especialidade_id,
    ativo
FROM profissionais 
WHERE ativo = true
ORDER BY nome;

-- 3. Ver view vw_agendamentos_completo para esses agendamentos
SELECT 
    'VIEW AGENDAMENTOS COMPLETO:' as info;

SELECT 
    paciente_nome,
    sala_numero,
    profissional_nome,
    profissional_id,
    horario_inicio,
    status
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio DESC;
