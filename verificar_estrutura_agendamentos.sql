-- ============================================================================
-- VERIFICAR ESTRUTURA DA TABELA AGENDAMENTOS
-- ============================================================================
-- Execute este script primeiro para verificar os nomes corretos das colunas
-- ============================================================================

-- VERIFICAR TODAS AS COLUNAS DA TABELA AGENDAMENTOS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
ORDER BY ordinal_position;
