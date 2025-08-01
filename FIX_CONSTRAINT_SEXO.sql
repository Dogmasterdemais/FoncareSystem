-- EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR
-- Para corrigir o constraint do campo sexo

-- Remover o constraint problemático
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_sexo_check;

-- Criar o constraint correto que aceita M, F ou NULL
ALTER TABLE pacientes 
ADD CONSTRAINT pacientes_sexo_check 
CHECK (sexo IS NULL OR sexo IN ('M', 'F'));
