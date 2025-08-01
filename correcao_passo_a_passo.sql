-- CORREÇÃO PASSO A PASSO - Execute uma seção por vez
-- Execute no Supabase SQL Editor

-- PASSO 1: Remover constraint problemática
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_profissional_horario CASCADE;
SELECT 'Constraint removida' as passo1;

-- PASSO 2: Limpar dados inconsistentes
DELETE FROM profissionais_salas 
WHERE profissional_id NOT IN (
    SELECT id FROM profissionais WHERE id IS NOT NULL
);
SELECT 'Dados inconsistentes removidos' as passo2;

-- PASSO 3: Verificar o que temos agora
SELECT 
    'SITUAÇÃO ATUAL:' as info,
    'Profissionais ativos:' as categoria,
    COUNT(*) as quantidade
FROM profissionais 
WHERE ativo = true;

SELECT 
    'Alocações válidas em salas:' as categoria,
    COUNT(*) as quantidade
FROM profissionais_salas ps
JOIN profissionais prof ON prof.id = ps.profissional_id
WHERE ps.ativo = true
    AND prof.ativo = true;

SELECT 
    'Agendamentos sem profissional hoje:' as categoria,
    COUNT(*) as quantidade
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE
    AND profissional_id IS NULL;

-- PASSO 4: Se tudo estiver OK, fazer a atualização
-- (Execute este UPDATE apenas se os números acima fizerem sentido)

/*
UPDATE agendamentos 
SET profissional_id = (
    SELECT ps.profissional_id
    FROM profissionais_salas ps
    JOIN profissionais prof ON prof.id = ps.profissional_id
    WHERE ps.sala_id = agendamentos.sala_id
        AND ps.ativo = true
        AND prof.ativo = true
        AND ps.data_inicio <= agendamentos.data_agendamento
        AND (ps.data_fim IS NULL OR ps.data_fim >= agendamentos.data_agendamento)
    LIMIT 1
)
WHERE data_agendamento = CURRENT_DATE
    AND profissional_id IS NULL;
*/

SELECT 'Execute o UPDATE acima se os números estiverem corretos' as passo4;
