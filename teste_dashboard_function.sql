-- Teste da função get_dashboard_financeiro no Supabase
-- Execute este comando no SQL Editor do Supabase para testar

-- 1. Verificar se a função existe
SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' 
    AND p.proname = 'get_dashboard_financeiro'
) as funcao_existe;

-- 2. Testar a função diretamente
SELECT get_dashboard_financeiro();

-- 3. Verificar se há dados nas tabelas base
SELECT 
    'contas_pagar' as tabela,
    COUNT(*) as total_registros,
    SUM(CASE WHEN status IN ('Pendente', 'Atrasado') THEN valor ELSE 0 END) as valor_pendente
FROM contas_pagar
UNION ALL
SELECT 
    'contas_receber' as tabela,
    COUNT(*) as total_registros,
    SUM(CASE WHEN status IN ('Pendente', 'Atrasado') THEN valor_liquido ELSE 0 END) as valor_pendente
FROM contas_receber
UNION ALL
SELECT 
    'atendimentos_guias_tabuladas' as tabela,
    COUNT(*) as total_registros,
    SUM(valor_guia) as valor_total
FROM atendimentos_guias_tabuladas;

-- 4. Se não houver dados, inserir dados de exemplo
-- Execute apenas se as tabelas estiverem vazias

-- Primeiro, obter uma unidade existente
-- SELECT id, nome FROM unidades WHERE ativo = true LIMIT 1;

-- Substitua 'UNIDADE_ID_AQUI' pelo ID real de uma unidade ativa
/*
INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, categoria, unidade_id)
VALUES 
    ('Conta de Luz - Janeiro 2025', 'ENEL Distribuição', 1250.80, '2025-02-10', 'Fixa', 'UNIDADE_ID_AQUI'),
    ('Material de Escritório', 'Papelaria Central', 450.00, '2025-02-15', 'Consumo', 'UNIDADE_ID_AQUI');

INSERT INTO contas_receber (descricao, valor_bruto, valor_liquido, data_vencimento, origem, unidade_id)
VALUES 
    ('Consulta Psicológica - João Silva', 180.00, 180.00, '2025-02-20', 'Particular', 'UNIDADE_ID_AQUI'),
    ('Terapia Individual - Maria Santos', 150.00, 135.00, '2025-02-25', 'Guia_Tabulada', 'UNIDADE_ID_AQUI');

INSERT INTO atendimentos_guias_tabuladas (numero_guia, paciente_nome, convenio, procedimento, valor_guia, data_atendimento, unidade_id)
VALUES 
    ('GT2025010', 'Ana Costa Silva', 'Unimed', 'Consulta Inicial Psicológica', 200.00, CURRENT_DATE, 'UNIDADE_ID_AQUI'),
    ('GT2025011', 'Carlos Eduardo Lima', 'Bradesco Saúde', 'Terapia Individual', 160.00, CURRENT_DATE, 'UNIDADE_ID_AQUI');
*/

-- 5. Testar novamente após inserir dados
-- SELECT get_dashboard_financeiro();
