-- TESTE RÁPIDO: Verificar profissionais alocados
-- Execute no Supabase SQL Editor

-- 1. Profissionais alocados hoje (query simples)
SELECT 
    ps.sala_id,
    ps.profissional_id,
    ps.turno,
    ps.data_inicio,
    ps.ativo
FROM profissionais_salas ps
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY ps.sala_id;

-- 2. Com nomes (join manual)
SELECT 
    ps.sala_id,
    prof.nome as profissional_nome,
    s.numero as sala_numero,
    s.nome as sala_nome
FROM profissionais_salas ps
JOIN profissionais prof ON prof.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY s.numero, prof.nome;

-- 3. Contar por sala
SELECT 
    s.numero as sala_numero,
    s.nome as sala_nome,
    COUNT(ps.id) as total_profissionais
FROM salas s
LEFT JOIN profissionais_salas ps ON (ps.sala_id = s.id 
    AND ps.ativo = true 
    AND ps.data_inicio <= CURRENT_DATE 
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE))
WHERE s.ativo = true
GROUP BY s.id, s.numero, s.nome
HAVING COUNT(ps.id) > 0
ORDER BY s.numero;
