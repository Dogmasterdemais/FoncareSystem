-- VERIFICAR PROFISSIONAIS ALOCADOS NAS SALAS
-- Execute no Supabase SQL Editor

-- 1. Ver todos os profissionais alocados hoje
SELECT 
    'PROFISSIONAIS ALOCADOS HOJE:' as info;

SELECT 
    s.numero as sala_numero,
    s.nome as sala_nome,
    prof.nome as profissional_nome,
    ps.turno,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo,
    u.nome as unidade_nome
FROM profissionais_salas ps
JOIN salas s ON s.id = ps.sala_id
JOIN profissionais prof ON prof.id = ps.profissional_id
JOIN unidades u ON u.id = s.unidade_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY s.numero, prof.nome;

-- 2. Contar profissionais por sala
SELECT 
    'RESUMO POR SALA:' as info;

SELECT 
    s.numero as sala_numero,
    s.nome as sala_nome,
    COUNT(ps.id) as total_profissionais,
    string_agg(prof.nome, ', ') as profissionais
FROM salas s
LEFT JOIN profissionais_salas ps ON (ps.sala_id = s.id 
    AND ps.ativo = true 
    AND ps.data_inicio <= CURRENT_DATE 
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE))
LEFT JOIN profissionais prof ON prof.id = ps.profissional_id
WHERE s.ativo = true
GROUP BY s.id, s.numero, s.nome
ORDER BY s.numero;

-- 3. Verificar especificamente a sala de fisioterapia
SELECT 
    'SALA DE FISIOTERAPIA ESPECIFICAMENTE:' as info;

SELECT 
    s.numero as sala_numero,
    s.nome as sala_nome,
    prof.nome as profissional_nome,
    esp.nome as especialidade,
    ps.turno,
    ps.data_inicio,
    ps.ativo
FROM profissionais_salas ps
JOIN salas s ON s.id = ps.sala_id
JOIN profissionais prof ON prof.id = ps.profissional_id
LEFT JOIN especialidades esp ON esp.id = prof.especialidade_id
WHERE s.nome ILIKE '%fisio%'
    AND ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY prof.nome;

-- 4. Query que a agenda está usando (para teste)
SELECT 
    'QUERY DA AGENDA (teste):' as info;

SELECT 
    ps.sala_id,
    ps.profissional_id,
    ps.turno,
    prof.nome as profissional_nome,
    s.numero as sala_numero
FROM profissionais_salas ps
JOIN profissionais prof ON prof.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY s.numero, prof.nome;
