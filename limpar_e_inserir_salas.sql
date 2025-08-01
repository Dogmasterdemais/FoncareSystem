-- Script para recriar tabela salas com estrutura melhorada
-- Execute este script no Supabase Dashboard

-- PASSO 1: Fazer backup da estrutura atual (opcional)
-- CREATE TABLE salas_backup AS SELECT * FROM "public"."salas";

-- PASSO 2: Remover a tabela existente
DROP TABLE IF EXISTS "public"."salas";

-- PASSO 3: Recriar a tabela com a mesma estrutura + 2 novas colunas
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
    "profissional_id" uuid,  -- NOVA COLUNA para vincular profissional
    "sub_especialidade" text, -- NOVA COLUNA para sub-especialidade
    CONSTRAINT "salas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "salas_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE
);

-- PASSO 4: Criar índices para performance
CREATE INDEX "idx_salas_unidade_id" ON "public"."salas" USING btree ("unidade_id");
CREATE INDEX "idx_salas_ativo" ON "public"."salas" USING btree ("ativo");
CREATE INDEX "idx_salas_tipo" ON "public"."salas" USING btree ("tipo");
CREATE INDEX "idx_salas_profissional_id" ON "public"."salas" USING btree ("profissional_id");

-- PASSO 5: Inserir dados limpos (91 registros únicos)
