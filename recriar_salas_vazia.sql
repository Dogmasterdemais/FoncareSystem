-- Script para recriar tabela salas vazia com estrutura melhorada
-- Execute este script no Supabase Dashboard

-- PASSO 1: Fazer backup dos dados existentes
CREATE TABLE IF NOT EXISTS salas_backup AS 
SELECT * FROM "public"."salas";

-- PASSO 2: Salvar apenas títulos e estrutura importante
CREATE TABLE IF NOT EXISTS salas_estrutura_backup AS 
SELECT DISTINCT nome, tipo, numero, equipamentos, cor, observacoes 
FROM "public"."salas"
WHERE nome IS NOT NULL AND nome != ''
ORDER BY nome;

-- PASSO 3: Salvar dependências antes de remover
-- Salvar foreign keys que dependem de salas
CREATE TABLE IF NOT EXISTS dependencias_backup AS
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'salas';

-- PASSO 4: Remover a tabela existente COM CASCADE
DROP TABLE IF EXISTS "public"."salas" CASCADE;

-- PASSO 5: Recriar a tabela com estrutura melhorada + 2 novas colunas
CREATE TABLE "public"."salas" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "unidade_id" uuid NOT NULL,
    "nome" text NOT NULL,
    "numero" text,
    "tipo" text NOT NULL DEFAULT 'consulta'::text,
    "capacidade" integer NOT NULL DEFAULT 1,
    "equipamentos" jsonb DEFAULT '[]'::jsonb,
    "ativo" boolean NOT NULL DEFAULT true,
    "observacoes" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "cor" text DEFAULT '#808080'::text,
    "especialidade_id" uuid,
    "capacidade_maxima" integer DEFAULT 6,
    "profissional_id" uuid,  -- NOVA COLUNA para profissional principal
    "sub" uuid,              -- NOVA COLUNA para sub-profissional
    CONSTRAINT "salas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "salas_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE
);

-- PASSO 6: Adicionar comentários nas colunas
COMMENT ON COLUMN "public"."salas"."profissional_id" IS 'ID do profissional principal responsável pela sala';
COMMENT ON COLUMN "public"."salas"."sub" IS 'ID do sub-profissional ou profissional secundário da sala';

-- PASSO 7: Criar índices para performance
CREATE INDEX "idx_salas_unidade_id" ON "public"."salas" USING btree ("unidade_id");
CREATE INDEX "idx_salas_ativo" ON "public"."salas" USING btree ("ativo");
CREATE INDEX "idx_salas_tipo" ON "public"."salas" USING btree ("tipo");
CREATE INDEX "idx_salas_profissional_id" ON "public"."salas" USING btree ("profissional_id");
CREATE INDEX "idx_salas_sub" ON "public"."salas" USING btree ("sub");

-- PASSO 8: Recriar foreign key de agendamentos (se existir)
-- Verificar se tabela agendamentos existe e recriar a constraint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
        -- Recriar foreign key constraint
        ALTER TABLE "public"."agendamentos" 
        ADD CONSTRAINT "agendamentos_sala_id_fkey" 
        FOREIGN KEY ("sala_id") REFERENCES "public"."salas"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- PASSO 9: Recriar view vw_agendamentos_completo (se necessário)
-- Esta view será recriada automaticamente quando necessário ou pode ser recriada manualmente

-- PASSO 10: Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'salas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASSO 11: Verificar se está vazia
SELECT COUNT(*) as total_registros FROM "public"."salas";

-- PASSO 12: Mostrar dados salvos no backup
SELECT 'Dados salvos no backup:' as info;
SELECT COUNT(*) as total_backup FROM salas_backup;
SELECT COUNT(*) as total_estruturas FROM salas_estrutura_backup;

-- TABELA AGORA ESTÁ PRONTA PARA RECEBER NOVOS DADOS!
-- Próximo passo: Inserir dados limpos (sem duplicatas)
