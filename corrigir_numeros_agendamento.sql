-- 🔧 CORREÇÃO URGENTE: numero_agendamento

SELECT '=== CORRIGINDO NUMERO_AGENDAMENTO ===' as etapa;

-- 1. Identificar agendamentos sem número
SELECT 
    'AGENDAMENTOS SEM NÚMERO' as status,
    COUNT(*) as quantidade
FROM agendamentos 
WHERE numero_agendamento IS NULL;

-- 2. Mostrar agendamentos sem número (últimos 5)
SELECT 
    'SEM NÚMERO - DETALHES' as status,
    id,
    data_agendamento,
    created_at
FROM agendamentos 
WHERE numero_agendamento IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 3. Corrigir agendamentos sem número
DO $$
DECLARE
    rec RECORD;
    novo_numero TEXT;
BEGIN
    -- Para cada agendamento sem número, gerar um número
    FOR rec IN 
        SELECT id, data_agendamento, created_at
        FROM agendamentos 
        WHERE numero_agendamento IS NULL
        ORDER BY created_at ASC -- Mais antigos primeiro
    LOOP
        -- Gerar novo número usando a função existente
        SELECT gerar_numero_agendamento() INTO novo_numero;
        
        -- Atualizar o agendamento
        UPDATE agendamentos 
        SET numero_agendamento = novo_numero
        WHERE id = rec.id;
        
        RAISE NOTICE 'Agendamento % recebeu número: %', rec.id, novo_numero;
    END LOOP;
    
    RAISE NOTICE '✅ Todos os agendamentos sem número foram corrigidos';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao corrigir números: %', SQLERRM;
END;
$$;

-- 4. Verificar se todos têm número agora
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    COUNT(*) as total_agendamentos,
    COUNT(numero_agendamento) as com_numero,
    COUNT(*) - COUNT(numero_agendamento) as ainda_sem_numero
FROM agendamentos;

-- 5. Recriar o trigger para garantir que funcione
DO $$
BEGIN
    -- Dropar e recriar trigger
    DROP TRIGGER IF EXISTS gerar_numero_agendamento_trigger ON agendamentos;
    
    CREATE TRIGGER gerar_numero_agendamento_trigger
        BEFORE INSERT ON agendamentos
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_gerar_numero_agendamento();
        
    RAISE NOTICE '✅ Trigger recriado e ativado';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao recriar trigger: %', SQLERRM;
END;
$$;

-- 6. Verificar se trigger está ativo
SELECT 
    'TRIGGER STATUS' as status,
    t.tgname as trigger_name,
    CASE t.tgenabled 
        WHEN 'O' THEN 'ATIVO'
        WHEN 'D' THEN 'DESABILITADO'
        ELSE 'OUTRO'
    END as status_trigger
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'agendamentos' 
    AND t.tgname = 'gerar_numero_agendamento_trigger';
