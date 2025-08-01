-- CORREÇÃO: Profissionais estão na tabela COLABORADORES, não profissionais
-- Primeiro vamos descobrir a estrutura da tabela

-- 4. Verificar estrutura da tabela colaboradores PRIMEIRO
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- 1. Verificar se os colaboradores existem (IDs da Sala 08) - USANDO STATUS
SELECT 
    id,
    nome_completo,
    cargo,
    status
FROM colaboradores 
WHERE id IN (
    '384a88c9-b72d-4a4c-a6e9-4e7701eb3d6d',
    '6d91eef1-2348-449c-9a99-c4e9adb10446', 
    '84013ec1-4502-4d25-bd24-2cb5835808db'
)
ORDER BY nome_completo;

-- TESTE FINAL: Deve mostrar os 3 profissionais da Sala 08
SELECT 
    ps.sala_id,
    ps.profissional_id,
    c.nome_completo as profissional_nome,
    c.cargo,
    ps.data_inicio,
    ps.ativo,
    s.numero as sala_numero,
    s.nome as sala_nome
FROM profissionais_salas ps
JOIN colaboradores c ON c.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id  
WHERE ps.data_inicio = '2025-07-30' 
    AND ps.ativo = true
ORDER BY s.numero, c.nome_completo;

-- RESULTADO ESPERADO:
-- Sala 08: João Pedro Oliveira Costa (Psicólogo)
-- Sala 08: André Luiz Carvalho (Fisioterapeuta)  
-- Sala 08: Ana Carolina Silva Santos (Psicólogo)

-- 3. Query corrigida para o sistema (usando colaboradores)
SELECT 
    ps.sala_id,
    ps.profissional_id,
    ps.turno,
    c.id,
    c.nome_completo,
    s.numero as sala_numero,
    u.nome as unidade_nome
FROM profissionais_salas ps
JOIN colaboradores c ON c.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id
LEFT JOIN unidades u ON u.id = s.unidade_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY ps.sala_id;

-- 4. Verificar estrutura da tabela colaboradores
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;
