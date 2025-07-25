-- ============================================================
-- MÓDULO TERAPÊUTICO FONCARE - SCHEMA CORRIGIDO
-- Data: 24/07/2025
-- Versão: Final para produção
-- ============================================================

-- Extensões necessárias (pode já existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Atualização da tabela salas com campos necessários
ALTER TABLE salas ADD COLUMN IF NOT EXISTS cor VARCHAR(7); -- Código hex da cor
ALTER TABLE salas ADD COLUMN IF NOT EXISTS capacidade_criancas INTEGER DEFAULT 6;
ALTER TABLE salas ADD COLUMN IF NOT EXISTS capacidade_profissionais INTEGER DEFAULT 3;
ALTER TABLE salas ADD COLUMN IF NOT EXISTS especialidades JSONB; -- Array de especialidades

-- 2. Tabela para alocação de profissionais em salas
CREATE TABLE IF NOT EXISTS profissionais_salas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atendimento_real_id UUID REFERENCES atendimentos_reais(id),
    profissional_id UUID REFERENCES colaboradores(id),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. Tabela para configurações do módulo terapêutico
CREATE TABLE IF NOT EXISTS configuracoes_terapeuticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela para log de eventos do módulo terapêutico
CREATE TABLE IF NOT EXISTS log_eventos_terapeuticos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento VARCHAR(100) NOT NULL,
    entidade VARCHAR(50), -- 'agendamento', 'atendimento', 'evolucao', etc.
    entidade_id UUID,
    usuario_id UUID REFERENCES colaboradores(id),
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Atualização da tabela especialidades com cores (adiciona coluna se não existir)
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

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profissionais_salas_ativo ON profissionais_salas(ativo, data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_profissionais_salas_profissional ON profissionais_salas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_profissionais_salas_sala ON profissionais_salas(sala_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_horario ON atendimentos_reais(horario_inicio);
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_profissional ON atendimentos_reais(profissional_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_sala ON atendimentos_reais(sala_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_agendamento ON atendimentos_reais(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_evolucao ON atendimentos_reais(evolucao_feita);
CREATE INDEX IF NOT EXISTS idx_atendimentos_reais_pagamento ON atendimentos_reais(pagamento_liberado);

CREATE INDEX IF NOT EXISTS idx_evolucoes_atendimento_data ON evolucoes_atendimento(data_evolucao);
CREATE INDEX IF NOT EXISTS idx_evolucoes_atendimento_profissional ON evolucoes_atendimento(profissional_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_atendimento_real ON evolucoes_atendimento(atendimento_real_id);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias_recepcao(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_tipo ON ocorrencias_recepcao(tipo_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_resolvido ON ocorrencias_recepcao(resolvido);

CREATE INDEX IF NOT EXISTS idx_alertas_ocupacao_data ON alertas_ocupacao(data_alerta, sala_id);
CREATE INDEX IF NOT EXISTS idx_alertas_ocupacao_enviado ON alertas_ocupacao(alerta_enviado);

CREATE INDEX IF NOT EXISTS idx_log_eventos_data ON log_eventos_terapeuticos(created_at);
CREATE INDEX IF NOT EXISTS idx_log_eventos_entidade ON log_eventos_terapeuticos(entidade, entidade_id);

-- 11. Views para relatórios
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
        (COUNT(DISTINCT a.paciente_id)::DECIMAL / NULLIF(s.capacidade_criancas, 0) * 100), 2
    ) as percentual_ocupacao_criancas,
    ROUND(
        (COUNT(DISTINCT ps.profissional_id)::DECIMAL / NULLIF(s.capacidade_profissionais, 0) * 100), 2
    ) as percentual_ocupacao_profissionais
FROM salas s
LEFT JOIN agendamentos a ON s.id = a.sala_id
LEFT JOIN profissionais_salas ps ON s.id = ps.sala_id 
    AND ps.ativo = true 
    AND (a.data_agendamento IS NULL OR DATE(a.data_agendamento) BETWEEN ps.data_inicio AND COALESCE(ps.data_fim, CURRENT_DATE))
GROUP BY s.id, s.nome, s.cor, s.capacidade_criancas, s.capacidade_profissionais, 
         DATE(a.data_agendamento), EXTRACT(HOUR FROM a.horario_inicio);

CREATE OR REPLACE VIEW vw_pagamentos_por_evolucao AS
SELECT 
    ar.id,
    ar.agendamento_id,
    p.nome as paciente_nome,
    prof.nome_completo as profissional_nome,
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

-- 12. View para relatórios terapêuticos
CREATE OR REPLACE VIEW vw_relatorio_terapeutico AS
SELECT 
    ar.id,
    DATE(ar.horario_inicio) as data,
    ar.profissional_id,
    prof.nome_completo as profissional_nome,
    ar.especialidade_id,
    e.nome as especialidade_nome,
    e.cor as especialidade_cor,
    ar.sala_id,
    s.nome as sala_nome,
    ar.paciente_id,
    p.nome as paciente_nome,
    ar.valor_sessao,
    ar.percentual_pagamento,
    ar.evolucao_feita,
    ar.supervisionado,
    ar.pagamento_liberado,
    ar.duracao_minutos,
    CASE 
        WHEN ar.evolucao_feita AND ar.supervisionado THEN ar.valor_sessao
        WHEN ar.evolucao_feita AND NOT ar.supervisionado THEN ar.valor_sessao * 0.5
        ELSE 0
    END as valor_a_pagar
FROM atendimentos_reais ar
JOIN colaboradores prof ON ar.profissional_id = prof.id
JOIN especialidades e ON ar.especialidade_id = e.id
JOIN salas s ON ar.sala_id = s.id
JOIN pacientes p ON ar.paciente_id = p.id;

-- 13. Inserir configurações padrão
INSERT INTO configuracoes_terapeuticas (chave, valor, tipo, descricao) VALUES
    ('capacidade_maxima_criancas_default', '6', 'number', 'Capacidade máxima padrão de crianças por sala'),
    ('capacidade_maxima_profissionais_default', '3', 'number', 'Capacidade máxima padrão de profissionais por sala'),
    ('percentual_pagamento_sem_evolucao', '0', 'number', 'Percentual de pagamento quando não há evolução'),
    ('percentual_pagamento_com_evolucao_sem_supervisao', '50', 'number', 'Percentual de pagamento com evolução mas sem supervisão'),
    ('percentual_pagamento_com_evolucao_supervisionada', '100', 'number', 'Percentual de pagamento com evolução supervisionada'),
    ('alerta_ocupacao_ativo', 'true', 'boolean', 'Se os alertas de ocupação estão ativos'),
    ('percentual_ocupacao_alerta', '85', 'number', 'Percentual de ocupação que dispara alerta'),
    ('cores_especialidades', '{"fonoaudiologia": "#0052CC", "psicologia": "#38712F", "terapia_ocupacional": "#00E6F6", "fisioterapia": "#C47B9C", "psicopedagogia": "#D20000", "educador_fisico": "#B45A00", "psicomotricidade": "#F58B00", "musicoterapia": "#F5C344", "default": "#6B7280"}', 'json', 'Configuração de cores por especialidade')
ON CONFLICT (chave) DO NOTHING;

-- 14. Triggers para auditoria (opcional)
CREATE OR REPLACE FUNCTION trigger_audit_terapeutico()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_eventos_terapeuticos (
        evento, 
        entidade, 
        entidade_id, 
        dados_anteriores, 
        dados_novos
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers nas tabelas principais
DROP TRIGGER IF EXISTS trigger_audit_atendimentos_reais ON atendimentos_reais;
CREATE TRIGGER trigger_audit_atendimentos_reais
    AFTER INSERT OR UPDATE OR DELETE ON atendimentos_reais
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_terapeutico();

DROP TRIGGER IF EXISTS trigger_audit_evolucoes_atendimento ON evolucoes_atendimento;
CREATE TRIGGER trigger_audit_evolucoes_atendimento
    AFTER INSERT OR UPDATE OR DELETE ON evolucoes_atendimento
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_terapeutico();

-- 15. Comentários nas tabelas para documentação
COMMENT ON TABLE profissionais_salas IS 'Alocação de profissionais em salas por turno e período';
COMMENT ON TABLE atendimentos_reais IS 'Registro real dos atendimentos realizados com controle de presença';
COMMENT ON TABLE evolucoes_atendimento IS 'Evoluções obrigatórias dos atendimentos para liberação de pagamentos';
COMMENT ON TABLE ocorrencias_recepcao IS 'Log de ocorrências e problemas registrados pela recepção';
COMMENT ON TABLE alertas_ocupacao IS 'Alertas automáticos quando salas atingem capacidade máxima';
COMMENT ON TABLE configuracoes_terapeuticas IS 'Configurações gerais do módulo terapêutico';
COMMENT ON TABLE log_eventos_terapeuticos IS 'Log de auditoria de todas as ações do módulo terapêutico';

-- ============================================================
-- FIM DO SCRIPT - MÓDULO TERAPÊUTICO FONCARE
-- ============================================================

-- Para verificar se tudo foi criado corretamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%terapeutic%' OR table_name IN ('profissionais_salas', 'atendimentos_reais', 'evolucoes_atendimento', 'ocorrencias_recepcao', 'alertas_ocupacao');
