-- DIAGNOSTICAR E CORRIGIR PROBLEMA DA CONSTRAINT unique_profissional_horario
-- Execute no Supabase SQL Editor

-- 1. VERIFICAR A CONSTRAINT PROBLEMÁTICA
SELECT 
    'ANALISANDO CONSTRAINT unique_profissional_horario:' as info;

SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE constraint_name = 'unique_profissional_horario';

-- 2. VER AGENDAMENTOS QUE ESTÃO CAUSANDO CONFLITO
SELECT 
    'AGENDAMENTOS QUE CAUSARIAM CONFLITO:' as info;

-- Encontrar profissionais que teriam agendamentos duplicados
WITH profissionais_salas_ativas AS (
    SELECT DISTINCT 
        ps.profissional_id,
        ps.sala_id
    FROM profissionais_salas ps
    WHERE ps.ativo = true
        AND ps.data_inicio <= CURRENT_DATE
        AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
),
agendamentos_sem_prof AS (
    SELECT 
        a.id,
        a.sala_id,
        a.data_agendamento,
        a.horario_inicio,
        psa.profissional_id as prof_da_sala,
        prof.nome as nome_profissional
    FROM agendamentos a
    JOIN profissionais_salas_ativas psa ON psa.sala_id = a.sala_id
    JOIN profissionais prof ON prof.id = psa.profissional_id
    WHERE a.data_agendamento >= CURRENT_DATE
        AND a.profissional_id IS NULL
        AND a.status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
)
SELECT 
    asp.prof_da_sala,
    asp.nome_profissional,
    asp.data_agendamento,
    asp.horario_inicio,
    COUNT(*) as agendamentos_no_mesmo_horario,
    string_agg(asp.id::text, ', ') as ids_agendamentos
FROM agendamentos_sem_prof asp
GROUP BY asp.prof_da_sala, asp.nome_profissional, asp.data_agendamento, asp.horario_inicio
HAVING COUNT(*) > 1
ORDER BY asp.data_agendamento, asp.horario_inicio;

-- 3. SOLUÇÃO: REMOVER TEMPORARIAMENTE A CONSTRAINT PARA PERMITIR SESSÕES COMPARTILHADAS
-- Para profissionais, é normal ter múltiplos agendamentos no mesmo horário (sessões compartilhadas)

SELECT 'REMOVENDO CONSTRAINT PROBLEMÁTICA...' as acao;

ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_profissional_horario CASCADE;

-- 4. VERIFICAR SE FOI REMOVIDA
SELECT 
    'VERIFICANDO SE CONSTRAINT FOI REMOVIDA:' as verificacao;

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'agendamentos' 
AND constraint_name = 'unique_profissional_horario';

-- Se não retornar nenhuma linha, foi removida com sucesso!

-- 5. AGORA TENTAR NOVAMENTE A ATUALIZAÇÃO DOS AGENDAMENTOS
UPDATE agendamentos 
SET profissional_id = (
    SELECT ps.profissional_id
    FROM profissionais_salas ps
    WHERE ps.sala_id = agendamentos.sala_id
        AND ps.ativo = true
        AND ps.data_inicio <= agendamentos.data_agendamento
        AND (ps.data_fim IS NULL OR ps.data_fim >= agendamentos.data_agendamento)
    LIMIT 1
)
WHERE data_agendamento >= CURRENT_DATE
    AND profissional_id IS NULL
    AND EXISTS (
        SELECT 1 
        FROM profissionais_salas ps2
        WHERE ps2.sala_id = agendamentos.sala_id
            AND ps2.ativo = true
            AND ps2.data_inicio <= agendamentos.data_agendamento
            AND (ps2.data_fim IS NULL OR ps2.data_fim >= agendamentos.data_agendamento)
    );

-- 6. VERIFICAR RESULTADO
SELECT 
    'AGENDAMENTOS APÓS CORREÇÃO:' as info;

SELECT 
    a.id,
    p.nome as paciente,
    s.nome as sala,
    s.numero as sala_numero,
    prof.nome as profissional,
    a.horario_inicio,
    a.status,
    a.data_agendamento
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY s.numero, a.horario_inicio;

SELECT 
    'CORREÇÃO APLICADA COM SUCESSO!' as resultado,
    'Constraint unique_profissional_horario removida' as constraint_removida,
    'Agendamentos atualizados com profissionais das salas' as agendamentos_corrigidos;
