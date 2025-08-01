-- Script ULTRA SIMPLES - Execute linha por linha se necessário

-- Passo 1: Adicionar coluna
ALTER TABLE profissionais ADD COLUMN unidade_id UUID;

-- Passo 2: Adicionar foreign key
ALTER TABLE profissionais ADD CONSTRAINT profissionais_unidade_id_fkey FOREIGN KEY (unidade_id) REFERENCES unidades(id);

-- Passo 3: Atualizar registros existentes
UPDATE profissionais SET unidade_id = (SELECT id FROM unidades ORDER BY nome LIMIT 1) WHERE unidade_id IS NULL;

-- Passo 4: Verificar
SELECT COUNT(*) as total_profissionais FROM profissionais WHERE ativo = true;
SELECT COUNT(*) as com_unidade FROM profissionais WHERE ativo = true AND unidade_id IS NOT NULL;
