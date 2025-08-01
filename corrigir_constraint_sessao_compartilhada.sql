-- SCRIPT PARA CORRIGIR CONSTRAINT DE AGENDAMENTOS
-- PROBLEMA: Constraint impede sessões compartilhadas (até 6 crianças por sala)
-- SOLUÇÃO: Remover constraint restritiva e implementar validação inteligente

-- 1. IDENTIFICAR CONSTRAINTS ATUAIS
SELECT 
    'Constraints atuais na tabela agendamentos:' as info;

SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'agendamentos'::regclass
AND contype = 'u'; -- UNIQUE constraints

-- 2. IDENTIFICAR INDEXES ÚNICOS
SELECT 
    'Indexes únicos na tabela agendamentos:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'agendamentos' 
AND indexdef LIKE '%UNIQUE%';

-- 3. REMOVER CONSTRAINT PROBLEMÁTICA (ajustar nome conforme encontrado)
-- Tente cada uma das opções abaixo até encontrar a correta:

-- Opção A: Nome mais provável
DROP INDEX IF EXISTS unique_sala_horario;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_sala_horario;

-- Opção B: Variações possíveis do nome
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_sala_horario_unique;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_unique_sala_horario;
DROP INDEX IF EXISTS agendamentos_sala_horario_unique;
DROP INDEX IF EXISTS agendamentos_unique_sala_horario;

-- Opção C: Constraint baseada em múltiplas colunas
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_sala_id_data_agendamento_horario_inicio_key;
DROP INDEX IF EXISTS agendamentos_sala_id_data_agendamento_horario_inicio_key;

-- 4. CRIAR FUNÇÃO DE VALIDAÇÃO INTELIGENTE
CREATE OR REPLACE FUNCTION validar_capacidade_sala()
RETURNS TRIGGER AS $$
DECLARE
    agendamentos_na_sala INTEGER;
    capacidade_maxima INTEGER := 6; -- 6 crianças por sala
BEGIN
    -- Contar agendamentos ativos na mesma sala/horário
    SELECT COUNT(*) INTO agendamentos_na_sala
    FROM agendamentos 
    WHERE sala_id = NEW.sala_id 
    AND data_agendamento = NEW.data_agendamento
    AND horario_inicio = NEW.horario_inicio
    AND status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    -- Verificar se excede a capacidade
    IF agendamentos_na_sala >= capacidade_maxima THEN
        RAISE EXCEPTION 'Sala atingiu capacidade máxima de % crianças para este horário', capacidade_maxima;
    END IF;
    
    -- Se há mais de 1 agendamento, configurar como compartilhada
    IF agendamentos_na_sala > 0 THEN
        NEW.tipo_sessao := 'compartilhada';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER PARA VALIDAÇÃO
DROP TRIGGER IF EXISTS trigger_validar_capacidade_sala ON agendamentos;
CREATE TRIGGER trigger_validar_capacidade_sala
    BEFORE INSERT OR UPDATE ON agendamentos
    FOR EACH ROW 
    EXECUTE FUNCTION validar_capacidade_sala();

-- 6. TESTAR A NOVA CONFIGURAÇÃO
SELECT 'Nova configuração aplicada! Agora você pode ter até 6 crianças por sala/horário' as resultado;

-- 7. VERIFICAR SE FUNCIONOU
SELECT 
    'Teste: Conte quantos agendamentos existem por sala/horário' as info;

SELECT 
    sala_id,
    data_agendamento,
    horario_inicio,
    COUNT(*) as total_agendamentos,
    string_agg(status, ', ') as status_lista
FROM agendamentos 
WHERE data_agendamento >= CURRENT_DATE
GROUP BY sala_id, data_agendamento, horario_inicio
HAVING COUNT(*) > 1
ORDER BY total_agendamentos DESC;
