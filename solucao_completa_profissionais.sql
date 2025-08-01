-- SOLUÇÃO COMPLETA: Verificar e corrigir alocação de profissionais
-- Execute no Supabase SQL Editor

-- 1. Remover constraint problemática
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_profissional_horario CASCADE;

-- 2. Limpar registros inválidos
DELETE FROM profissionais_salas 
WHERE profissional_id NOT IN (
    SELECT id FROM profissionais WHERE id IS NOT NULL
);

-- 3. Verificar situação atual
SELECT 
    '=== DIAGNÓSTICO COMPLETO ===' as titulo;

-- Agendamentos de hoje sem profissional
SELECT 
    'AGENDAMENTOS SEM PROFISSIONAL (SALA 08):' as info;

SELECT 
    a.id,
    p.nome as paciente,
    s.numero as sala,
    a.horario_inicio,
    a.status
FROM agendamentos a
JOIN pacientes p ON p.id = a.paciente_id
JOIN salas s ON s.id = a.sala_id
WHERE a.data_agendamento = CURRENT_DATE
    AND a.profissional_id IS NULL
    AND s.numero = '08'
ORDER BY a.horario_inicio;

-- Profissionais ativos disponíveis
SELECT 
    'PROFISSIONAIS ATIVOS DISPONÍVEIS:' as info;

SELECT 
    id,
    nome,
    especialidade_id
FROM profissionais 
WHERE ativo = true
ORDER BY nome;

-- Salas disponíveis
SELECT 
    'SALA 08 (onde estão os agendamentos):' as info;

SELECT 
    id,
    nome,
    numero
FROM salas 
WHERE numero = '08' OR nome ILIKE '%08%'
LIMIT 1;

-- 4. Se não há profissional alocado na Sala 08, vamos alocar um
-- (Substitua o ID do profissional por um válido da lista acima)

-- ATENÇÃO: Execute apenas se houver profissionais disponíveis!
-- Primeiro, veja os profissionais disponíveis acima, então descomente e execute:

/*
-- Exemplo: Alocar primeiro profissional ativo à Sala 08
INSERT INTO profissionais_salas (
    profissional_id,
    sala_id,
    turno,
    data_inicio,
    ativo
)
SELECT 
    prof.id,
    sala.id,
    'manha',
    CURRENT_DATE,
    true
FROM profissionais prof
CROSS JOIN salas sala
WHERE prof.ativo = true
    AND sala.numero = '08'
    AND NOT EXISTS (
        SELECT 1 FROM profissionais_salas ps 
        WHERE ps.sala_id = sala.id 
            AND ps.ativo = true
            AND ps.data_inicio <= CURRENT_DATE
            AND (ps.data_fim IS NULL OR ps.data_fim >= CURRENT_DATE)
    )
LIMIT 1;
*/

-- 5. Após alocar profissional, atualizar agendamentos
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

SELECT 
    'EXECUTE OS COMANDOS COMENTADOS ACIMA APÓS VERIFICAR OS DADOS!' as instrucao,
    'Primeiro veja os profissionais disponíveis, depois descomente e execute' as passo_a_passo;
