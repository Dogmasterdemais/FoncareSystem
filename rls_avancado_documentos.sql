-- Script para configurar políticas RLS avançadas para documentos dos pacientes
-- Execute APÓS verificar a estrutura da tabela colaboradores

-- IMPORTANTE: Execute primeiro o script verificar_colaboradores.sql para ver a estrutura
-- e ajustar as colunas conforme necessário

-- Exemplo de políticas mais restritivas (ajustar conforme a estrutura real):

-- Caso a tabela colaboradores tenha uma coluna para identificar o usuário:
-- Substitua 'auth_user_id' ou 'email' pela coluna correta

/*
-- Política para SELECT - usuários podem ver documentos dos pacientes de suas unidades
DROP POLICY IF EXISTS "Usuários podem ver documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem ver documentos de pacientes de suas unidades" ON pacientes_documentos
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM pacientes p
    JOIN colaboradores c ON c.unidade_id = p.unidade_id
    JOIN auth.users u ON u.id = auth.uid()
    WHERE p.id = paciente_id 
    AND (c.email = u.email OR c.auth_user_id = u.id)  -- Ajustar conforme a estrutura
  )
);

-- Política para INSERT - usuários podem inserir documentos para pacientes de suas unidades
DROP POLICY IF EXISTS "Usuários podem inserir documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem inserir documentos de pacientes de suas unidades" ON pacientes_documentos
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM pacientes p
    JOIN colaboradores c ON c.unidade_id = p.unidade_id
    JOIN auth.users u ON u.id = auth.uid()
    WHERE p.id = paciente_id 
    AND (c.email = u.email OR c.auth_user_id = u.id)  -- Ajustar conforme a estrutura
  )
);

-- Política para UPDATE - usuários podem atualizar documentos de pacientes de suas unidades
DROP POLICY IF EXISTS "Usuários podem atualizar documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem atualizar documentos de pacientes de suas unidades" ON pacientes_documentos
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM pacientes p
    JOIN colaboradores c ON c.unidade_id = p.unidade_id
    JOIN auth.users u ON u.id = auth.uid()
    WHERE p.id = paciente_id 
    AND (c.email = u.email OR c.auth_user_id = u.id)  -- Ajustar conforme a estrutura
  )
);

-- Política para DELETE - usuários podem deletar documentos de pacientes de suas unidades
DROP POLICY IF EXISTS "Usuários podem deletar documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem deletar documentos de pacientes de suas unidades" ON pacientes_documentos
FOR DELETE USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM pacientes p
    JOIN colaboradores c ON c.unidade_id = p.unidade_id
    JOIN auth.users u ON u.id = auth.uid()
    WHERE p.id = paciente_id 
    AND (c.email = u.email OR c.auth_user_id = u.id)  -- Ajustar conforme a estrutura
  )
);
*/

-- Notas para implementação:
-- 1. Execute verificar_colaboradores.sql primeiro
-- 2. Identifique como os colaboradores são ligados aos usuários autenticados
-- 3. Ajuste as consultas acima conforme a estrutura real
-- 4. Descomente e execute as políticas ajustadas
-- 5. Teste com usuários reais para validar as permissões

SELECT 'Execute verificar_colaboradores.sql primeiro para ver a estrutura da tabela' as instrucao;
