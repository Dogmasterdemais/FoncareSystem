-- =====================================================
-- SCRIPT: Diagnosticar e Corrigir Constraint tipo_sessao
-- DESCRIÇÃO: Resolve conflito de constraint para tipo_sessao
-- DATA: 2025-07-29
-- =====================================================

-- 1. DIAGNOSTICAR VALORES EXISTENTES
SELECT 
    'Diagnóstico dos valores existentes em tipo_sessao:' as info;

SELECT 
    CASE 
        WHEN tipo_sessao IS NULL THEN 'NULL'
        ELSE tipo_sessao 
    END as valor_tipo_sessao,
    COUNT(*) as quantidade,
    'registros' as unidade
FROM agendamentos 
GROUP BY tipo_sessao
ORDER BY COUNT(*) DESC;

-- 2. VERIFICAR SE EXISTE CONSTRAINT ATUAL
SELECT 
    'Verificando constraints existentes:' as info;

SELECT 
    conname as nome_constraint,
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'agendamentos'::regclass 
  AND conname LIKE '%tipo_sessao%';

-- 3. CORRIGIR VALORES INVÁLIDOS
SELECT 
    'Corrigindo valores inválidos...' as info;

-- Atualizar NULL para 'individual'
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao IS NULL;

-- Atualizar valores que não estão na lista permitida
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao NOT IN ('individual', 'compartilhada', 'tripla');

-- 4. VERIFICAR RESULTADO DA CORREÇÃO
SELECT 
    'Resultado após correção:' as info;

SELECT 
    tipo_sessao,
    COUNT(*) as quantidade
FROM agendamentos 
GROUP BY tipo_sessao
ORDER BY COUNT(*) DESC;

-- 5. REMOVER CONSTRAINT EXISTENTE (SE HOUVER)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'agendamentos'::regclass 
          AND conname = 'agendamentos_tipo_sessao_check'
    ) THEN
        ALTER TABLE agendamentos DROP CONSTRAINT agendamentos_tipo_sessao_check;
        RAISE NOTICE 'Constraint existente removida';
    ELSE
        RAISE NOTICE 'Nenhuma constraint encontrada';
    END IF;
END $$;

-- 6. CRIAR NOVA CONSTRAINT
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_tipo_sessao_check 
CHECK (tipo_sessao IN ('individual', 'compartilhada', 'tripla'));

-- 7. VERIFICAR SE A CONSTRAINT FOI CRIADA
SELECT 
    'Constraint criada com sucesso!' as resultado,
    conname as nome_constraint,
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'agendamentos'::regclass 
  AND conname = 'agendamentos_tipo_sessao_check';

-- 8. TESTE FINAL
SELECT 
    'Teste final - valores únicos em tipo_sessao:' as info;

SELECT DISTINCT tipo_sessao
FROM agendamentos 
ORDER BY tipo_sessao;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Todos os valores NULL ou inválidos corrigidos para 'individual'
-- ✅ Constraint agendamentos_tipo_sessao_check criada com sucesso
-- ✅ Apenas valores permitidos: 'individual', 'compartilhada', 'tripla'
-- =====================================================
