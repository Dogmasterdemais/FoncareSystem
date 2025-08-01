-- DIAGNÓSTICO: Verificar a sala e unidade dos profissionais alocados hoje

-- 1. Detalhes da sala onde estão os 3 profissionais
SELECT 
    s.id as sala_id,
    s.numero as sala_numero,  
    s.nome as sala_nome,
    s.unidade_id,
    u.nome as unidade_nome,
    s.ativo as sala_ativa
FROM salas s
LEFT JOIN unidades u ON u.id = s.unidade_id
WHERE s.id = '774a1b53-ebba-4cf8-88d2-4670b2867a1f';

-- 2. Profissionais alocados hoje COM NOMES
SELECT 
    ps.sala_id,
    ps.profissional_id,
    p.nome as profissional_nome,
    ps.data_inicio,
    ps.ativo,
    s.numero as sala_numero,
    s.nome as sala_nome,
    u.nome as unidade_nome
FROM profissionais_salas ps
JOIN profissionais p ON p.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id  
LEFT JOIN unidades u ON u.id = s.unidade_id
WHERE ps.data_inicio = '2025-07-30' 
    AND ps.ativo = true
ORDER BY s.numero;

-- 4. DIAGNÓSTICO AMPLO: Buscar TODOS os profissionais alocados (sem filtros)
SELECT 
    ps.sala_id,
    ps.profissional_id,
    p.nome as profissional_nome,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo,
    s.numero as sala_numero,
    s.nome as sala_nome,
    u.nome as unidade_nome,
    ps.created_at
FROM profissionais_salas ps
LEFT JOIN profissionais p ON p.id = ps.profissional_id
LEFT JOIN salas s ON s.id = ps.sala_id  
LEFT JOIN unidades u ON u.id = s.unidade_id
ORDER BY ps.created_at DESC
LIMIT 10;

-- 5. FOCO: Dados dos 7 registros que o sistema encontrou
SELECT 
    ps.sala_id,
    ps.profissional_id,
    ps.turno,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo
FROM profissionais_salas ps
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY ps.sala_id;

-- 3. Verificar se a query do sistema funciona SEM filtro de unidade
SELECT 
    ps.sala_id,
    ps.profissional_id,
    ps.turno,
    p.id,
    p.nome,
    s.numero as sala_numero,
    u.nome as unidade_nome
FROM profissionais_salas ps
JOIN profissionais p ON p.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id
LEFT JOIN unidades u ON u.id = s.unidade_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY ps.sala_id;
