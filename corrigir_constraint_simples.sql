-- =====================================================
-- SCRIPT SIMPLIFICADO: Corrigir Constraint tipo_sessao
-- DESCRIÇÃO: Versão simplificada para Supabase
-- DATA: 2025-07-29
-- =====================================================

-- 1. VER VALORES EXISTENTES
SELECT 
    CASE 
        WHEN tipo_sessao IS NULL THEN 'NULL'
        ELSE tipo_sessao 
    END as valor_tipo_sessao,
    COUNT(*) as quantidade
FROM agendamentos 
GROUP BY tipo_sessao
ORDER BY COUNT(*) DESC;

-- 2. CORRIGIR VALORES NULL
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao IS NULL;

-- 3. CORRIGIR VALORES INVÁLIDOS
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao NOT IN ('individual', 'compartilhada', 'tripla');

-- 4. VERIFICAR RESULTADO
SELECT 
    tipo_sessao,
    COUNT(*) as quantidade
FROM agendamentos 
GROUP BY tipo_sessao
ORDER BY tipo_sessao;

-- 5. REMOVER CONSTRAINT EXISTENTE
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_tipo_sessao_check;

-- 6. CRIAR NOVA CONSTRAINT
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_tipo_sessao_check 
CHECK (tipo_sessao IN ('individual', 'compartilhada', 'tripla'));

-- 7. VERIFICAR SUCESSO
SELECT 
    'Constraint criada com sucesso!' as resultado,
    COUNT(*) as total_registros
FROM agendamentos;

-- =====================================================
-- ✅ SCRIPT SIMPLIFICADO PARA SUPABASE
-- ✅ Remove a dependência de pg_constraint
-- ✅ Foca apenas na correção dos dados e constraint
-- =====================================================
