-- Testar diferentes valores para o campo sexo

-- Teste 1: Valor 'M' (deve funcionar)
SELECT 'M'::VARCHAR(1) as teste_m WHERE 'M' IN ('M', 'F');

-- Teste 2: Valor 'F' (deve funcionar)  
SELECT 'F'::VARCHAR(1) as teste_f WHERE 'F' IN ('M', 'F');

-- Teste 3: Valor null (deve funcionar se permitido)
SELECT NULL::VARCHAR(1) as teste_null WHERE NULL IN ('M', 'F') OR NULL IS NULL;

-- Teste 4: String vazia (pode ser o problema)
SELECT ''::VARCHAR(1) as teste_vazio WHERE '' IN ('M', 'F');

-- Teste 5: Verificar se string vazia causa problemas
SELECT 
  CASE 
    WHEN '' IN ('M', 'F') THEN 'String vazia é aceita'
    WHEN '' IS NULL THEN 'String vazia é null'
    ELSE 'String vazia é rejeitada'
  END as resultado;
