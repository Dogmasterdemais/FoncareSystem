-- 🔧 SOLUÇÃO DEFINITIVA: numero_agendamento

SELECT '=== ANÁLISE PROFUNDA E CORREÇÃO DEFINITIVA ===' as titulo;

-- 1. Verificar se a coluna numero_agendamento realmente existe na tabela
SELECT 
    'ESTRUTURA DA TABELA' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
    AND table_schema = 'public'
    AND column_name = 'numero_agendamento';

-- 2. Verificar constraint unique
SELECT 
    'CONSTRAINT UNIQUE' as tipo,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'agendamentos' 
    AND conname LIKE '%numero_agendamento%';

-- 3. Contar registros com e sem numero_agendamento
SELECT 
    'CONTAGEM REGISTROS' as tipo,
    COUNT(*) as total,
    COUNT(numero_agendamento) as com_numero,
    COUNT(*) - COUNT(numero_agendamento) as sem_numero
FROM agendamentos;

-- 4. Ver alguns registros para entender a estrutura
SELECT 
    'AMOSTRA DE DADOS' as tipo,
    id,
    COALESCE(numero_agendamento, 'NULL') as numero,
    data_agendamento,
    created_at
FROM agendamentos 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. CORREÇÃO DRÁSTICA: Remover constraint temporariamente, corrigir dados e recriar
DO $$
DECLARE
    constraint_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se constraint existe
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'agendamentos' 
            AND c.conname = 'agendamentos_numero_agendamento_key'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE 'Removendo constraint temporariamente...';
        ALTER TABLE agendamentos DROP CONSTRAINT agendamentos_numero_agendamento_key;
        RAISE NOTICE '✅ Constraint removida';
    ELSE
        RAISE NOTICE 'Constraint não existe ou tem nome diferente';
    END IF;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao remover constraint: %', SQLERRM;
END;
$$;

-- 6. Corrigir TODOS os registros sem número
DO $$
DECLARE
    rec RECORD;
    novo_numero TEXT;
    contador INTEGER := 0;
BEGIN
    RAISE NOTICE 'Corrigindo registros sem numero_agendamento...';
    
    FOR rec IN 
        SELECT id FROM agendamentos 
        WHERE numero_agendamento IS NULL OR numero_agendamento = ''
        ORDER BY created_at ASC
    LOOP
        contador := contador + 1;
        novo_numero := TO_CHAR(NOW(), 'YYYY') || LPAD(contador::TEXT, 6, '0');
        
        -- Garantir que o número não existe
        WHILE EXISTS (SELECT 1 FROM agendamentos WHERE numero_agendamento = novo_numero) LOOP
            contador := contador + 1;
            novo_numero := TO_CHAR(NOW(), 'YYYY') || LPAD(contador::TEXT, 6, '0');
        END LOOP;
        
        UPDATE agendamentos 
        SET numero_agendamento = novo_numero
        WHERE id = rec.id;
        
        RAISE NOTICE 'ID % -> Número %', rec.id, novo_numero;
    END LOOP;
    
    RAISE NOTICE '✅ % registros corrigidos', contador;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao corrigir registros: %', SQLERRM;
END;
$$;

-- 7. Recriar constraint
DO $$
BEGIN
    ALTER TABLE agendamentos 
    ADD CONSTRAINT agendamentos_numero_agendamento_key 
    UNIQUE (numero_agendamento);
    
    RAISE NOTICE '✅ Constraint unique recriada';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao recriar constraint: %', SQLERRM;
END;
$$;

-- 8. Atualizar função para ser mais robusta
DROP FUNCTION IF EXISTS gerar_numero_agendamento() CASCADE;

CREATE OR REPLACE FUNCTION gerar_numero_agendamento()
RETURNS TEXT AS $$
DECLARE
    numero TEXT;
    ano TEXT := TO_CHAR(NOW(), 'YYYY');
    proximo_seq INTEGER;
BEGIN
    -- Buscar próximo número disponível
    SELECT COALESCE(MAX(
        CASE 
            WHEN numero_agendamento ~ ('^' || ano || '[0-9]{6}$')
            THEN CAST(SUBSTRING(numero_agendamento FROM 5) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO proximo_seq
    FROM agendamentos;
    
    -- Formatar número
    numero := ano || LPAD(proximo_seq::TEXT, 6, '0');
    
    -- Verificação de segurança
    WHILE EXISTS (SELECT 1 FROM agendamentos WHERE numero_agendamento = numero) LOOP
        proximo_seq := proximo_seq + 1;
        numero := ano || LPAD(proximo_seq::TEXT, 6, '0');
    END LOOP;
    
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- 9. Recriar trigger
DROP TRIGGER IF EXISTS gerar_numero_agendamento_trigger ON agendamentos;

CREATE OR REPLACE FUNCTION trigger_gerar_numero_agendamento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_agendamento IS NULL OR NEW.numero_agendamento = '' THEN
        NEW.numero_agendamento := gerar_numero_agendamento();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gerar_numero_agendamento_trigger
    BEFORE INSERT ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gerar_numero_agendamento();

-- 10. Verificação final
SELECT 
    'VERIFICAÇÃO FINAL' as tipo,
    COUNT(*) as total,
    COUNT(numero_agendamento) as com_numero,
    COUNT(*) - COUNT(numero_agendamento) as sem_numero
FROM agendamentos;

-- 11. Testar função
SELECT 'TESTE FUNÇÃO' as tipo, gerar_numero_agendamento() as proximo_numero;
