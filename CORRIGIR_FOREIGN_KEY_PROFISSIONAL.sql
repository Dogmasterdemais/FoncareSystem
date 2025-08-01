-- ============================================================
-- CORREÇÃO: FOREIGN KEY PROFISSIONAL_ID
-- Corrigir foreign key para apontar para colaboradores em vez de profissionais
-- ============================================================

-- 1. VERIFICAR FOREIGN KEY ATUAL
SELECT 
    'FOREIGN KEY ATUAL' as status,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'agendamentos' 
  AND conname = 'agendamentos_profissional_id_fkey';

-- 2. REMOVER FOREIGN KEY INCORRETA
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_fkey;

-- 3. CRIAR NOVA FOREIGN KEY CORRETA (apontando para colaboradores)
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_profissional_id_fkey 
FOREIGN KEY (profissional_id) REFERENCES colaboradores(id);

-- 4. VERIFICAR SE FOI CRIADA CORRETAMENTE
SELECT 
    'FOREIGN KEY CORRIGIDA' as status,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'agendamentos' 
  AND conname = 'agendamentos_profissional_id_fkey';

-- 5. VERIFICAR SE EXISTEM DADOS NAS TABELAS
SELECT 'DADOS DISPONÍVEIS' as info,
       (SELECT COUNT(*) FROM colaboradores) as colaboradores_count,
       (SELECT COUNT(*) FROM pacientes) as pacientes_count,
       (SELECT COUNT(*) FROM salas) as salas_count,
       (SELECT COUNT(*) FROM unidades) as unidades_count;

-- 6. VERIFICAR SALAS DE TERAPIA
SELECT 'SALAS DE TERAPIA' as info,
       nome,
       eh_sala_terapia_90min(nome) as eh_terapia
FROM salas 
WHERE eh_sala_terapia_90min(nome) = true
LIMIT 5;

-- 7. MENSAGEM DE SUCESSO
SELECT '✅ Foreign key corrigida - agora aponta para colaboradores' as resultado
UNION ALL
SELECT '✅ Sistema pronto para testar segmentos de 30 minutos' as resultado;

-- ============================================================
-- SCRIPT CONCLUÍDO
-- Agora o teste deve funcionar corretamente
-- ============================================================
