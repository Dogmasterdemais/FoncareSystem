-- Verificação das tabelas do módulo terapêutico
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'profissionais_salas',
            'atendimentos_reais', 
            'evolucoes_atendimento',
            'ocorrencias_recepcao',
            'alertas_ocupacao',
            'configuracoes_terapeuticas',
            'log_eventos_terapeuticos'
        ) THEN '✓ Tabela do módulo terapêutico'
        ELSE 'Outra tabela'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (
        table_name LIKE '%terapeutic%' 
        OR table_name IN (
            'profissionais_salas',
            'atendimentos_reais', 
            'evolucoes_atendimento',
            'ocorrencias_recepcao',
            'alertas_ocupacao',
            'configuracoes_terapeuticas',
            'log_eventos_terapeuticos'
        )
    )
ORDER BY table_name;

-- Verificar views criadas
SELECT 
    table_name as view_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'VIEW'
    AND table_name LIKE 'vw_%'
ORDER BY table_name;

-- Verificar configurações inseridas
SELECT chave, valor, descricao 
FROM configuracoes_terapeuticas 
ORDER BY chave;
