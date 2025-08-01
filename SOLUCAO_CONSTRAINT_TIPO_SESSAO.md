## ✅ SOLUÇÃO PARA O ERRO DA CONSTRAINT tipo_sessao

### 🔧 **PASSO 1: Execute este SQL no Supabase SQL Editor**

```sql
-- 1. Corrigir valores inválidos existentes
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao IS NULL OR tipo_sessao NOT IN ('individual', 'compartilhada', 'tripla');

-- 2. Remover constraint conflitante (se existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'agendamentos'::regclass 
          AND conname LIKE '%tipo_sessao%'
    ) THEN
        ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_tipo_sessao_check;
        RAISE NOTICE '✅ Constraint existente removida';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Nenhuma constraint para remover ou erro: %', SQLERRM;
END $$;

-- 3. Criar nova constraint correta
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_tipo_sessao_check 
CHECK (tipo_sessao IN ('individual', 'compartilhada', 'tripla'));

-- 4. Verificar se funcionou
SELECT 'Constraint criada com sucesso!' as status, COUNT(*) as total_registros FROM agendamentos;
```

### 🎯 **PASSO 2: Verificar o resultado**

```sql
-- Verificar valores únicos em tipo_sessao
SELECT tipo_sessao, COUNT(*) as quantidade 
FROM agendamentos 
GROUP BY tipo_sessao 
ORDER BY tipo_sessao;
```

```sql
-- Testar inserção (deve funcionar agora)
INSERT INTO agendamentos (
    paciente_id,
    sala_id, 
    unidade_id,
    especialidade_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    tipo_sessao,
    status
) VALUES (
    (SELECT id FROM pacientes LIMIT 1),
    (SELECT id FROM salas LIMIT 1),
    (SELECT id FROM unidades LIMIT 1), 
    (SELECT id FROM especialidades LIMIT 1),
    CURRENT_DATE + 1,
    '09:00',
    '10:00',
    'individual',
    'agendado'
);
```

### ✅ **CORREÇÕES JÁ APLICADAS NO CÓDIGO:**

1. **Formulário de agendamento:** Agora usa `tipo_sessao: 'individual'` por padrão
2. **Criação de agendamentos:** Campo `tipo_sessao` sempre recebe valor válido
3. **Reset do formulário:** Mantém valor padrão correto

### 🚀 **APÓS EXECUTAR O SQL:**

Você poderá criar agendamentos normalmente! O erro da constraint `agendamentos_tipo_sessao_check` será resolvido.

---

**Valores aceitos pela constraint:**
- ✅ `'individual'` - Sessões com 1 profissional  
- ✅ `'compartilhada'` - Sessões com 2 profissionais (30min cada)
- ✅ `'tripla'` - Sessões com 3 profissionais (30min cada)

**Sistema automatizado usa estes valores para:**
- Controlar transições automáticas entre profissionais
- Calcular duração total das sessões  
- Gerenciar ocupação das salas
