-- ================================================
-- SOLUÇÃO ALTERNATIVA: DESABILITAR RLS COMPLETAMENTE
-- Execute APENAS se a solução com políticas não funcionar
-- ================================================

-- ATENÇÃO: Esta solução desabilita completamente a segurança de linha
-- Use apenas em ambiente de desenvolvimento/teste

-- 1. Verificar estado atual
SELECT 
    'ANTES DA CORREÇÃO' as momento,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE tablename = 'agendamentos' AND schemaname = 'public';

-- 2. Desabilitar RLS na tabela agendamentos
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se foi desabilitado
SELECT 
    'APÓS DESABILITAR RLS' as momento,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE tablename = 'agendamentos' AND schemaname = 'public';

-- 4. Testar inserção
INSERT INTO agendamentos (
    paciente_id,
    especialidade_id, 
    sala_id,
    unidade_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    duracao_minutos,
    status,
    observacoes
) 
SELECT 
    p.id,
    e.id,
    s.id,
    u.id,
    CURRENT_DATE,
    '14:00',
    '15:00',
    60,
    'agendado',
    'Teste sem RLS'
FROM pacientes p
CROSS JOIN especialidades e  
CROSS JOIN salas s
CROSS JOIN unidades u
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE observacoes = 'Teste sem RLS'
)
LIMIT 1;

-- 5. Verificar resultado
SELECT 
    'RESULTADO' as tipo,
    COUNT(*) as agendamentos_teste
FROM agendamentos 
WHERE observacoes = 'Teste sem RLS';

-- 6. Limpar teste
DELETE FROM agendamentos WHERE observacoes = 'Teste sem RLS';

SELECT '✅ RLS DESABILITADO - AGENDAMENTOS DEVEM FUNCIONAR AGORA!' as resultado;

-- ================================================
-- PARA REABILITAR RLS NO FUTURO (quando configurar as políticas corretas):
-- ================================================
-- ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
