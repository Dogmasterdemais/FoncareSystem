-- Script para testar a estrutura de documentos dos pacientes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;

-- 2. Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE name = 'pacientes-documentos';

-- 3. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pacientes_documentos';

-- 4. Testar consulta de paciente com unidade (agora que a coluna existe)
SELECT 
  p.id,
  p.nome as paciente_nome,
  p.unidade_id,
  u.nome as unidade_nome
FROM pacientes p
LEFT JOIN unidades u ON p.unidade_id = u.id
LIMIT 5;

-- 5. Verificar se existem documentos já cadastrados
SELECT 
  pd.*,
  p.nome as paciente_nome,
  u.nome as unidade_nome
FROM pacientes_documentos pd
JOIN pacientes p ON pd.paciente_id = p.id
LEFT JOIN unidades u ON p.unidade_id = u.id
LIMIT 10;
