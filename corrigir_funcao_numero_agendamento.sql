-- 🔧 DEPURAÇÃO E CORREÇÃO DA FUNÇÃO gerar_numero_agendamento

SELECT '=== DEPURANDO FUNÇÃO GERAR_NUMERO_AGENDAMENTO ===' as etapa;

-- 1. Verificar números existentes atualmente
SELECT 
    'NÚMEROS EXISTENTES' as tipo,
    numero_agendamento,
    SUBSTRING(numero_agendamento FROM 1 FOR 4) as ano,
    SUBSTRING(numero_agendamento FROM 5) as sequencial_str,
    CASE 
        WHEN numero_agendamento ~ '^[0-9]{10}$' THEN 
            CAST(SUBSTRING(numero_agendamento FROM 6) AS INTEGER)
        ELSE NULL 
    END as sequencial_int
FROM agendamentos 
WHERE numero_agendamento IS NOT NULL
ORDER BY numero_agendamento DESC
LIMIT 10;

-- 2. Testar a função atual
DO $$
DECLARE
    numero_gerado TEXT;
    ano_atual TEXT := TO_CHAR(NOW(), 'YYYY');
BEGIN
    RAISE NOTICE 'Ano atual: %', ano_atual;
    
    -- Testar a função 3 vezes
    FOR i IN 1..3 LOOP
        SELECT gerar_numero_agendamento() INTO numero_gerado;
        RAISE NOTICE 'Tentativa %: Número gerado = %', i, numero_gerado;
    END LOOP;
END;
$$;

-- 3. Verificar se há conflito com números existentes
SELECT 
    'CONFLITO POTENCIAL' as tipo,
    numero_agendamento
FROM agendamentos 
WHERE numero_agendamento = (SELECT gerar_numero_agendamento());

-- 4. Recriar a função com lógica mais robusta
DROP FUNCTION IF EXISTS gerar_numero_agendamento();

CREATE FUNCTION gerar_numero_agendamento()
RETURNS TEXT AS $$
DECLARE
  numero TEXT;
  ano TEXT := TO_CHAR(NOW(), 'YYYY');
  sequencial INTEGER;
  tentativas INTEGER := 0;
  max_tentativas INTEGER := 100;
BEGIN
  LOOP
    -- Buscar último número do ano (melhor lógica)
    SELECT COALESCE(
      MAX(
        CASE 
          WHEN numero_agendamento ~ '^[0-9]{10}$' AND SUBSTRING(numero_agendamento FROM 1 FOR 4) = ano
          THEN CAST(SUBSTRING(numero_agendamento FROM 6) AS INTEGER)
          ELSE 0 
        END
      ), 0
    ) + 1
    INTO sequencial
    FROM agendamentos;
    
    -- Formatar: YYYY + sequencial com 6 dígitos
    numero := ano || LPAD(sequencial::TEXT, 6, '0');
    
    -- Verificar se já existe (extra segurança)
    IF NOT EXISTS (SELECT 1 FROM agendamentos WHERE numero_agendamento = numero) THEN
      EXIT; -- Número único encontrado
    END IF;
    
    -- Incrementar e tentar novamente
    sequencial := sequencial + 1;
    tentativas := tentativas + 1;
    
    IF tentativas > max_tentativas THEN
      RAISE EXCEPTION 'Não foi possível gerar número único após % tentativas', max_tentativas;
    END IF;
  END LOOP;
  
  RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- 5. Testar a nova função
DO $$
DECLARE
    numero_gerado TEXT;
BEGIN
    -- Testar a nova função 5 vezes
    FOR i IN 1..5 LOOP
        SELECT gerar_numero_agendamento() INTO numero_gerado;
        RAISE NOTICE '✅ Nova função - Tentativa %: Número gerado = %', i, numero_gerado;
    END LOOP;
END;
$$;

-- 6. Recriar o trigger (caso tenha sido afetado)
DO $$
BEGIN
    DROP TRIGGER IF EXISTS gerar_numero_agendamento_trigger ON agendamentos;
    
    CREATE TRIGGER gerar_numero_agendamento_trigger
        BEFORE INSERT ON agendamentos
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_gerar_numero_agendamento();
        
    RAISE NOTICE '✅ Trigger recriado com função corrigida';
END;
$$;
