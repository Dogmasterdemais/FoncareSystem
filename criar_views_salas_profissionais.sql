-- View completa para salas com profissionais alocados
-- Esta view será usada nas telas de agendamento e recepção

-- 1. Primeiro, criar view para salas com profissionais
CREATE OR REPLACE VIEW vw_salas_profissionais AS
SELECT 
    s.id as sala_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    s.capacidade_maxima,
    s.unidade_id,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    
    -- Dados dos profissionais alocados
    ps.id as profissional_sala_id,
    ps.turno,
    ps.data_inicio,
    ps.data_fim,
    ps.ativo as profissional_ativo,
    
    -- Dados do colaborador/profissional
    c.id as profissional_id,
    c.nome_completo as profissional_nome,
    c.cargo as profissional_especialidade,
    c.telefone_celular as profissional_telefone,
    c.regime_contratacao,
    c.status as profissional_status,
    
    -- Dados da especialidade (se houver)
    e.id as especialidade_id,
    e.nome as especialidade_nome,
    e.cor as especialidade_cor

FROM salas s
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN profissionais_salas ps ON s.id = ps.sala_id AND ps.ativo = true
LEFT JOIN colaboradores c ON ps.profissional_id = c.id AND c.status = 'ativo'
LEFT JOIN especialidades e ON s.especialidade_id = e.id
WHERE s.ativo = true
ORDER BY s.nome, c.nome_completo;

-- 2. Atualizar view de agendamentos completa
CREATE OR REPLACE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.paciente_id,
    a.profissional_id,
    a.sala_id,
    a.unidade_id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.observacoes,
    a.convenio_id,
    a.numero_guia,
    a.valor_procedimento,
    a.created_at,
    a.updated_at,
    
    -- Dados da sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    
    -- Dados do profissional principal (do agendamento)
    c_principal.nome_completo as profissional_nome,
    c_principal.cargo as profissional_especialidade,
    
    -- Dados da especialidade da sala
    e.nome as especialidade_nome,
    e.cor as especialidade_cor,
    
    -- Dados do paciente
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    p.data_nascimento as paciente_nascimento,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    
    -- Dados do convênio
    conv.nome as convenio_nome,
    
    -- Profissionais alocados na sala (lista)
    COALESCE(
        (SELECT STRING_AGG(c_sala.nome_completo, ', ' ORDER BY c_sala.nome_completo)
         FROM profissionais_salas ps_sala
         JOIN colaboradores c_sala ON ps_sala.profissional_id = c_sala.id
         WHERE ps_sala.sala_id = a.sala_id 
           AND ps_sala.ativo = true 
           AND c_sala.status = 'ativo'),
        'Nenhum profissional alocado'
    ) as profissionais_sala

FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN colaboradores c_principal ON a.profissional_id = c_principal.id
LEFT JOIN especialidades e ON s.especialidade_id = e.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN convenios conv ON a.convenio_id = conv.id
ORDER BY a.data_agendamento DESC, a.horario_inicio;

-- 3. View específica para seleção de salas em agendamentos
CREATE OR REPLACE VIEW vw_salas_para_agendamento AS
SELECT DISTINCT
    s.id as sala_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    s.unidade_id,
    u.nome as unidade_nome,
    
    -- Especialidade
    COALESCE(e.nome, 
             CASE s.tipo 
                 WHEN 'terapia' THEN 'Terapia'
                 WHEN 'consulta' THEN 'Consulta'
                 ELSE 'Não informado'
             END) as especialidade_nome,
    COALESCE(e.cor, s.cor, '#6B7280') as especialidade_cor,
    
    -- Capacidade e ocupação
    s.capacidade_maxima,
    COALESCE(ocupacao.total_profissionais, 0) as profissionais_alocados,
    (s.capacidade_maxima - COALESCE(ocupacao.total_profissionais, 0)) as vagas_disponiveis,
    
    -- Lista de profissionais disponíveis
    COALESCE(
        (SELECT STRING_AGG(c.nome_completo || ' (' || c.cargo || ')', ', ' ORDER BY c.nome_completo)
         FROM profissionais_salas ps
         JOIN colaboradores c ON ps.profissional_id = c.id
         WHERE ps.sala_id = s.id 
           AND ps.ativo = true 
           AND c.status = 'ativo'),
        'Nenhum profissional alocado'
    ) as profissionais_disponiveis

FROM salas s
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN especialidades e ON s.especialidade_id = e.id
LEFT JOIN (
    SELECT 
        ps.sala_id,
        COUNT(*) as total_profissionais
    FROM profissionais_salas ps
    JOIN colaboradores c ON ps.profissional_id = c.id
    WHERE ps.ativo = true AND c.status = 'ativo'
    GROUP BY ps.sala_id
) ocupacao ON s.id = ocupacao.sala_id
WHERE s.ativo = true
ORDER BY s.nome;

-- Comentários das views
COMMENT ON VIEW vw_salas_profissionais IS 'View que combina salas com seus profissionais alocados e informações relacionadas';
COMMENT ON VIEW vw_agendamentos_completo IS 'View completa dos agendamentos com informações de paciente, sala, unidade, convênio, especialidade, profissional e profissionais da sala';
COMMENT ON VIEW vw_salas_para_agendamento IS 'View específica para seleção de salas em agendamentos, mostrando profissionais disponíveis e capacidade';

-- Verificar criação das views
SELECT 'Views criadas com sucesso!' as resultado;
SELECT 'vw_salas_profissionais - Salas com profissionais alocados' as view1;
SELECT 'vw_agendamentos_completo - Agendamentos completos' as view2;
SELECT 'vw_salas_para_agendamento - Salas para agendamento' as view3;
