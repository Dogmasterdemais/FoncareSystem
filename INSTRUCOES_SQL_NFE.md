# 📋 INSTRUÇÕES PARA EXECUTAR SQL NFe NO SUPABASE

## 🔧 Como executar no painel do Supabase:

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Entre no seu projeto
- Clique na aba **SQL Editor** (ícone </> no menu lateral)

### 2. Execute os scripts na ordem:

#### ✅ **PARTE 1** - Tabelas Principais
```
Arquivo: nfe_parte_1_tabelas.sql
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em "RUN" ou Ctrl+Enter
```

#### ✅ **PARTE 2** - Tabelas Relacionadas  
```
Arquivo: nfe_parte_2_relacionadas.sql
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em "RUN" ou Ctrl+Enter
```

#### ✅ **PARTE 3** - Índices
```
Arquivo: nfe_parte_3_indices.sql
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em "RUN" ou Ctrl+Enter
```

#### ✅ **PARTE 4** - View Consolidada
```
Arquivo: nfe_parte_4_view.sql
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em "RUN" ou Ctrl+Enter
```

#### ✅ **PARTE 5** - Funções e Triggers
```
Arquivo: nfe_parte_5_funcoes.sql
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em "RUN" ou Ctrl+Enter
```

#### ✅ **PARTE 6** - Teste (Opcional)
```
Arquivo: nfe_parte_6_rls_teste.sql
- Execute apenas a parte de TESTE BÁSICO
- As políticas RLS ficam comentadas (use só se necessário)
```

## 🧪 Verificação Final

Após executar todas as partes, teste se está funcionando:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'nfe_%';

-- 2. Testar função de número
SELECT gerar_proximo_numero_nfe();

-- 3. Verificar view
SELECT * FROM vw_nfe_consolidado LIMIT 1;
```

## ✅ Resultado Esperado

Se tudo funcionou, você deve ver:
- ✅ 4 tabelas criadas: `nfe_emissoes`, `nfe_itens`, `nfe_vinculacoes`, `nfe_transmissoes`
- ✅ 1 view criada: `vw_nfe_consolidado`
- ✅ Função `gerar_proximo_numero_nfe()` funcionando
- ✅ Trigger de `updated_at` ativo

## 🚨 Se der erro:

1. **Erro de permissão**: Execute um script por vez
2. **Erro de referência**: Execute na ordem correta (1→2→3→4→5)
3. **Erro de sintaxe**: Verifique se copiou o código completo
4. **Tabela já existe**: Normal, pode ignorar se usar `IF NOT EXISTS`

## 🔄 Para refazer (se necessário):

```sql
-- Limpar tudo (CUIDADO: apaga dados!)
DROP VIEW IF EXISTS vw_nfe_consolidado CASCADE;
DROP TABLE IF EXISTS nfe_transmissoes CASCADE;
DROP TABLE IF EXISTS nfe_vinculacoes CASCADE;
DROP TABLE IF EXISTS nfe_itens CASCADE;
DROP TABLE IF EXISTS nfe_emissoes CASCADE;
DROP FUNCTION IF EXISTS gerar_proximo_numero_nfe CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## 📞 Focus NFe Token Configurado
✅ Token: `pJgBFl5J8taKrbaUmVRfxgAf3S1QhYjT`
✅ Ambiente: Homologação
✅ Serviço: `src/services/focusNFeService.ts` criado
