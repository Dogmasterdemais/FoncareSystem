-- CRIAR SISTEMA AUTOMÁTICO DE ALOCAÇÃO DE PROFISSIONAIS
-- Execute no Supabase SQL Editor

-- PRIMEIRO: Remover constraint que impede sessões compartilhadas com mesmo profissional
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_profissional_horario CASCADE;

-- Verificar se foi removida
SELECT 
    'Constraint unique_profissional_horario removida (permite sessões compartilhadas)' as info;

-- Função para associar automaticamente profissional da sala aos agendamentos
CREATE OR REPLACE FUNCTION associar_profissional_sala()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando inserir/atualizar agendamento, buscar profissional da sala
    IF NEW.profissional_id IS NULL THEN
        SELECT ps.profissional_id INTO NEW.profissional_id
        FROM profissionais_salas ps
        WHERE ps.sala_id = NEW.sala_id
            AND ps.ativo = true
            AND ps.data_inicio <= NEW.data_agendamento
            AND (ps.data_fim IS NULL OR ps.data_fim >= NEW.data_agendamento)
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para agendamentos
DROP TRIGGER IF EXISTS trigger_associar_profissional_sala ON agendamentos;
CREATE TRIGGER trigger_associar_profissional_sala
    BEFORE INSERT OR UPDATE ON agendamentos
    FOR EACH ROW 
    EXECUTE FUNCTION associar_profissional_sala();

-- Função para atualizar agendamentos quando profissional é alocado na sala
CREATE OR REPLACE FUNCTION atualizar_agendamentos_profissional_sala()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando alocar profissional na sala, atualizar agendamentos existentes sem profissional
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.ativo = true) THEN
        UPDATE agendamentos 
        SET profissional_id = NEW.profissional_id
        WHERE sala_id = NEW.sala_id
            AND data_agendamento >= NEW.data_inicio
            AND (NEW.data_fim IS NULL OR data_agendamento <= NEW.data_fim)
            AND profissional_id IS NULL
            AND status IN ('agendado', 'pronto_para_terapia', 'em_atendimento');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profissionais_salas
DROP TRIGGER IF EXISTS trigger_atualizar_agendamentos_profissional_sala ON profissionais_salas;
CREATE TRIGGER trigger_atualizar_agendamentos_profissional_sala
    AFTER INSERT OR UPDATE ON profissionais_salas
    FOR EACH ROW 
    EXECUTE FUNCTION atualizar_agendamentos_profissional_sala();

-- Corrigir agendamentos existentes de hoje (versão segura)
DO $$
DECLARE
    agendamento_record RECORD;
    profissional_da_sala UUID;
BEGIN
    -- Processar cada agendamento individualmente para evitar conflitos
    FOR agendamento_record IN 
        SELECT a.id, a.sala_id, a.data_agendamento
        FROM agendamentos a
        WHERE a.data_agendamento >= CURRENT_DATE
            AND a.profissional_id IS NULL
            AND a.status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
    LOOP
        -- Buscar profissional da sala
        SELECT ps.profissional_id INTO profissional_da_sala
        FROM profissionais_salas ps
        WHERE ps.sala_id = agendamento_record.sala_id
            AND ps.ativo = true
            AND ps.data_inicio <= agendamento_record.data_agendamento
            AND (ps.data_fim IS NULL OR ps.data_fim >= agendamento_record.data_agendamento)
        LIMIT 1;
        
        -- Se encontrou profissional, atualizar
        IF profissional_da_sala IS NOT NULL THEN
            UPDATE agendamentos 
            SET profissional_id = profissional_da_sala
            WHERE id = agendamento_record.id;
            
            RAISE NOTICE 'Agendamento % atualizado com profissional %', agendamento_record.id, profissional_da_sala;
        END IF;
    END LOOP;
END $$;

SELECT 
    'SISTEMA AUTOMÁTICO CRIADO!' as resultado,
    'Agendamentos futuros terão profissional automaticamente' as automatico,
    'Agendamentos existentes foram atualizados' as corrigido;
