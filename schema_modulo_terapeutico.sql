-- Schema completo para Módulo Terapêutico Avança-- 4. Tabela para evoluções dos atendimentos
CREATE TABLE IF NOT EXISTS evolucoes_atendimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_real_id UUID REFERENCES atendimentos_reais(id),
    profissional_id UUID REFERENCES colaboradores(id),
    evolucao TEXT NOT NULL,
    objetivos TEXT,
    observacoes TEXT,
    proximo_atendimento TEXT,
    data_evolucao TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);24/07/2025

-- 1. Atualização da tabela salas com campos necessários
ALTER TABLE salas ADD COLUMN IF NOT EXISTS cor VARCHAR(7); -- Código hex da cor
ALTER TABLE salas ADD COLUMN IF NOT EXISTS capacidade_criancas INTEGER DEFAULT 6;
ALTER TABLE salas ADD COLUMN IF NOT EXISTS capacidade_profissionais INTEGER DEFAULT 3;
ALTER TABLE salas ADD COLUMN IF NOT EXISTS especialidades JSONB; -- Array de especialidades

-- 2. Tabela para alocação de profissionais em salas
CREATE TABLE IF NOT EXISTS profissionais_salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES colaboradores(id),
    sala_id UUID REFERENCES salas(id),
    turno VARCHAR(20), -- 'manha', 'tarde', 'noite'
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela para registro de atendimentos reais
CREATE TABLE IF NOT EXISTS atendimentos_reais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID REFERENCES agendamentos(id),
    profissional_id UUID REFERENCES colaboradores(id),
    sala_id UUID REFERENCES salas(id),
    paciente_id UUID REFERENCES pacientes(id),
    especialidade_id UUID REFERENCES especialidades(id),
    horario_inicio TIMESTAMPTZ,
    horario_fim TIMESTAMPTZ,
    duracao_minutos INTEGER,
    periodo_1_inicio TIMESTAMPTZ, -- Para sessões divididas
    periodo_1_fim TIMESTAMPTZ,
    periodo_2_inicio TIMESTAMPTZ,
    periodo_2_fim TIMESTAMPTZ,
    valor_sessao DECIMAL(10,2),
    percentual_pagamento INTEGER DEFAULT 100, -- 100%, 50% ou 0%
    evolucao_feita BOOLEAN DEFAULT false,
    pagamento_liberado BOOLEAN DEFAULT false,
    supervisionado BOOLEAN DEFAULT false,
    supervisionado_por UUID REFERENCES colaboradores(id),
    data_supervisao TIMESTAMPTZ,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela para evoluções dos atendimentos
CREATE TABLE IF NOT EXISTS evolucoes_atendimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_real_id UUID REFERENCES atendimentos_reais(id),
    profissional_id UUID REFERENCES profissionais(id),
    evolucao TEXT NOT NULL,
    objetivos TEXT,
    observacoes TEXT,
    proximo_atendimento TEXT,
    data_evolucao TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela para ocorrências da recepção
CREATE TABLE IF NOT EXISTS ocorrencias_recepcao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID REFERENCES agendamentos(id),
    paciente_id UUID REFERENCES pacientes(id),
    tipo_ocorrencia VARCHAR(50), -- 'atraso', 'falha_convenio', 'ausencia_guia', 'falta'
    descricao TEXT,
    minutos_atraso INTEGER,
    desconto_aplicado DECIMAL(5,2), -- Percentual de desconto
    valor_desconto DECIMAL(10,2),
    responsavel_registro UUID REFERENCES colaboradores(id),
    data_ocorrencia TIMESTAMPTZ DEFAULT NOW(),
    resolvido BOOLEAN DEFAULT false,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela para alertas de ocupação
CREATE TABLE IF NOT EXISTS alertas_ocupacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID REFERENCES salas(id),
    data_alerta DATE,
    turno VARCHAR(20),
    ocupacao_criancas INTEGER,
    ocupacao_profissionais INTEGER,
    percentual_ocupacao DECIMAL(5,2),
    alerta_enviado BOOLEAN DEFAULT false,
    destinatarios JSONB, -- Array de emails
    data_envio TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Atualização da tabela especialidades com cores (adiciona coluna se não existir)
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS cor VARCHAR(7);

