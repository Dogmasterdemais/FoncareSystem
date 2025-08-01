-- SOLUÇÃO RÁPIDA: Corrigir agendamentos sem profissional
-- Execute no Supabase SQL Editor

-- 1. Remover constraint que impede sessões compartilhadas
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_profissional_horario CASCADE;

-- 2. PRIMEIRO: Limpar registros inválidos em profissionais_salas
DELETE FROM profissionais_salas 
WHERE profissional_id NOT IN (
    SELECT id FROM profissionais WHERE id IS NOT NULL
);

SELECT 'Registros inválidos removidos de profissionais_salas' as limpeza;

-- 2. Verificar agendamentos sem profissional hoje
SELECT 
    'AGENDAMENTOS SEM PROFISSIONAL HOJE:' as info;

SELECT 
    a.id,
    p.nome as paciente,
    s.nome as sala,
    s.numero as sala_numero,
    a.horario_inicio,
    a.status
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
WHERE a.data_agendamento = CURRENT_DATE
    AND a.profissional_id IS NULL
ORDER BY s.numero, a.horario_inicio;

-- 3. Ver profissionais alocados nas salas
SELECT 
    'PROFISSIONAIS ALOCADOS NAS SALAS:' as info;

SELECT 
    s.numero as sala_numero,
    s.nome as sala_nome,
    prof.nome as profissional,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo
FROM profissionais_salas ps
JOIN salas s ON s.id = ps.sala_id
JOIN profissionais prof ON prof.id = ps.profissional_id
WHERE ps.ativo = true
    AND ps.data_inicio <= CURRENT_DATE
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
ORDER BY s.numero;

-- 4. Atualizar agendamentos de hoje especificamente (versão segura)
UPDATE agendamentos 
SET profissional_id = (
    SELECT ps.profissional_id
    FROM profissionais_salas ps
    JOIN profissionais prof ON prof.id = ps.profissional_id -- Garantir que profissional existe
    WHERE ps.sala_id = agendamentos.sala_id
        AND ps.ativo = true
        AND ps.data_inicio <= agendamentos.data_agendamento
        AND (ps.data_fim IS NULL OR ps.data_fim >= agendamentos.data_agendamento)
        AND prof.ativo = true -- Garantir que profissional está ativo
    LIMIT 1
)
WHERE data_agendamento = CURRENT_DATE
    AND profissional_id IS NULL
    AND EXISTS (
        SELECT 1 
        FROM profissionais_salas ps2
        JOIN profissionais prof2 ON prof2.id = ps2.profissional_id
        WHERE ps2.sala_id = agendamentos.sala_id
            AND ps2.ativo = true
            AND ps2.data_inicio <= agendamentos.data_agendamento
            AND (ps2.data_fim IS NULL OR ps2.data_fim >= agendamentos.data_agendamento)
            AND prof2.ativo = true
    );

-- 5. Verificar resultado
SELECT 
    'RESULTADO APÓS CORREÇÃO:' as info;

SELECT 
    a.id,
    p.nome as paciente,
    s.nome as sala,
    s.numero as sala_numero,
    prof.nome as profissional,
    a.horario_inicio,
    a.status
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof ON prof.id = a.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY s.numero, a.horario_inicio;

SELECT 'CORREÇÃO CONCLUÍDA!' as resultado;
