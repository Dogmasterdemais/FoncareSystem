-- ============================================================
-- CORREÇÃO: CONSTRAINT TIPO_SESSAO PARA SEGMENTOS
-- Atualizar constraint para aceitar valores corretos: Terapia, Anamnese, Neuropsicologia
-- ============================================================

-- 1. VERIFICAR CONSTRAINT ATUAL
SELECT 
    'CONSTRAINT ATUAL' as status,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'agendamentos' 
  AND conname = 'agendamentos_tipo_sessao_check';

-- 2. REMOVER CONSTRAINT ATUAL
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_tipo_sessao_check;

-- 3. CRIAR NOVA CONSTRAINT COM VALORES CORRETOS
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_tipo_sessao_check 
CHECK (tipo_sessao IN ('Terapia', 'Anamnese', 'Neuropsicologia', 'individual', 'compartilhada', 'tripla'));

-- 4. VERIFICAR SE FOI CRIADA CORRETAMENTE
SELECT 
    'CONSTRAINT ATUALIZADA' as status,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'agendamentos' 
  AND conname = 'agendamentos_tipo_sessao_check';

-- 5. ATUALIZAR AGENDAMENTOS EXISTENTES (se necessário)
UPDATE agendamentos 
SET tipo_sessao = CASE 
    WHEN tipo_sessao = 'individual' THEN 'Terapia'
    WHEN tipo_sessao = 'compartilhada' THEN 'Terapia'
    WHEN tipo_sessao = 'tripla' THEN 'Terapia'
    ELSE tipo_sessao
END
WHERE tipo_sessao IN ('individual', 'compartilhada', 'tripla');

-- 6. VERIFICAR QUANTIDADE ATUALIZADA
SELECT 
    'AGENDAMENTOS ATUALIZADOS' as status,
    tipo_sessao,
    COUNT(*) as quantidade
FROM agendamentos 
GROUP BY tipo_sessao;

-- 7. MENSAGEM DE SUCESSO
SELECT '✅ Constraint atualizada para aceitar: Terapia, Anamnese, Neuropsicologia' as resultado
UNION ALL
SELECT '✅ Agendamentos existentes atualizados para "Terapia"' as resultado;

-- ============================================================
-- SCRIPT CONCLUÍDO
-- Agora você pode usar 'Terapia', 'Anamnese', 'Neuropsicologia' no tipo_sessao
-- ============================================================
