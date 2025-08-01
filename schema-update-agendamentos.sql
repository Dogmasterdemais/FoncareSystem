-- =====================================
-- ATUALIZAÇÃO SCHEMA - MÓDULO TERAPÊUTICO
-- Data: 25/07/2025
-- =====================================

-- 1. ADICIONAR CAMPOS FALTANTES NA TABELA AGENDAMENTOS
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS duracao_real_minutos INTEGER,
ADD COLUMN IF NOT EXISTS evolucao_realizada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supervisionado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS liberado_pagamento BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS observacoes_supervisao TEXT;

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_agendamento ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_data ON agendamentos(profissional_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sala_data ON agendamentos(sala_id, data_agendamento);

-- 3. ATUALIZAR STATUS EXISTENTES PARA COMPATIBILIDADE
-- Mapear status legados para os novos status terapêuticos
UPDATE agendamentos 
SET status = CASE 
    WHEN status = 'compareceu' THEN 'chegou'
    WHEN status = 'confirmado' THEN 'agendado'
    ELSE status
END
WHERE status IN ('compareceu', 'confirmado');

-- 4. CRIAR VIEW DE COMPATIBILIDADE PARA O SERVIÇO
CREATE OR REPLACE VIEW vw_agendamentos_terapeuticos AS
SELECT 
    id,
    paciente_id,
    profissional_id,
    sala_id,
    especialidade_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    status as status_terapeutico,
    data_chegada as horario_chegada,
    data_inicio_atendimento as horario_inicio_real,
    data_fim_atendimento as horario_fim_real,
    duracao_real_minutos,
    evolucao_realizada,
    supervisionado,
    liberado_pagamento,
    observacoes_supervisao,
    created_at,
    updated_at
FROM agendamentos;

-- 5. CRIAR TABELAS PARA RECURSOS AVANÇADOS DO MÓDULO TERAPÊUTICO

-- Tabela para Evolução de Sessões
CREATE TABLE IF NOT EXISTS evolucoes_sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES colaboradores(id),
    data_evolucao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    conteudo_evolucao TEXT NOT NULL,
    objetivos_alcancados TEXT,
    observacoes_comportamentais TEXT,
    proximos_passos TEXT,
    materiais_utilizados JSONB DEFAULT '[]',
    tempo_atendimento INTEGER, -- em minutos
    qualidade_sessao INTEGER CHECK (qualidade_sessao >= 1 AND qualidade_sessao <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para Pagamentos de Sessões
CREATE TABLE IF NOT EXISTS pagamentos_sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES colaboradores(id),
    evolucao_id UUID REFERENCES evolucoes_sessoes(id),
    valor_base_hora DECIMAL(10,2) NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    percentual_pagamento INTEGER NOT NULL DEFAULT 100,
    valor_calculado DECIMAL(10,2) NOT NULL,
    aprovado_supervisao BOOLEAN DEFAULT FALSE,
    supervisor_id UUID REFERENCES colaboradores(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    observacoes_pagamento TEXT,
    incluido_folha BOOLEAN DEFAULT FALSE,
    mes_referencia DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para Ocorrências de Recepção
CREATE TABLE IF NOT EXISTS ocorrencias_recepcao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    tipo_ocorrencia VARCHAR(50) NOT NULL CHECK (
        tipo_ocorrencia IN ('atraso', 'falha_convenio', 'ausencia_guia', 'falta', 
                           'encerramento_antecipado', 'problema_comportamental', 'emergencia')
    ),
    descricao TEXT NOT NULL,
    minutos_atraso INTEGER,
    desconto_aplicado BOOLEAN DEFAULT FALSE,
    valor_desconto DECIMAL(10,2),
    responsavel_registro UUID REFERENCES colaboradores(id),
    data_ocorrencia TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolvido BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para Especialidades de Salas (se não existir)
CREATE TABLE IF NOT EXISTS sala_especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    especialidade_id UUID NOT NULL REFERENCES especialidades(id),
    is_principal BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sala_id, especialidade_id)
);

-- Tabela para Profissionais por Sala e Turno
CREATE TABLE IF NOT EXISTS profissionais_salas_turnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID NOT NULL REFERENCES colaboradores(id),
    sala_id UUID NOT NULL REFERENCES salas(id),
    turno VARCHAR(10) NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite')),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE DAS NOVAS TABELAS
CREATE INDEX IF NOT EXISTS idx_evolucoes_agendamento ON evolucoes_sessoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_profissional ON evolucoes_sessoes(profissional_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_data ON evolucoes_sessoes(data_evolucao);

CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamento ON pagamentos_sessoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_profissional ON pagamentos_sessoes(profissional_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mes ON pagamentos_sessoes(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_pagamentos_aprovado ON pagamentos_sessoes(aprovado_supervisao);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_agendamento ON ocorrencias_recepcao(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_paciente ON ocorrencias_recepcao(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias_recepcao(data_ocorrencia);

-- 7. FUNÇÃO PARA CALCULAR OCUPAÇÃO DE SALA
CREATE OR REPLACE FUNCTION calcular_ocupacao_sala(
    p_sala_id UUID,
    p_data DATE,
    p_horario TIME
) RETURNS JSONB AS $$
DECLARE
    v_capacidade_criancas INTEGER;
    v_capacidade_profissionais INTEGER := 3; -- padrão
    v_criancas_ocupadas INTEGER;
    v_profissionais_ocupados INTEGER;
    v_resultado JSONB;
BEGIN
    -- Buscar capacidade da sala
    SELECT capacidade_criancas INTO v_capacidade_criancas
    FROM salas WHERE id = p_sala_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Sala não encontrada"}'::jsonb;
    END IF;
    
    -- Contar agendamentos no horário
    SELECT 
        COUNT(*) as criancas,
        COUNT(DISTINCT profissional_id) as profissionais
    INTO v_criancas_ocupadas, v_profissionais_ocupados
    FROM agendamentos 
    WHERE sala_id = p_sala_id 
        AND data_agendamento = p_data
        AND horario_inicio <= p_horario 
        AND horario_fim > p_horario
        AND status IN ('agendado', 'chegou', 'pronto_para_terapia', 'em_atendimento');
    
    -- Montar resultado
    v_resultado := jsonb_build_object(
        'criancas_presentes', v_criancas_ocupadas,
        'profissionais_presentes', v_profissionais_ocupados,
        'capacidade_maxima_criancas', v_capacidade_criancas,
        'capacidade_maxima_profissionais', v_capacidade_profissionais,
        'percentual_criancas', ROUND((v_criancas_ocupadas::decimal / v_capacidade_criancas) * 100, 2),
        'percentual_profissionais', ROUND((v_profissionais_ocupados::decimal / v_capacidade_profissionais) * 100, 2),
        'alerta_capacidade', (v_criancas_ocupadas >= v_capacidade_criancas OR v_profissionais_ocupados >= v_capacidade_profissionais)
    );
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas que precisam
DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evolucoes_updated_at ON evolucoes_sessoes;
CREATE TRIGGER update_evolucoes_updated_at
    BEFORE UPDATE ON evolucoes_sessoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pagamentos_updated_at ON pagamentos_sessoes;
CREATE TRIGGER update_pagamentos_updated_at
    BEFORE UPDATE ON pagamentos_sessoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ocorrencias_updated_at ON ocorrencias_recepcao;
CREATE TRIGGER update_ocorrencias_updated_at
    BEFORE UPDATE ON ocorrencias_recepcao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERIR DADOS INICIAIS SE NECESSÁRIO
-- Atualizar campos boolean para registros existentes
UPDATE agendamentos 
SET 
    evolucao_realizada = FALSE,
    supervisionado = FALSE,
    liberado_pagamento = FALSE
WHERE evolucao_realizada IS NULL;

-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE evolucoes_sessoes IS 'Armazena as evoluções das sessões terapêuticas';
COMMENT ON TABLE pagamentos_sessoes IS 'Controla os pagamentos dos profissionais por sessão';
COMMENT ON TABLE ocorrencias_recepcao IS 'Registra ocorrências durante a recepção e atendimento';
COMMENT ON FUNCTION calcular_ocupacao_sala IS 'Calcula a ocupação atual de uma sala em tempo real';

-- =====================================
-- SCRIPT CONCLUÍDO COM SUCESSO!
-- =====================================
