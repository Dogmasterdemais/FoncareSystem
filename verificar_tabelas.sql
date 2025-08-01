-- Verificação rápida das tabelas financeiras
-- Execute no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = t.table_name 
            AND table_schema = 'public'
        ) THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status
FROM (
    VALUES 
        ('unidades'),
        ('contas_pagar'),
        ('contas_receber'),
        ('atendimentos_guias_tabuladas'),
        ('anexos_notas_fiscais')
) t(table_name);

-- 2. Contar registros em cada tabela
SELECT 'unidades' as tabela, COUNT(*) as registros FROM unidades
UNION ALL
SELECT 'contas_pagar', COUNT(*) FROM contas_pagar
UNION ALL  
SELECT 'contas_receber', COUNT(*) FROM contas_receber
UNION ALL
SELECT 'atendimentos_guias_tabuladas', COUNT(*) FROM atendimentos_guias_tabuladas
UNION ALL
SELECT 'anexos_notas_fiscais', COUNT(*) FROM anexos_notas_fiscais;

-- 3. Se as tabelas estiverem vazias, mostrar como inserir dados básicos
-- (Este é só um exemplo - ajuste os IDs conforme necessário)

/*
-- Exemplo de inserção de dados básicos:

-- Inserir unidade se não existir
INSERT INTO unidades (nome, ativo) 
VALUES ('Unidade Teste', true) 
ON CONFLICT DO NOTHING;

-- Pegar ID da unidade
SELECT id FROM unidades LIMIT 1;

-- Substituir 'SEU_UNIDADE_ID' pelo ID real da consulta acima
INSERT INTO contas_pagar (descricao, valor, data_vencimento, categoria, unidade_id)
VALUES ('Conta Teste', 100.00, '2025-02-01', 'Fixa', 'SEU_UNIDADE_ID');

INSERT INTO contas_receber (descricao, valor_bruto, valor_liquido, data_vencimento, origem, unidade_id)
VALUES ('Receita Teste', 200.00, 200.00, '2025-02-01', 'Particular', 'SEU_UNIDADE_ID');
*/
