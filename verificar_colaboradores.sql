-- Script para verificar a estrutura da tabela colaboradores
-- Execute este script no Supabase SQL Editor para verificar as colunas

-- 1. Verificar estrutura da tabela colaboradores
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- 2. Verificar dados de exemplo na tabela colaboradores
SELECT * FROM colaboradores LIMIT 5;
