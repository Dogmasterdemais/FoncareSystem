-- Script para inserir dados de exemplo básicos no sistema financeiro
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se existe pelo menos uma unidade ativa
DO $$
DECLARE
    unidade_id UUID;
BEGIN
    -- Buscar uma unidade ativa existente
    SELECT id INTO unidade_id FROM unidades WHERE ativo = true LIMIT 1;
    
    -- Se não existir, criar uma unidade de exemplo
    IF unidade_id IS NULL THEN
        INSERT INTO unidades (nome, endereco, telefone, email, ativo)
        VALUES ('Unidade Centro - Exemplo', 'Rua das Flores, 123 - Centro', '(11) 3333-4444', 'centro@foncare.com.br', true)
        RETURNING id INTO unidade_id;
        
        RAISE NOTICE 'Unidade criada: %', unidade_id;
    ELSE
        RAISE NOTICE 'Usando unidade existente: %', unidade_id;
    END IF;
    
    -- Inserir algumas contas a pagar de exemplo
    INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, categoria, status, unidade_id)
    VALUES 
        ('Fornecimento de Energia Elétrica - Janeiro 2025', 'ENEL Distribuição SP', 1250.80, '2025-02-10', 'Fixa', 'Pendente', unidade_id),
        ('Material de Limpeza e Higiene', 'Distribuidora Clean', 380.50, '2025-02-15', 'Consumo', 'Pendente', unidade_id),
        ('Internet e Telefonia', 'Vivo Empresarial', 890.00, '2025-02-05', 'Fixa', 'Pendente', unidade_id),
        ('Aluguel Janeiro 2025', 'Imobiliária Central', 3500.00, '2025-02-01', 'Fixa', 'Pago', unidade_id)
    ON CONFLICT DO NOTHING;
    
    -- Inserir algumas contas a receber de exemplo
    INSERT INTO contas_receber (descricao, valor_bruto, valor_liquido, valor_glosa, data_vencimento, origem, status, unidade_id)
    VALUES 
        ('Consulta Psicológica - João Silva Santos', 180.00, 180.00, 0, '2025-02-20', 'Particular', 'Pendente', unidade_id),
        ('Terapia Individual - Maria Oliveira', 150.00, 135.00, 15.00, '2025-02-25', 'Guia_Tabulada', 'Pendente', unidade_id),
        ('Avaliação Neuropsicológica - Pedro Costa', 350.00, 315.00, 35.00, '2025-02-18', 'Procedimento', 'Pendente', unidade_id),
        ('Consulta Retorno - Ana Santos', 120.00, 120.00, 0, '2025-01-20', 'Particular', 'Recebido', unidade_id),
        ('Terapia Casal - Carlos e Julia Lima', 200.00, 180.00, 20.00, '2025-01-25', 'Guia_Tabulada', 'Recebido', unidade_id)
    ON CONFLICT DO NOTHING;
    
    -- Inserir alguns atendimentos com guias de exemplo
    INSERT INTO atendimentos_guias_tabuladas (numero_guia, paciente_nome, paciente_documento, convenio, procedimento, codigo_procedimento, valor_guia, data_atendimento, profissional_nome, status, unidade_id)
    VALUES 
        ('GT2025010', 'Ana Costa Silva', '123.456.789-01', 'Unimed Nacional', 'Consulta Inicial Psicológica', '70101019', 200.00, '2025-01-15', 'Dr. Roberto Silva', 'Realizado', unidade_id),
        ('GT2025011', 'Carlos Eduardo Lima', '987.654.321-02', 'Bradesco Saúde', 'Terapia Individual - Psicologia', '70101020', 160.00, '2025-01-16', 'Dra. Fernanda Costa', 'Realizado', unidade_id),
        ('GT2025012', 'Mariana Santos Oliveira', '456.789.123-03', 'SulAmérica Saúde', 'Avaliação Neuropsicológica', '70101025', 350.00, '2025-01-18', 'Dr. Paulo Mendes', 'Realizado', unidade_id),
        ('GT2025013', 'José da Silva Neto', '321.654.987-04', 'Unimed Regional', 'Terapia de Casal', '70101030', 180.00, '2025-01-20', 'Dra. Carla Rodrigues', 'Realizado', unidade_id),
        ('GT2025014', 'Patricia Alves Costa', '789.123.456-05', 'Porto Seguro Saúde', 'Consulta de Retorno', '70101015', 120.00, '2025-01-22', 'Dr. Ricardo Santos', 'Realizado', unidade_id)
    ON CONFLICT (numero_guia) DO NOTHING;
    
    RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
    
    -- Mostrar resumo dos dados inseridos
    RAISE NOTICE 'Contas a Pagar: % registros', (SELECT COUNT(*) FROM contas_pagar WHERE unidade_id = unidade_id);
    RAISE NOTICE 'Contas a Receber: % registros', (SELECT COUNT(*) FROM contas_receber WHERE unidade_id = unidade_id);
    RAISE NOTICE 'Atendimentos: % registros', (SELECT COUNT(*) FROM atendimentos_guias_tabuladas WHERE unidade_id = unidade_id);
    
END $$;
