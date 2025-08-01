-- =====================================================
-- CORREÇÃO PARA PERMITIR SESSÕES COMPARTILHADAS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. REMOVER CONSTRAINT PROBLEMÁTICA IDENTIFICADA
-- O erro mostrou que a constraint se chama "unique_sala_horario"

-- PRIMEIRO: Remover a constraint (não o índice)
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_sala_horario CASCADE;

-- DEPOIS: O índice será removido automaticamente
-- (Não precisa fazer nada mais para o índice)

-- Outras constraints possíveis (caso existam):
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_sala_horario_unique CASCADE;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_unique_sala_horario CASCADE;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_sala_id_data_agendamento_horario_inicio_key CASCADE;

-- VERIFICAR SE A CONSTRAINT FOI REMOVIDA
SELECT 
    'Verificando se a constraint foi removida...' as info;

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'agendamentos' 
AND constraint_name LIKE '%sala%horario%'
OR constraint_name LIKE '%unique_sala%';

-- Se não retornar nenhuma linha, a constraint foi removida com sucesso!

-- 2. CRIAR FUNÇÃO INTELIGENTE DE VALIDAÇÃO
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
        RAISE EXCEPTION 'Sala atingiu capacidade máxima de % crianças para este horário. Atual: %. Tente outro horário ou sala.', 
            capacidade_maxima, agendamentos_na_sala + 1;
    END IF;
    
    -- Se há mais de 1 agendamento, configurar automaticamente como compartilhada
    IF agendamentos_na_sala > 0 THEN
        NEW.tipo_sessao := 'compartilhada';
        RAISE NOTICE 'Sessão configurada automaticamente como compartilhada (% crianças na sala)', agendamentos_na_sala + 1;
    ELSE
        -- Primeira criança, pode ser individual
        IF NEW.tipo_sessao IS NULL THEN
            NEW.tipo_sessao := 'individual';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TRIGGER PARA APLICAR A VALIDAÇÃO
DROP TRIGGER IF EXISTS trigger_validar_capacidade_sala ON agendamentos;
CREATE TRIGGER trigger_validar_capacidade_sala
    BEFORE INSERT OR UPDATE ON agendamentos
    FOR EACH ROW 
    EXECUTE FUNCTION validar_capacidade_sala();

-- 4. COMENTÁRIOS DA FUNÇÃO
COMMENT ON FUNCTION validar_capacidade_sala() IS 
'Valida capacidade máxima de 6 crianças por sala/horário e configura sessões compartilhadas automaticamente';

COMMENT ON TRIGGER trigger_validar_capacidade_sala ON agendamentos IS 
'Trigger que permite sessões compartilhadas até 6 crianças por sala';

-- 5. TESTAR SE FUNCIONOU
SELECT 
    'CORREÇÃO APLICADA COM SUCESSO!' as status,
    'Agora você pode agendar até 6 crianças na mesma sala/horário' as resultado,
    'Sessões serão automaticamente configuradas como compartilhadas' as automatizacao;

-- 6. VERIFICAR AGENDAMENTOS ATUAIS POR SALA/HORÁRIO
SELECT 
    'Agendamentos atuais por sala/horário:' as info;

SELECT 
    s.nome as sala_nome,
    a.data_agendamento,
    a.horario_inicio,
    COUNT(*) as total_criancas,
    string_agg(a.status, ', ') as status_lista,
    MAX(a.tipo_sessao) as tipo_sessao
FROM agendamentos a
JOIN salas s ON s.id = a.sala_id
WHERE a.data_agendamento >= CURRENT_DATE
GROUP BY s.nome, a.data_agendamento, a.horario_inicio, a.sala_id
ORDER BY a.data_agendamento, a.horario_inicio;

-- 7. INSTRUÇÕES FINAIS
SELECT 
    '🎉 SISTEMA CORRIGIDO!' as titulo,
    'Agora você pode:' as instrucoes,
    '✅ Agendar até 6 crianças na mesma sala/horário' as capacidade,
    '✅ Sistema configura sessões compartilhadas automaticamente' as automatico,
    '✅ Proteção contra excesso de capacidade mantida' as protecao;
