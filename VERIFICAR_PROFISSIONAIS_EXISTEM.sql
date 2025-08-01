-- DIAGNÓSTICO: Verificar se os profissionais existem na tabela

-- 1. Verificar se os IDs dos profissionais existem
SELECT 
    id,
    nome,
    ativo,
    created_at
FROM profissionais 
WHERE id IN (
    '384a88c9-b72d-4a4c-a6e9-4e7701eb3d6d',
    '6d91eef1-2348-449c-9a99-c4e9adb10446', 
    '84013ec1-4502-4d25-bd24-2cb5835808db'
);

-- 2. Contar total de profissionais na tabela
SELECT COUNT(*) as total_profissionais FROM profissionais;

-- 3. Ver alguns profissionais ativos
SELECT id, nome, ativo, created_at 
FROM profissionais 
WHERE ativo = true 
LIMIT 5;

-- 4. Buscar profissionais por nome (caso existam com nomes diferentes)
SELECT id, nome, ativo 
FROM profissionais 
WHERE nome IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;
