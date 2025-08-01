-- 🔧 VERIFICAR E CORRIGIR TRIGGER numero_agendamento

-- 1. Verificar se o trigger existe
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'agendamentos' 
    AND t.tgname LIKE '%numero_agendamento%';

-- 2. Verificar se a função existe
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%numero_agendamento%';

-- 3. Testar a função diretamente
SELECT gerar_numero_agendamento() as proximo_numero;

-- 4. Recriar o trigger se necessário
DO $$
BEGIN
    -- Dropar trigger se existir
    DROP TRIGGER IF EXISTS gerar_numero_agendamento_trigger ON agendamentos;
    
    -- Recriar o trigger
    CREATE TRIGGER gerar_numero_agendamento_trigger
        BEFORE INSERT ON agendamentos
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_gerar_numero_agendamento();
        
    RAISE NOTICE '✅ Trigger recriado com sucesso';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao recriar trigger: %', SQLERRM;
END;
$$;

-- 5. Verificar novamente se o trigger foi criado
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'agendamentos' 
    AND t.tgname LIKE '%numero_agendamento%';
