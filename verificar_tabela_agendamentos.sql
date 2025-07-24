-- Script para verificar a estrutura da tabela agendamentos
-- Execute no Supabase para diagnosticar problemas

-- 1. Verificar se a tabela existe
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'agendamentos';

-- 2. Verificar colunas da tabela agendamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
ORDER BY ordinal_position;

-- 3. Verificar constraints (chaves estrangeiras)
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'agendamentos';

-- 4. Verificar se tem dados na tabela
SELECT COUNT(*) as total_agendamentos FROM agendamentos;

-- 5. Verificar as tabelas relacionadas que são referenciadas
SELECT 'pacientes' as tabela, COUNT(*) as total FROM pacientes
UNION ALL
SELECT 'especialidades' as tabela, COUNT(*) as total FROM especialidades
UNION ALL
SELECT 'salas' as tabela, COUNT(*) as total FROM salas
UNION ALL
SELECT 'profissionais' as tabela, COUNT(*) as total FROM profissionais
UNION ALL
SELECT 'unidades' as tabela, COUNT(*) as total FROM unidades;

-- 6. Teste de inserção simples (dados fictícios para teste)
-- ATENÇÃO: Comentado por segurança - descomente apenas se souber os IDs corretos
/*
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
    '00000000-0000-0000-0000-000000000000', -- ID de teste
    '00000000-0000-0000-0000-000000000000', -- ID de teste
    '00000000-0000-0000-0000-000000000000', -- ID de teste
    '00000000-0000-0000-0000-000000000000', -- ID de teste
    '2025-01-22',
    '09:00',
    '10:00',
    60,
    'Teste',
    'Teste',
    'agendado'
);
*/
