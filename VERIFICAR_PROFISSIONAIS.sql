-- VERIFICAÇÃO RÁPIDA: Execute no Supabase SQL Editor
-- Cole e execute cada seção individualmente

-- 1. Verificar se existem profissionais alocados
SELECT 
    COUNT(*) as total_alocacoes,
    COUNT(DISTINCT sala_id) as salas_com_profissionais,
    COUNT(DISTINCT profissional_id) as profissionais_unicos
FROM profissionais_salas 
WHERE ativo = true;

-- 2. Ver detalhes das alocações
SELECT 
    ps.sala_id,
    s.numero as sala_numero,
    s.nome as sala_nome,
    ps.profissional_id,
    p.nome as profissional_nome,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo
FROM profissionais_salas ps
JOIN salas s ON s.id = ps.sala_id
JOIN profissionais p ON p.id = ps.profissional_id
WHERE ps.ativo = true
ORDER BY s.numero;

-- 3. Verificar se os dados estão dentro do range de hoje
SELECT 
    ps.*,
    CURRENT_DATE as hoje,
    (ps.data_inicio <= CURRENT_DATE) as data_inicio_ok,
    (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE) as data_fim_ok
FROM profissionais_salas ps
WHERE ps.ativo = true;

-- 4. Query exata que o sistema usa (CORRIGIDA)
SELECT 
    ps.sala_id,
    ps.profissional_id,
    ps.turno,
    p.id,
    p.nome,
    e.nome as especialidade_nome,
    e.cor as especialidade_cor
FROM profissionais_salas ps
JOIN profissionais p ON p.id = ps.profissional_id
LEFT JOIN especialidades e ON e.id = p.especialidade_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY ps.sala_id;

-- 5. DIAGNÓSTICO: Ver TODOS os registros sem filtros
SELECT 
    COUNT(*) as total_registros_na_tabela
FROM profissionais_salas;

-- 6. DIAGNÓSTICO: Ver registros com detalhes (sem filtros)
SELECT 
    ps.*,
    CURRENT_DATE as hoje,
    (ps.ativo = true) as ativo_ok,
    (ps.data_inicio <= CURRENT_DATE) as data_inicio_ok,
    (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE) as data_fim_ok
FROM profissionais_salas ps
ORDER BY ps.created_at DESC
LIMIT 10;

-- 7. DIAGNÓSTICO: Verificar se você alocou hoje
SELECT 
    ps.*,
    p.nome as profissional_nome,
    s.numero as sala_numero,
    s.nome as sala_nome
FROM profissionais_salas ps
LEFT JOIN profissionais p ON p.id = ps.profissional_id  
LEFT JOIN salas s ON s.id = ps.sala_id
WHERE ps.created_at >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY ps.created_at DESC;
