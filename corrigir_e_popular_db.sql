-- Script para corrigir estrutura e popular dados básicos
-- Execute este script no Supabase Dashboard se houver problemas

-- 1. Adicionar coluna unidade_id na tabela profissionais se não existir
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS unidade_id UUID;

-- 2. Adicionar constraint de foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profissionais_unidade_id_fkey'
    ) THEN
        ALTER TABLE profissionais ADD CONSTRAINT profissionais_unidade_id_fkey 
        FOREIGN KEY (unidade_id) REFERENCES unidades(id);
    END IF;
END $$;

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profissionais_unidade_id ON profissionais(unidade_id);

-- 4. Inserir alguns profissionais de exemplo (apenas se não existirem)
DO $$
DECLARE
    unidade_nac_id UUID;
    esp_psicologia_id UUID;
    esp_neuropsicologia_id UUID;
    esp_fonoaudiologia_id UUID;
BEGIN
    -- Buscar IDs das unidades e especialidades
    SELECT id INTO unidade_nac_id FROM unidades WHERE nome ILIKE '%nac%' OR nome ILIKE '%criança%' LIMIT 1;
    SELECT id INTO esp_psicologia_id FROM especialidades WHERE nome ILIKE '%psicolog%' LIMIT 1;
    SELECT id INTO esp_neuropsicologia_id FROM especialidades WHERE nome ILIKE '%neuropsicolog%' LIMIT 1;
    SELECT id INTO esp_fonoaudiologia_id FROM especialidades WHERE nome ILIKE '%fono%' LIMIT 1;

    -- Se não encontrou a unidade NAC, usar a primeira disponível
    IF unidade_nac_id IS NULL THEN
        SELECT id INTO unidade_nac_id FROM unidades ORDER BY nome LIMIT 1;
    END IF;

    -- Se não encontrou especialidades específicas, usar as primeiras
    IF esp_psicologia_id IS NULL THEN
        SELECT id INTO esp_psicologia_id FROM especialidades ORDER BY nome LIMIT 1;
    END IF;
    IF esp_neuropsicologia_id IS NULL THEN
        SELECT id INTO esp_neuropsicologia_id FROM especialidades ORDER BY nome OFFSET 1 LIMIT 1;
    END IF;
    IF esp_fonoaudiologia_id IS NULL THEN
        SELECT id INTO esp_fonoaudiologia_id FROM especialidades ORDER BY nome OFFSET 2 LIMIT 1;
    END IF;

    -- Inserir profissionais apenas se não existirem
    IF NOT EXISTS (SELECT 1 FROM profissionais WHERE email = 'joao.silva@foncare.com') THEN
        INSERT INTO profissionais (nome, especialidade_id, unidade_id, email, telefone, crf, ativo)
        VALUES 
        ('Dr. João Silva', esp_psicologia_id, unidade_nac_id, 'joao.silva@foncare.com', '(11) 98765-4321', 'CRP 06/123456', true),
        ('Dra. Maria Santos', esp_neuropsicologia_id, unidade_nac_id, 'maria.santos@foncare.com', '(11) 98765-4322', 'CRP 06/789012', true),
        ('Dr. Pedro Costa', esp_fonoaudiologia_id, unidade_nac_id, 'pedro.costa@foncare.com', '(11) 98765-4323', 'CRA 12345', true);
    END IF;

    RAISE NOTICE 'Script executado com sucesso! Unidade: %, Profissionais: %', 
        (SELECT nome FROM unidades WHERE id = unidade_nac_id),
        (SELECT COUNT(*) FROM profissionais WHERE ativo = true);
END $$;

-- 5. Verificar resultado
SELECT 
    p.nome as profissional,
    e.nome as especialidade,
    u.nome as unidade,
    p.email,
    p.telefone
FROM profissionais p
LEFT JOIN especialidades e ON p.especialidade_id = e.id
LEFT JOIN unidades u ON p.unidade_id = u.id
WHERE p.ativo = true
ORDER BY u.nome, p.nome;
