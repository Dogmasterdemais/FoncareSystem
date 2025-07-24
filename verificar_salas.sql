-- Script atualizado - TODAS as unidades já têm suas salas configuradas
-- Execute primeiro o script limpar_duplicatas_salas.sql para remover duplicatas

-- Status atual das unidades (baseado na imagem fornecida):
-- ✅ Escritório: 0 salas (correto - administrativo)
-- ❌ Foncare - Osasco 1: 20 salas (duplicadas - deveria ter 10)
-- ✅ Foncare - Osasco 2: 10 salas (correto)
-- ❌ Foncare - Santos: 20 salas (duplicadas - deveria ter 10)
-- ❌ Foncare - São Miguel Paulista: 20 salas (duplicadas - deveria ter 10)
-- ✅ Foncare - Suzano: 10 salas (correto)
-- ✅ Penha - Matriz: 10 salas (correto)
-- ✅ Unidade Principal: 10 salas (correto)

-- TODAS as inserções estão comentadas pois as unidades já têm salas
-- Use o script limpar_duplicatas_salas.sql para corrigir as duplicatas

-- Verificações finais:

-- 1. Verificar total de salas após limpeza
SELECT COUNT(*) as total_salas_final FROM "public"."salas";

-- 2. Verificar salas por unidade
SELECT 
    u.nome as unidade_nome,
    COUNT(s.id) as quantidade_salas
FROM "public"."unidades" u
LEFT JOIN "public"."salas" s ON u.id = s.unidade_id
GROUP BY u.id, u.nome
ORDER BY u.nome;

-- 3. Verificar especialidades por unidade (deve ter 10 especialidades cada)
SELECT 
    u.nome as unidade_nome,
    s.equipamentos->>'especialidade' as especialidade,
    COUNT(*) as quantidade
FROM "public"."unidades" u
LEFT JOIN "public"."salas" s ON u.id = s.unidade_id
WHERE s.equipamentos->>'especialidade' IS NOT NULL
GROUP BY u.id, u.nome, s.equipamentos->>'especialidade'
ORDER BY u.nome, especialidade;
