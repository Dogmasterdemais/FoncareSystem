-- Script para verificar e corrigir colunas faltantes na tabela agendamentos
-- Algumas colunas podem estar faltando e causando erros na inserção

-- 1. Verificar se a coluna agendamento_pai_id existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'agendamentos' 
            AND column_name = 'agendamento_pai_id'
        ) 
        THEN 'Coluna agendamento_pai_id EXISTE'
        ELSE 'Coluna agendamento_pai_id NÃO EXISTE'
    END as status_agendamento_pai_id;

-- 2. Verificar todas as colunas que o código frontend está tentando usar
SELECT 
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'agendamentos' 
            AND information_schema.columns.column_name = cols.column_name
        ) 
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
FROM (
    VALUES 
        ('paciente_id'),
        ('especialidade_id'),
        ('sala_id'),
        ('profissional_id'),
        ('unidade_id'),
        ('data_agendamento'),
        ('horario_inicio'),
        ('horario_fim'),
        ('duracao_minutos'),
        ('tipo_sessao'),
        ('modalidade'),
        ('status'),
        ('agendamento_pai_id'),
        ('observacoes'),
        ('convenio_id')
) as cols(column_name);

-- 3. Adicionar colunas que podem estar faltando
ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "agendamento_pai_id" UUID;

ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "convenio_id" UUID;

ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "observacoes" TEXT;

-- 4. Criar foreign key para agendamento_pai_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'agendamentos_agendamento_pai_id_fkey'
  ) THEN
    ALTER TABLE "public"."agendamentos" 
    ADD CONSTRAINT "agendamentos_agendamento_pai_id_fkey" 
    FOREIGN KEY ("agendamento_pai_id") REFERENCES "public"."agendamentos"("id");
  END IF;
END;
$$;

-- 5. Criar foreign key para convenio_id se não existir e tabela convenios existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'convenios') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'agendamentos_convenio_id_fkey'
    ) THEN
      ALTER TABLE "public"."agendamentos" 
      ADD CONSTRAINT "agendamentos_convenio_id_fkey" 
      FOREIGN KEY ("convenio_id") REFERENCES "public"."convenios"("id");
    END IF;
  END IF;
END;
$$;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS "idx_agendamentos_agendamento_pai_id" 
ON "public"."agendamentos" USING btree ("agendamento_pai_id");

CREATE INDEX IF NOT EXISTS "idx_agendamentos_convenio_id" 
ON "public"."agendamentos" USING btree ("convenio_id");

-- 7. Comentários nas colunas
COMMENT ON COLUMN "public"."agendamentos"."agendamento_pai_id" IS 'ID do agendamento pai para agendamentos sequenciais';
COMMENT ON COLUMN "public"."agendamentos"."convenio_id" IS 'ID do convênio do paciente';

-- 8. Verificar resultado final - todas as colunas necessárias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
    AND column_name IN (
        'paciente_id', 'especialidade_id', 'sala_id', 'profissional_id', 
        'unidade_id', 'data_agendamento', 'horario_inicio', 'horario_fim',
        'duracao_minutos', 'tipo_sessao', 'modalidade', 'status',
        'agendamento_pai_id', 'observacoes', 'convenio_id'
    )
ORDER BY column_name;
