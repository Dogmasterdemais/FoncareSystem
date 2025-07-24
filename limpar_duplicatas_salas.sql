-- Script para limpar duplicatas de salas
-- Remove salas duplicadas mantendo apenas uma de cada especialidade por unidade

-- 1. Verificar estado atual
SELECT 
    u.nome as unidade_nome,
    COUNT(s.id) as quantidade_salas
FROM "public"."unidades" u
LEFT JOIN "public"."salas" s ON u.id = s.unidade_id
GROUP BY u.id, u.nome
ORDER BY u.nome;

-- 2. Identificar duplicatas (salas com mesma especialidade na mesma unidade)
WITH duplicatas AS (
    SELECT 
        s.id,
        s.unidade_id,
        u.nome as unidade_nome,
        s.equipamentos->>'especialidade' as especialidade,
        ROW_NUMBER() OVER (
            PARTITION BY s.unidade_id, s.equipamentos->>'especialidade' 
            ORDER BY s.created_at ASC
        ) as rn
    FROM "public"."salas" s
    JOIN "public"."unidades" u ON s.unidade_id = u.id
    WHERE s.equipamentos->>'especialidade' IS NOT NULL
)
SELECT 
    unidade_nome,
    especialidade,
    COUNT(*) as quantidade
FROM duplicatas
GROUP BY unidade_nome, especialidade
HAVING COUNT(*) > 1
ORDER BY unidade_nome, especialidade;

-- 3. Remover duplicatas (manter apenas a primeira sala de cada especialidade por unidade)
WITH salas_para_deletar AS (
    SELECT s.id
    FROM "public"."salas" s
    WHERE s.id IN (
        SELECT id
        FROM (
            SELECT 
                id,
                ROW_NUMBER() OVER (
                    PARTITION BY unidade_id, equipamentos->>'especialidade' 
                    ORDER BY created_at ASC
                ) as rn
            FROM "public"."salas"
            WHERE equipamentos->>'especialidade' IS NOT NULL
        ) ranked
        WHERE rn > 1
    )
)
DELETE FROM "public"."salas" 
WHERE id IN (SELECT id FROM salas_para_deletar);

-- 4. Verificar resultado final
SELECT 
    u.nome as unidade_nome,
    COUNT(s.id) as quantidade_salas
FROM "public"."unidades" u
LEFT JOIN "public"."salas" s ON u.id = s.unidade_id
GROUP BY u.id, u.nome
ORDER BY u.nome;

-- 5. Verificar especialidades por unidade
SELECT 
    u.nome as unidade_nome,
    s.equipamentos->>'especialidade' as especialidade,
    COUNT(*) as quantidade
FROM "public"."unidades" u
LEFT JOIN "public"."salas" s ON u.id = s.unidade_id
WHERE s.equipamentos->>'especialidade' IS NOT NULL
GROUP BY u.id, u.nome, s.equipamentos->>'especialidade'
ORDER BY u.nome, especialidade;
