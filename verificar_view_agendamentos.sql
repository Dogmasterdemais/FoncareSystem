-- VERIFICAR SE A VIEW vw_agendamentos_completo EXISTE E FUNCIONA
-- Execute no Supabase SQL Editor

-- 1. Verificar se a view existe
SELECT 
    'VERIFICANDO SE VIEW EXISTE:' as info;

SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vw_agendamentos_completo';

-- 2. Se existe, testar uma consulta simples
SELECT 
    'TESTANDO CONSULTA NA VIEW:' as info;

SELECT COUNT(*) as total_registros
FROM vw_agendamentos_completo;

-- 3. Testar com filtro de data
SELECT 
    'TESTANDO COM FILTRO DE DATA (hoje):' as info;

SELECT COUNT(*) as registros_hoje
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE;

-- 4. Se a view não funcionar, vamos usar consulta direta na tabela agendamentos
SELECT 
    'CONSULTA DIRETA NA TABELA AGENDAMENTOS:' as info;

SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    p.nome as paciente_nome,
    s.id as sala_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.cor as sala_cor,
    u.id as unidade_id,
    u.nome as unidade_nome,
    prof.id as profissional_id,
    prof.nome as profissional_nome
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
JOIN unidades u ON u.id = s.unidade_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
    AND a.status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
ORDER BY s.numero, a.horario_inicio;

SELECT 'DIAGNÓSTICO CONCLUÍDO!' as resultado;
