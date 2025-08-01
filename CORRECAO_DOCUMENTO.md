# Correção do erro "documento" column não encontrada

## O Problema
O erro "Could not find the 'documento' column of 'pacientes' in the schema cache" indica que o campo `documento` não existe na tabela `pacientes` no banco de dados Supabase.

## Solução

### 1. Acesse o Supabase Dashboard
- Vá para https://app.supabase.com
- Faça login na sua conta
- Selecione o projeto do FoncareSystem

### 2. Execute a Migração
No SQL Editor do Supabase, execute o seguinte comando:

```sql
-- Adicionar campo documento à tabela pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS documento VARCHAR(20);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);

-- Adicionar comentário
COMMENT ON COLUMN pacientes.documento IS 'Documento geral (pode ser usado para outros tipos de documento)';
```

### 3. Verifique se o campo foi adicionado
Execute esta query para verificar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
AND column_name = 'documento';
```

### 4. Executar migração completa (opcional)
Se quiser executar toda a migração, copie e execute o conteúdo do arquivo `migration_pacientes.sql` no SQL Editor.

## Arquivos Atualizados
- ✅ `migration_pacientes.sql` - Adicionado campo `documento`
- ✅ `src/components/PacienteCadastroStepper.tsx` - Já está usando o campo corretamente
- ✅ `src/components/DatabaseTestComponent.tsx` - Já está usando o campo corretamente

## Após executar a migração
1. Reinicie o servidor de desenvolvimento
2. Teste o cadastro de pacientes
3. Verifique se o erro desapareceu

## Comando para testar
```bash
npm run dev
```

O sistema já está configurado para usar o campo `documento` corretamente. Só precisamos adicionar o campo no banco de dados.
