-- Script para corrigir o constraint do campo sexo na tabela pacientes

-- 1. Primeiro, vamos ver todos os constraints da tabela pacientes
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'pacientes')
AND contype = 'c'
ORDER BY conname;

-- 2. Remover o constraint problemático (se existir)
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_sexo_check;

-- 3. Remover qualquer outro constraint relacionado ao sexo
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS sexo_check;

-- 4. Criar o constraint correto que aceita M, F ou NULL
ALTER TABLE pacientes 
ADD CONSTRAINT pacientes_sexo_check 
CHECK (sexo IS NULL OR sexo IN ('M', 'F'));

-- 5. Verificar se o constraint foi criado corretamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'pacientes')
AND conname = 'pacientes_sexo_check';

-- 6. Testar inserção com valores válidos
-- (Comentado para não inserir dados de teste)
-- INSERT INTO pacientes (nome, sexo, data_nascimento, telefone, cpf, unidade_id, ativo) 
-- VALUES ('Teste M', 'M', '1990-01-01', '11999999999', '12345678901', 
--         (SELECT id FROM unidades LIMIT 1), true);

-- INSERT INTO pacientes (nome, sexo, data_nascimento, telefone, cpf, unidade_id, ativo) 
-- VALUES ('Teste F', 'F', '1990-01-01', '11999999998', '12345678902', 
--         (SELECT id FROM unidades LIMIT 1), true);

-- INSERT INTO pacientes (nome, sexo, data_nascimento, telefone, cpf, unidade_id, ativo) 
-- VALUES ('Teste NULL', NULL, '1990-01-01', '11999999997', '12345678903', 
--         (SELECT id FROM unidades LIMIT 1), true);
