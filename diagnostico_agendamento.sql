-- Script para diagnosticar erro de criação de agendamento
-- Execute ANTES de tentar criar agendamento

-- 1. Verificar dados básicos das tabelas relacionadas
SELECT 'unidades' as tabela, id, nome FROM unidades LIMIT 5;
SELECT 'especialidades' as tabela, id, nome FROM especialidades LIMIT 5;
SELECT 'salas' as tabela, id, nome, unidade_id FROM salas LIMIT 5;
SELECT 'pacientes' as tabela, id, nome, unidade_id FROM pacientes LIMIT 5;
SELECT 'profissionais' as tabela, id, nome FROM profissionais LIMIT 5;

-- 2. Verificar se as chaves estrangeiras estão corretas
-- Exemplo: verificar se existe uma sala com o ID que está sendo usado
SELECT 
    s.id,
    s.nome as sala_nome,
    s.unidade_id,
    u.nome as unidade_nome
FROM salas s
JOIN unidades u ON s.unidade_id = u.id
WHERE s.ativo = true
LIMIT 5;

-- 3. Verificar se existe pelo menos 1 registro em cada tabela necessária
SELECT 
    (SELECT COUNT(*) FROM unidades) as total_unidades,
    (SELECT COUNT(*) FROM especialidades) as total_especialidades,
    (SELECT COUNT(*) FROM salas WHERE ativo = true) as total_salas_ativas,
    (SELECT COUNT(*) FROM pacientes WHERE ativo = true) as total_pacientes_ativos,
    (SELECT COUNT(*) FROM profissionais WHERE ativo = true) as total_profissionais_ativos;

-- 4. Script para testar inserção com dados reais (ajuste os IDs conforme necessário)
-- SUBSTITUA os IDs pelos IDs reais do seu banco
DO $$
DECLARE
    test_unidade_id UUID;
    test_especialidade_id UUID;
    test_sala_id UUID;
    test_paciente_id UUID;
BEGIN
    -- Pegar IDs reais do banco
    SELECT id INTO test_unidade_id FROM unidades LIMIT 1;
    SELECT id INTO test_especialidade_id FROM especialidades LIMIT 1;
    SELECT id INTO test_sala_id FROM salas WHERE ativo = true LIMIT 1;
    SELECT id INTO test_paciente_id FROM pacientes WHERE ativo = true LIMIT 1;
    
    -- Mostrar os IDs que serão usados
    RAISE NOTICE 'Testando com: unidade=%, especialidade=%, sala=%, paciente=%', 
        test_unidade_id, test_especialidade_id, test_sala_id, test_paciente_id;
    
    -- Tentar inserir agendamento de teste
    INSERT INTO agendamentos (
        paciente_id,
        especialidade_id,
        sala_id,
        unidade_id,
        data_agendamento,
        horario_inicio,
        horario_fim,
        duracao_minutos,
        tipo_sessao,
        modalidade,
        status
    ) VALUES (
        test_paciente_id,
        test_especialidade_id,
        test_sala_id,
        test_unidade_id,
        CURRENT_DATE + 1, -- Amanhã
        '09:00',
        '10:00',
        60,
        'Teste',
        'Teste',
        'agendado'
    );
    
    RAISE NOTICE 'Agendamento de teste criado com sucesso!';
    
    -- Limpar o teste
    DELETE FROM agendamentos WHERE tipo_sessao = 'Teste';
    RAISE NOTICE 'Agendamento de teste removido.';
END $$;
