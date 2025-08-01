-- DIAGNOSTICAR PROBLEMA: Profissional inexistente
-- Execute no Supabase SQL Editor

-- 1. Encontrar o profissional problemático
SELECT 
    'PROFISSIONAL PROBLEMÁTICO IDENTIFICADO:' as info,
    '84013ec1-4502-4d25-bd24-2cb5835808db' as profissional_id_problematico;

-- 2. Verificar se este ID existe na tabela profissionais
SELECT 
    'VERIFICANDO SE PROFISSIONAL EXISTS:' as verificacao;

SELECT 
    id,
    nome,
    ativo
FROM profissionais 
WHERE id = '84013ec1-4502-4d25-bd24-2cb5835808db';

-- Se não retornar nada, o profissional não existe!

-- 3. Ver registros em profissionais_salas que referenciam este profissional inexistente
SELECT 
    'REGISTROS EM PROFISSIONAIS_SALAS COM PROFISSIONAL INEXISTENTE:' as info;

SELECT 
    ps.id,
    ps.profissional_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo
FROM profissionais_salas ps
JOIN salas s ON s.id = ps.sala_id
WHERE ps.profissional_id = '84013ec1-4502-4d25-bd24-2cb5835808db';

-- 4. Encontrar TODOS os profissionais inexistentes em profissionais_salas
SELECT 
    'TODOS OS PROFISSIONAIS INEXISTENTES EM PROFISSIONAIS_SALAS:' as info;

SELECT 
    ps.id as profissional_sala_id,
    ps.profissional_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    ps.data_inicio,
    ps.ativo
FROM profissionais_salas ps
JOIN salas s ON s.id = ps.sala_id
WHERE ps.profissional_id NOT IN (
    SELECT id FROM profissionais WHERE id IS NOT NULL
)
ORDER BY s.numero;

-- 5. Ver profissionais válidos que existem
SELECT 
    'PROFISSIONAIS VÁLIDOS DISPONÍVEIS:' as info;

SELECT 
    id,
    nome,
    especialidade_id,
    ativo
FROM profissionais 
WHERE ativo = true
ORDER BY nome;

-- 6. SOLUÇÃO: Remover registros inválidos de profissionais_salas
DELETE FROM profissionais_salas 
WHERE profissional_id NOT IN (
    SELECT id FROM profissionais WHERE id IS NOT NULL
);

-- 7. Verificar o que sobrou
SELECT 
    'PROFISSIONAIS_SALAS APÓS LIMPEZA:' as info;

SELECT 
    ps.id,
    prof.nome as profissional,
    s.nome as sala,
    s.numero as sala_numero,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo
FROM profissionais_salas ps
JOIN profissionais prof ON prof.id = ps.profissional_id
JOIN salas s ON s.id = ps.sala_id
WHERE ps.ativo = true
ORDER BY s.numero;

SELECT 
    'REGISTROS INVÁLIDOS REMOVIDOS!' as resultado,
    'Agora pode tentar novamente a correção dos agendamentos' as proxima_acao;
