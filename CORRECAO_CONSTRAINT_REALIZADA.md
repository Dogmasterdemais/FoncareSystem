# 🔧 CORREÇÃO: CONSTRAINT TIPO_SESSAO

## ❌ PROBLEMA IDENTIFICADO
A constraint `agendamentos_tipo_sessao_check` estava limitando os valores a:
- `'individual'`, `'compartilhada'`, `'tripla'`

Mas o sistema precisa aceitar:
- `'Terapia'`, `'Anamnese'`, `'Neuropsicologia'`

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. **Execute a Correção da Constraint**
No Supabase SQL Editor, execute:
```sql
-- Copie e cole todo o conteúdo do arquivo:
CORRIGIR_CONSTRAINT_TIPO_SESSAO_SEGMENTOS.sql
```

### 2. **Execute o Teste Corrigido**
No Supabase SQL Editor, execute:
```sql
-- Copie e cole todo o conteúdo do arquivo:
TESTAR_SEGMENTOS_30_MINUTOS.sql
```

## 🎯 O QUE A CORREÇÃO FAZ

### ✅ **Atualiza Constraint**
```sql
-- ANTES (limitado):
CHECK (tipo_sessao IN ('individual', 'compartilhada', 'tripla'))

-- DEPOIS (completo):
CHECK (tipo_sessao IN ('Terapia', 'Anamnese', 'Neuropsicologia', 'individual', 'compartilhada', 'tripla'))
```

### ✅ **Atualiza Dados Existentes**
- Converte agendamentos existentes de `'individual'` → `'Terapia'`
- Mantém compatibilidade com valores antigos
- Permite novos valores corretos

### ✅ **Valida Sistema**
- Testa criação automática de 3 segmentos
- Verifica valores e horários corretos
- Confirma funcionamento completo

## 📊 RESULTADO ESPERADO

### Após executar a correção:
```
✅ Constraint atualizada para aceitar: Terapia, Anamnese, Neuropsicologia
✅ Agendamentos existentes atualizados para "Terapia"
```

### Após executar o teste:
```
=== TESTE DO SISTEMA DE SEGMENTOS ===
Agendamento teste criado: [uuid]
Segmentos criados automaticamente: 3
✅ SISTEMA FUNCIONANDO CORRETAMENTE!

Detalhes dos segmentos:
Segmento 1: 14:00:00 - R$ 100.00
Segmento 2: 14:30:00 - R$ 100.00  
Segmento 3: 15:00:00 - R$ 100.00

Agendamento teste removido.
```

## 🚀 PRÓXIMOS PASSOS

1. **Execute a correção da constraint**
2. **Execute o teste de validação** 
3. **Verifique que está funcionando:**
   ```sql
   SELECT * FROM vw_segmentos_agendamentos LIMIT 5;
   ```

O sistema estará **100% funcional** para criar automaticamente 3 segmentos de 30 minutos para cada agendamento de "Terapia"! 🎯
