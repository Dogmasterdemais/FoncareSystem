-- Verificar o constraint do campo sexo na tabela pacientes

-- 1. Verificar a estrutura da tabela pacientes
\d pacientes;

-- 2. Verificar todos os constraints da tabela pacientes
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'pacientes');

-- 3. Verificar especificamente constraints CHECK
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'pacientes')
AND contype = 'c';

-- 4. Tentar inserir um teste com valores válidos
INSERT INTO pacientes (nome, sexo, data_nascimento, telefone, cpf, unidade_id, ativo) 
VALUES (
    'Teste Constraint', 
    'M', 
    '1990-01-01', 
    '(11) 99999-9999', 
    '123.456.789-00',
    (SELECT id FROM unidades LIMIT 1),
    true
);

-- 5. Verificar se foi inserido
SELECT * FROM pacientes WHERE nome = 'Teste Constraint';

-- 6. Remover o registro de teste
DELETE FROM pacientes WHERE nome = 'Teste Constraint';
