-- Corrigir políticas RLS para permitir acesso sem autenticação para testes
-- IMPORTANTE: Em produção, use autenticação adequada

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Authenticated users can view recebimentos_convenios" ON recebimentos_convenios;
DROP POLICY IF EXISTS "Authenticated users can insert recebimentos_convenios" ON recebimentos_convenios;
DROP POLICY IF EXISTS "Authenticated users can update recebimentos_convenios" ON recebimentos_convenios;
DROP POLICY IF EXISTS "Authenticated users can delete recebimentos_convenios" ON recebimentos_convenios;

DROP POLICY IF EXISTS "Authenticated users can view recebimentos_atendimentos" ON recebimentos_atendimentos;
DROP POLICY IF EXISTS "Authenticated users can insert recebimentos_atendimentos" ON recebimentos_atendimentos;
DROP POLICY IF EXISTS "Authenticated users can update recebimentos_atendimentos" ON recebimentos_atendimentos;
DROP POLICY IF EXISTS "Authenticated users can delete recebimentos_atendimentos" ON recebimentos_atendimentos;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Allow all operations recebimentos_convenios" ON recebimentos_convenios
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR ALL USING (true) WITH CHECK (true);

-- Opcional: Desabilitar RLS temporariamente para desenvolvimento
-- ALTER TABLE recebimentos_convenios DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE recebimentos_atendimentos DISABLE ROW LEVEL SECURITY;
