-- VERIFICAR SISTEMA DE ALOCAÇÃO DE PROFISSIONAIS
-- Execute no Supabase SQL Editor

-- 1. Ver tabela profissionais_salas (alocação de profissionais)
SELECT 
    'PROFISSIONAIS ALOCADOS EM SALAS HOJE:' as info;

SELECT 
    ps.id,
    prof.nome as profissional,
    s.nome as sala,
    s.numero as sala_numero,
    ps.turno,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo
FROM profissionais_salas ps
JOIN profissionais prof ON prof.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id
WHERE ps.data_inicio <= CURRENT_DATE 
    AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
    AND ps.ativo = true
ORDER BY s.numero, prof.nome;

-- 2. Ver agendamentos vs profissionais alocados
SELECT 
    'AGENDAMENTOS vs PROFISSIONAIS ALOCADOS:' as info;

SELECT 
    a.id as agendamento_id,
    p.nome as paciente,
    s.nome as sala,
    s.numero as sala_numero,
    a.horario_inicio,
    a.profissional_id as prof_agendamento,
    prof_ag.nome as prof_agendamento_nome,
    ps.profissional_id as prof_sala,
    prof_sala.nome as prof_sala_nome
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
LEFT JOIN profissionais prof_ag ON prof_ag.id = a.profissional_id
LEFT JOIN profissionais_salas ps ON (ps.sala_id = s.id AND ps.ativo = true 
    AND ps.data_inicio <= a.data_agendamento 
    AND (ps.data_fim IS NULL OR ps.data_fim >= a.data_agendamento))
LEFT JOIN profissionais prof_sala ON prof_sala.id = ps.profissional_id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY s.numero, a.horario_inicio;

-- 3. IMPORTANTE: Verificar se precisamos atualizar os agendamentos com o profissional da sala
-- Isso deve ser automático quando há um profissional alocado na sala

-- Atualizar agendamentos sem profissional, mas que têm profissional alocado na sala
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
WHERE data_agendamento = CURRENT_DATE
    AND profissional_id IS NULL
    AND EXISTS (
        SELECT 1 
        FROM profissionais_salas ps2
        WHERE ps2.sala_id = agendamentos.sala_id
            AND ps2.ativo = true
            AND ps2.data_inicio <= agendamentos.data_agendamento
            AND (ps2.data_fim IS NULL OR ps2.data_fim >= agendamentos.data_agendamento)
    );

SELECT 
    'AGENDAMENTOS ATUALIZADOS!' as resultado,
    'Verificando novamente...' as proxima_acao;
