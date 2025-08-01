-- CORREÇÃO DA CONSTRAINT tipo_sessao - EXECUTE NO SUPABASE SQL EDITOR

-- 1. Corrigir valores inválidos existentes
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao IS NULL OR tipo_sessao NOT IN ('individual', 'compartilhada', 'tripla');

-- 2. Remover constraint conflitante (se existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'agendamentos'::regclass 
          AND conname LIKE '%tipo_sessao%'
    ) THEN
        ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_tipo_sessao_check;
        RAISE NOTICE '✅ Constraint existente removida';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Nenhuma constraint para remover ou erro: %', SQLERRM;
END $$;

-- 3. Criar nova constraint correta
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_tipo_sessao_check 
CHECK (tipo_sessao IN ('individual', 'compartilhada', 'tripla'));

-- 4. Verificar se funcionou
SELECT 'Constraint criada com sucesso!' as status, COUNT(*) as total_registros FROM agendamentos;

-- 5. Verificar valores únicos em tipo_sessao
SELECT tipo_sessao, COUNT(*) as quantidade 
FROM agendamentos 
GROUP BY tipo_sessao 
ORDER BY tipo_sessao;
