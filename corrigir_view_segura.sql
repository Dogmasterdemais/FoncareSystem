-- 🔧 VERSÃO SEGURA: Corrigir VIEW vw_agendamentos_completo

SELECT '=== CORRIGINDO VIEW DE FORMA SEGURA ===' as titulo;

-- 1. Verificar colunas existentes nas tabelas
SELECT 
    'COLUNAS DA TABELA PACIENTES' as tipo,
    column_name
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
    AND table_schema = 'public'
ORDER BY column_name;

SELECT 
    'COLUNAS DA TABELA CONVENIOS' as tipo,
    column_name
FROM information_schema.columns 
WHERE table_name = 'convenios' 
    AND table_schema = 'public'
ORDER BY column_name;

-- 2. Dropar a view existente
DROP VIEW IF EXISTS vw_agendamentos_completo CASCADE;

-- 3. Recriar a view de forma mais conservadora
CREATE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.paciente_id,
    a.profissional_id,
    a.sala_id,
    a.unidade_id,
    a.convenio_id,  -- NOVA COLUNA: ID do convênio
    a.especialidade_id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.observacoes,
    a.created_at,
    a.updated_at,
    a.numero_agendamento,  -- NOVA COLUNA: Número do agendamento
    
    -- Dados da sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    
    -- Dados do paciente (apenas colunas que certamente existem)
    p.nome as paciente_nome,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    
    -- NOVOS DADOS: Convênio (apenas nome)
    c.nome as convenio_nome,
    
    -- NOVOS DADOS: Especialidade
    e.nome as especialidade_nome,
    
    -- NOVOS DADOS: Profissional
    prof.nome as profissional_nome
    
FROM agendamentos a
    LEFT JOIN salas s ON a.sala_id = s.id
    LEFT JOIN pacientes p ON a.paciente_id = p.id
    LEFT JOIN unidades u ON a.unidade_id = u.id
    LEFT JOIN convenios c ON a.convenio_id = c.id  -- NOVA JOIN: Convênios
    LEFT JOIN especialidades e ON a.especialidade_id = e.id  -- NOVA JOIN: Especialidades
    LEFT JOIN profissionais prof ON a.profissional_id = prof.id;  -- NOVA JOIN: Profissionais

-- 4. Verificar se a view foi criada corretamente
SELECT '✅ VIEW RECRIADA COM SUCESSO' as status;

-- 5. Testar a nova view com algumas linhas
SELECT 
    'TESTE DA NOVA VIEW' as tipo,
    id,
    paciente_nome,
    convenio_nome,
    especialidade_nome,
    numero_agendamento,
    data_agendamento
FROM vw_agendamentos_completo
ORDER BY created_at DESC
LIMIT 5;

-- 6. Verificar todas as colunas da nova view
SELECT 
    'TODAS AS COLUNAS DA VIEW' as tipo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vw_agendamentos_completo' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Estatísticas de convênio na view
SELECT 
    'ESTATÍSTICAS DE CONVÊNIO' as tipo,
    COUNT(*) as total_agendamentos,
    COUNT(convenio_id) as com_convenio_id,
    COUNT(convenio_nome) as com_convenio_nome,
    COUNT(*) - COUNT(convenio_id) as sem_convenio,
    COUNT(DISTINCT convenio_nome) as convenios_diferentes
FROM vw_agendamentos_completo;
