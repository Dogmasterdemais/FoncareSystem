-- INSTRUÇÕES PARA EXECUÇÃO NO SUPABASE DASHBOARD
-- Execute UMA linha por vez no SQL Editor
-- Aguarde cada comando terminar antes de executar o próximo

-- 1. PRIMEIRO - Adicionar a coluna unidade_id
ALTER TABLE profissionais ADD COLUMN unidade_id UUID;

-- 2. SEGUNDO - Buscar o ID da primeira unidade
-- (Execute e anote o ID que aparecer)
SELECT id, nome FROM unidades LIMIT 1;

-- 3. TERCEIRO - Atualizar profissionais sem unidade
-- (SUBSTITUA 'UUID_DA_UNIDADE_AQUI' pelo ID obtido no passo 2)
-- UPDATE profissionais SET unidade_id = 'UUID_DA_UNIDADE_AQUI' WHERE unidade_id IS NULL;

-- 4. QUARTO - Criar a foreign key (opcional)
-- ALTER TABLE profissionais ADD CONSTRAINT fk_profissionais_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id);

-- 5. VERIFICAÇÃO - Ver se deu certo
SELECT 
  p.nome, 
  u.nome as unidade,
  e.nome as especialidade 
FROM profissionais p 
LEFT JOIN unidades u ON p.unidade_id = u.id 
LEFT JOIN especialidades e ON p.especialidade_id = e.id
LIMIT 10;
