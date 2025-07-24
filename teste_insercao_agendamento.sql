-- 🎯 TESTE FINAL CORRIGIDO: Execute este script para confirmar que a inserção funciona

-- ========================================
-- 1. VERIFICAR DADOS DISPONÍVEIS
-- ========================================
SELECT '📋 VERIFICANDO DADOS DISPONÍVEIS...' as status;

SELECT 'PACIENTES' as tabela, id, nome FROM pacientes WHERE ativo = true LIMIT 3;
SELECT 'UNIDADES' as tabela, id, nome FROM unidades WHERE ativo = true LIMIT 3;
SELECT 'SALAS' as tabela, id, nome, unidade_id FROM salas WHERE ativo = true LIMIT 3;
SELECT 'ESPECIALIDADES' as tabela, id, nome FROM especialidades WHERE ativo = true LIMIT 3;

-- ========================================
-- 2. TESTE DE INSERÇÃO DE AGENDAMENTO
-- ========================================
SELECT '🧪 INICIANDO TESTE DE INSERÇÃO...' as status;

DO $$
DECLARE
    test_paciente_id UUID;
    test_unidade_id UUID;
    test_sala_id UUID;
    test_especialidade_id UUID;
    test_convenio_id UUID;
    test_agendamento_id UUID;
    paciente_nome TEXT;
    dados_agendamento RECORD;
BEGIN
    RAISE NOTICE '=== INICIANDO TESTE DE AGENDAMENTO ===';
    
    -- Pegar IDs reais do banco
    SELECT id, nome INTO test_paciente_id, paciente_nome FROM pacientes WHERE ativo = true LIMIT 1;
    SELECT id INTO test_unidade_id FROM unidades WHERE ativo = true LIMIT 1;
    SELECT id INTO test_sala_id FROM salas WHERE ativo = true LIMIT 1;
    SELECT id INTO test_especialidade_id FROM especialidades WHERE ativo = true LIMIT 1;
    
    -- Buscar convenio_id do paciente selecionado
    SELECT convenio_id INTO test_convenio_id FROM pacientes WHERE id = test_paciente_id;
    
    -- Mostrar os IDs que serão usados
    RAISE NOTICE 'Paciente: % (ID: %)', paciente_nome, test_paciente_id;
    RAISE NOTICE 'IDs encontrados: unidade=%, sala=%, especialidade=%, convenio=%', 
        test_unidade_id, test_sala_id, test_especialidade_id, test_convenio_id;
    
    -- Verificar se todos os IDs foram encontrados
    IF test_paciente_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Nenhum paciente ativo encontrado';
    END IF;
    IF test_unidade_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Nenhuma unidade ativa encontrada';
    END IF;
    IF test_sala_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Nenhuma sala ativa encontrada';
    END IF;
    IF test_especialidade_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Nenhuma especialidade ativa encontrada';
    END IF;
    
    RAISE NOTICE 'Tentando inserir agendamento...';
    
    -- Tentar inserir agendamento (numero_agendamento será gerado automaticamente pelo trigger)
    INSERT INTO agendamentos (
        paciente_id,
        especialidade_id,
        sala_id,
        profissional_id,
        unidade_id,
        convenio_id,
        data_agendamento,
        horario_inicio,
        horario_fim,
        duracao_minutos,
        tipo_sessao,
        modalidade,
        status,
        status_confirmacao,
        sessao_sequencia,
        total_sessoes,
        agendamento_pai_id,
        observacoes,
        created_by,
        updated_by
        -- numero_agendamento será gerado automaticamente pelo trigger
    ) VALUES (
        test_paciente_id,
        test_especialidade_id,
        test_sala_id,
        null, -- profissional_id
        test_unidade_id,
        test_convenio_id, -- convenio_id do paciente
        CURRENT_DATE + 1, -- amanhã
        '09:00',
        '10:00',
        60,
        'Teste Tipo Sessao',
        'Teste Modalidade',
        'agendado',
        'pendente',
        1, -- sessao_sequencia
        1, -- total_sessoes
        null, -- agendamento_pai_id
        'Teste de inserção via SQL',
        null, -- created_by
        null  -- updated_by
        -- numero_agendamento será gerado pelo trigger
    ) RETURNING id INTO test_agendamento_id;
    
    RAISE NOTICE '✅ SUCESSO: Agendamento criado com ID: %', test_agendamento_id;
    
    -- Verificar se o agendamento foi realmente inserido e buscar dados
    SELECT paciente_id, data_agendamento, horario_inicio, convenio_id, numero_agendamento 
    INTO dados_agendamento 
    FROM agendamentos 
    WHERE id = test_agendamento_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ CONFIRMADO: Agendamento encontrado na tabela';
        RAISE NOTICE 'Dados inseridos: paciente=%, data=%, horario=%, convenio=%, numero=%', 
            dados_agendamento.paciente_id, dados_agendamento.data_agendamento, 
            dados_agendamento.horario_inicio, dados_agendamento.convenio_id, dados_agendamento.numero_agendamento;
    ELSE
        RAISE NOTICE '❌ ERRO: Agendamento não foi encontrado após inserção';
    END IF;
    
    -- Limpar o teste
    DELETE FROM agendamentos WHERE id = test_agendamento_id;
    RAISE NOTICE '🧹 Agendamento de teste removido com sucesso';
    RAISE NOTICE '=== TESTE CONCLUÍDO COM SUCESSO ===';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ ERRO ao inserir agendamento: %', SQLERRM;
    RAISE NOTICE '❌ Código do erro: %', SQLSTATE;
    RAISE NOTICE '=== TESTE FALHOU ===';
END;
$$;

-- ========================================
-- 3. VERIFICAR CONSTRAINTS ATUAIS
-- ========================================
SELECT '📋 VERIFICANDO CONSTRAINTS DA TABELA AGENDAMENTOS...' as status;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
    AND contype IN ('c', 'f') -- CHECK e FOREIGN KEY constraints
ORDER BY contype, conname;