UPDATE especialidades SET cor = CASE 
    WHEN LOWER(nome) LIKE '%fonoaudiologia%' THEN '#0052CC'
    WHEN LOWER(nome) LIKE '%terapia ocupacional%' THEN '#00E6F6'
    WHEN LOWER(nome) LIKE '%psicologia%' THEN '#38712F'
    WHEN LOWER(nome) LIKE '%psicopedagogia%' OR LOWER(nome) LIKE '%neuropsicopedagogia%' THEN '#D20000'
    WHEN LOWER(nome) LIKE '%educador físico%' THEN '#B45A00'
    WHEN LOWER(nome) LIKE '%psicomotricidade%' THEN '#F58B00'
    WHEN LOWER(nome) LIKE '%musicoterapia%' OR LOWER(nome) LIKE '%ludoterapia%' OR LOWER(nome) LIKE '%arterapia%' THEN '#F5C344'
    WHEN LOWER(nome) LIKE '%fisioterapia%' THEN '#C47B9C'
    ELSE '#6B7280'
END WHERE cor IS NULL;

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profissionais_salas_ativo ON profissionais_salas(ativo, data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_data ON atendimentos_reais(DATE(horario_inicio));
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_profissional ON atendimentos_reais(profissional_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_atendimento_data ON evolucoes_atendimento(DATE(data_evolucao));
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias_recepcao(DATE(data_ocorrencia));
CREATE INDEX IF NOT EXISTS idx_alertas_ocupacao_data ON alertas_ocupacao(data_alerta, sala_id);

-- 9. Views para relatórios
CREATE OR REPLACE VIEW vw_ocupacao_salas AS
SELECT 
    s.id as sala_id,
    s.nome as sala_nome,
    s.cor as sala_cor,
    s.capacidade_criancas,
    s.capacidade_profissionais,
    DATE(a.data_agendamento) as data,
    EXTRACT(HOUR FROM a.horario_inicio) as hora,
    COUNT(DISTINCT a.paciente_id) as criancas_agendadas,
    COUNT(DISTINCT ps.profissional_id) as profissionais_alocados,
    ROUND(
        (COUNT(DISTINCT a.paciente_id)::DECIMAL / s.capacidade_criancas * 100), 2
    ) as percentual_ocupacao_criancas,
    ROUND(
        (COUNT(DISTINCT ps.profissional_id)::DECIMAL / s.capacidade_profissionais * 100), 2
    ) as percentual_ocupacao_profissionais
FROM salas s
LEFT JOIN agendamentos a ON s.id = a.sala_id
LEFT JOIN profissionais_salas ps ON s.id = ps.sala_id 
    AND ps.ativo = true 
    AND DATE(a.data_agendamento) BETWEEN ps.data_inicio AND COALESCE(ps.data_fim, CURRENT_DATE)
GROUP BY s.id, s.nome, s.cor, s.capacidade_criancas, s.capacidade_profissionais, 
         DATE(a.data_agendamento), EXTRACT(HOUR FROM a.horario_inicio);

CREATE OR REPLACE VIEW vw_pagamentos_por_evolucao AS
SELECT 
    ar.id,
    ar.agendamento_id,
    p.nome as paciente_nome,
    prof.nome as profissional_nome,
    e.nome as especialidade_nome,
    s.nome as sala_nome,
    ar.horario_inicio,
    ar.horario_fim,
    ar.duracao_minutos,
    ar.valor_sessao,
    ar.percentual_pagamento,
    ar.evolucao_feita,
    ar.pagamento_liberado,
    ar.supervisionado,
    CASE 
        WHEN ar.evolucao_feita AND ar.supervisionado THEN ar.valor_sessao * (ar.percentual_pagamento / 100.0)
        WHEN ar.evolucao_feita AND NOT ar.supervisionado THEN ar.valor_sessao * 0.5
        ELSE 0
    END as valor_a_pagar
FROM atendimentos_reais ar
JOIN pacientes p ON ar.paciente_id = p.id
JOIN colaboradores prof ON ar.profissional_id = prof.id
JOIN especialidades e ON ar.especialidade_id = e.id
JOIN salas s ON ar.sala_id = s.id;
