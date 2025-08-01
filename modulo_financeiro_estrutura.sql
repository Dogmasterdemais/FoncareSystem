-- =================================================
-- MÓDULO FINANCEIRO - ESTRUTURA DE TABELAS
-- =================================================

-- Tabela para Contas a Pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    fornecedor VARCHAR(255),
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Consumo', 'Fixa', 'Variavel', 'Investimento')),
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Atrasado', 'Cancelado')),
    metodo_pagamento VARCHAR(50),
    observacoes TEXT,
    documento VARCHAR(100),
    unidade_id UUID REFERENCES unidades(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para Contas a Receber
CREATE TABLE IF NOT EXISTS contas_receber (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id),
    agendamento_id UUID REFERENCES agendamentos(id),
    descricao VARCHAR(255) NOT NULL,
    valor_bruto DECIMAL(10,2) NOT NULL,
    valor_liquido DECIMAL(10,2),
    valor_glosa DECIMAL(10,2) DEFAULT 0,
    percentual_glosa DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN valor_bruto > 0 THEN (valor_glosa / valor_bruto) * 100 
            ELSE 0 
        END
    ) STORED,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    origem VARCHAR(50) NOT NULL CHECK (origem IN ('Guia_Tabulada', 'Particular', 'Procedimento', 'Exame', 'Consulta')),
    convenio_id UUID REFERENCES convenios(id),
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Recebido', 'Atrasado', 'Glosa_Total', 'Glosa_Parcial')),
    metodo_recebimento VARCHAR(50),
    numero_guia VARCHAR(100),
    observacoes TEXT,
    unidade_id UUID REFERENCES unidades(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para Folha de Pagamento CLT
CREATE TABLE IF NOT EXISTS folha_clt (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    colaborador_id UUID REFERENCES colaboradores(id),
    mes_referencia DATE NOT NULL,
    salario_base DECIMAL(10,2) NOT NULL,
    horas_extras DECIMAL(10,2) DEFAULT 0,
    adicional_noturno DECIMAL(10,2) DEFAULT 0,
    vale_transporte DECIMAL(10,2) DEFAULT 0,
    vale_refeicao DECIMAL(10,2) DEFAULT 0,
    plano_saude DECIMAL(10,2) DEFAULT 0,
    outros_beneficios DECIMAL(10,2) DEFAULT 0,
    salario_bruto DECIMAL(10,2) GENERATED ALWAYS AS (
        salario_base + horas_extras + adicional_noturno + outros_beneficios
    ) STORED,
    inss DECIMAL(10,2),
    irrf DECIMAL(10,2),
    fgts DECIMAL(10,2),
    outros_descontos DECIMAL(10,2) DEFAULT 0,
    salario_liquido DECIMAL(10,2),
    encargos_patronais DECIMAL(10,2),
    custo_total DECIMAL(10,2) GENERATED ALWAYS AS (
        salario_bruto + COALESCE(encargos_patronais, 0)
    ) STORED,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Processado', 'Pago')),
    data_pagamento DATE,
    unidade_id UUID REFERENCES unidades(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para Folha de Pagamento PJ
CREATE TABLE IF NOT EXISTS folha_pj (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profissional_id UUID REFERENCES profissionais(id),
    mes_referencia DATE NOT NULL,
    valor_bruto DECIMAL(10,2) NOT NULL,
    percentual_repasse DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    valor_repasse DECIMAL(10,2) GENERATED ALWAYS AS (
        valor_bruto * (percentual_repasse / 100)
    ) STORED,
    valor_clinica DECIMAL(10,2) GENERATED ALWAYS AS (
        valor_bruto - (valor_bruto * (percentual_repasse / 100))
    ) STORED,
    descontos DECIMAL(10,2) DEFAULT 0,
    valor_liquido DECIMAL(10,2) GENERATED ALWAYS AS (
        (valor_bruto * (percentual_repasse / 100)) - COALESCE(descontos, 0)
    ) STORED,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Processado', 'Pago')),
    data_pagamento DATE,
    observacoes TEXT,
    unidade_id UUID REFERENCES unidades(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para Notas Fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_nfe VARCHAR(50) UNIQUE,
    serie VARCHAR(10) NOT NULL DEFAULT '1',
    paciente_id UUID REFERENCES pacientes(id),
    agendamento_id UUID REFERENCES agendamentos(id),
    valor_servicos DECIMAL(10,2) NOT NULL,
    valor_iss DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    descricao_servicos TEXT NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Emitida', 'Cancelada', 'Rejeitada')),
    chave_acesso VARCHAR(44) UNIQUE,
    protocolo_autorizacao VARCHAR(15),
    xml_nfe TEXT,
    observacoes TEXT,
    unidade_id UUID REFERENCES unidades(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================
-- ÍNDICES PARA PERFORMANCE
-- =================================================

-- Índices para Contas a Pagar
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON contas_pagar(categoria);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_unidade ON contas_pagar(unidade_id);

-- Índices para Contas a Receber  
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_origem ON contas_receber(origem);
CREATE INDEX IF NOT EXISTS idx_contas_receber_paciente ON contas_receber(paciente_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_convenio ON contas_receber(convenio_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_unidade ON contas_receber(unidade_id);

-- Índices para Folha CLT
CREATE INDEX IF NOT EXISTS idx_folha_clt_mes ON folha_clt(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_folha_clt_colaborador ON folha_clt(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_folha_clt_status ON folha_clt(status);
CREATE INDEX IF NOT EXISTS idx_folha_clt_unidade ON folha_clt(unidade_id);

-- Índices para Folha PJ
CREATE INDEX IF NOT EXISTS idx_folha_pj_mes ON folha_pj(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_folha_pj_profissional ON folha_pj(profissional_id);
CREATE INDEX IF NOT EXISTS idx_folha_pj_status ON folha_pj(status);
CREATE INDEX IF NOT EXISTS idx_folha_pj_unidade ON folha_pj(unidade_id);

-- Índices para Notas Fiscais
CREATE INDEX IF NOT EXISTS idx_nfe_emissao ON notas_fiscais(data_emissao);
CREATE INDEX IF NOT EXISTS idx_nfe_status ON notas_fiscais(status);
CREATE INDEX IF NOT EXISTS idx_nfe_paciente ON notas_fiscais(paciente_id);
CREATE INDEX IF NOT EXISTS idx_nfe_unidade ON notas_fiscais(unidade_id);

-- =================================================
-- VIEWS PARA RELATÓRIOS
-- =================================================

-- View para Dashboard Financeiro
CREATE OR REPLACE VIEW vw_dashboard_financeiro AS
SELECT 
    u.nome as unidade_nome,
    
    -- Receitas
    COALESCE(SUM(CASE WHEN cr.status = 'Recebido' THEN cr.valor_liquido ELSE 0 END), 0) as receita_confirmada,
    COALESCE(SUM(CASE WHEN cr.status = 'Pendente' THEN cr.valor_bruto ELSE 0 END), 0) as receita_pendente,
    COALESCE(SUM(cr.valor_glosa), 0) as total_glosas,
    
    -- Despesas
    COALESCE(SUM(CASE WHEN cp.status = 'Pago' THEN cp.valor ELSE 0 END), 0) as despesas_pagas,
    COALESCE(SUM(CASE WHEN cp.status = 'Pendente' THEN cp.valor ELSE 0 END), 0) as despesas_pendentes,
    
    -- Folhas
    COALESCE(SUM(fclt.custo_total), 0) as folha_clt,
    COALESCE(SUM(fpj.valor_repasse), 0) as folha_pj
    
FROM unidades u
LEFT JOIN contas_receber cr ON cr.unidade_id = u.id 
    AND cr.created_at >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN contas_pagar cp ON cp.unidade_id = u.id 
    AND cp.created_at >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN folha_clt fclt ON fclt.unidade_id = u.id 
    AND fclt.mes_referencia = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN folha_pj fpj ON fpj.unidade_id = u.id 
    AND fpj.mes_referencia = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.nome;

-- View para Análise de Glosas
CREATE OR REPLACE VIEW vw_analise_glosas AS
SELECT 
    DATE_TRUNC('month', cr.created_at) as mes_referencia,
    u.nome as unidade_nome,
    c.nome as convenio_nome,
    cr.origem,
    COUNT(*) as total_guias,
    SUM(cr.valor_bruto) as valor_provisionado,
    SUM(cr.valor_liquido) as valor_recebido,
    SUM(cr.valor_glosa) as valor_glosa,
    ROUND(AVG(cr.percentual_glosa), 2) as percentual_glosa_medio,
    COUNT(CASE WHEN cr.status IN ('Glosa_Total', 'Glosa_Parcial') THEN 1 END) as guias_com_glosa
FROM contas_receber cr
JOIN unidades u ON u.id = cr.unidade_id
LEFT JOIN convenios c ON c.id = cr.convenio_id
WHERE cr.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', cr.created_at), u.id, u.nome, c.id, c.nome, cr.origem
ORDER BY mes_referencia DESC, valor_glosa DESC;

-- View para Receitas por Origem
CREATE OR REPLACE VIEW vw_receitas_origem AS
SELECT 
    DATE_TRUNC('month', cr.created_at) as mes_referencia,
    u.nome as unidade_nome,
    cr.origem,
    COUNT(*) as quantidade,
    SUM(cr.valor_bruto) as valor_bruto_total,
    SUM(cr.valor_liquido) as valor_liquido_total,
    SUM(cr.valor_glosa) as valor_glosa_total,
    ROUND(AVG(cr.valor_bruto), 2) as ticket_medio,
    COUNT(CASE WHEN cr.status = 'Recebido' THEN 1 END) as recebidos,
    COUNT(CASE WHEN cr.status = 'Pendente' THEN 1 END) as pendentes
FROM contas_receber cr
JOIN unidades u ON u.id = cr.unidade_id
WHERE cr.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', cr.created_at), u.id, u.nome, cr.origem
ORDER BY mes_referencia DESC, valor_liquido_total DESC;

-- =================================================
-- FUNÇÕES AUXILIARES
-- =================================================

-- Função para calcular encargos CLT
CREATE OR REPLACE FUNCTION calcular_encargos_clt(salario_bruto DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    -- INSS Patronal (20%) + FGTS (8%) + Seguro Acidente (1%) + Salário Educação (2.5%) + INCRA (0.2%) + SEBRAE (0.6%) + Rat (1-3%, assumindo 2%)
    RETURN salario_bruto * 0.34; -- 34% sobre o salário bruto
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status de contas em atraso
CREATE OR REPLACE FUNCTION atualizar_status_atraso()
RETURNS VOID AS $$
BEGIN
    -- Atualizar contas a pagar em atraso
    UPDATE contas_pagar 
    SET status = 'Atrasado', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'Pendente' 
    AND data_vencimento < CURRENT_DATE;
    
    -- Atualizar contas a receber em atraso
    UPDATE contas_receber 
    SET status = 'Atrasado', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'Pendente' 
    AND data_vencimento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =================================================
-- TRIGGERS
-- =================================================

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas financeiras
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folha_clt_updated_at BEFORE UPDATE ON folha_clt 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folha_pj_updated_at BEFORE UPDATE ON folha_pj 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notas_fiscais_updated_at BEFORE UPDATE ON notas_fiscais 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular encargos CLT automaticamente
CREATE OR REPLACE FUNCTION calcular_encargos_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.encargos_patronais = calcular_encargos_clt(NEW.salario_bruto);
    NEW.salario_liquido = NEW.salario_bruto - COALESCE(NEW.inss, 0) - COALESCE(NEW.irrf, 0) - COALESCE(NEW.outros_descontos, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_encargos_clt_trigger BEFORE INSERT OR UPDATE ON folha_clt 
    FOR EACH ROW EXECUTE FUNCTION calcular_encargos_trigger();

-- =================================================
-- POLÍTICAS RLS (Row Level Security)
-- =================================================

-- Habilitar RLS nas tabelas financeiras
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE folha_clt ENABLE ROW LEVEL SECURITY;
ALTER TABLE folha_pj ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso por unidade (seguindo o padrão existente)
CREATE POLICY "Usuarios podem ver contas_pagar de sua unidade" ON contas_pagar
    FOR ALL USING (
        unidade_id IN (
            SELECT unidade_id FROM colaboradores 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios podem ver contas_receber de sua unidade" ON contas_receber
    FOR ALL USING (
        unidade_id IN (
            SELECT unidade_id FROM colaboradores 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios podem ver folha_clt de sua unidade" ON folha_clt
    FOR ALL USING (
        unidade_id IN (
            SELECT unidade_id FROM colaboradores 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios podem ver folha_pj de sua unidade" ON folha_pj
    FOR ALL USING (
        unidade_id IN (
            SELECT unidade_id FROM colaboradores 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios podem ver notas_fiscais de sua unidade" ON notas_fiscais
    FOR ALL USING (
        unidade_id IN (
            SELECT unidade_id FROM colaboradores 
            WHERE user_id = auth.uid()
        )
    );

-- =================================================
-- DADOS DE EXEMPLO PARA TESTE
-- =================================================

-- Inserir algumas contas a pagar de exemplo
INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, categoria, status, unidade_id) VALUES
('Energia Elétrica - Janeiro 2025', 'CPFL Energia', 2450.00, '2025-02-15', 'Consumo', 'Pendente', (SELECT id FROM unidades LIMIT 1)),
('Aluguel Consultório', 'Imobiliária Central', 5800.00, '2025-02-01', 'Fixa', 'Pago', (SELECT id FROM unidades LIMIT 1)),
('Material de Limpeza', 'Distribuidora Limpa', 320.00, '2025-02-10', 'Variavel', 'Pendente', (SELECT id FROM unidades LIMIT 1)),
('Equipamento Médico', 'Med Tech Ltda', 12500.00, '2025-03-01', 'Investimento', 'Pendente', (SELECT id FROM unidades LIMIT 1))
ON CONFLICT DO NOTHING;

-- Inserir algumas contas a receber de exemplo
INSERT INTO contas_receber (descricao, valor_bruto, valor_liquido, valor_glosa, data_vencimento, origem, status, unidade_id) VALUES
('Consulta Cardiológica', 250.00, 250.00, 0, '2025-02-28', 'Particular', 'Recebido', (SELECT id FROM unidades LIMIT 1)),
('Terapia em Grupo', 180.00, 144.00, 36.00, '2025-03-15', 'Guia_Tabulada', 'Pendente', (SELECT id FROM unidades LIMIT 1)),
('Exame Neurológico', 350.00, 315.00, 35.00, '2025-03-10', 'Guia_Tabulada', 'Recebido', (SELECT id FROM unidades LIMIT 1)),
('Procedimento Especial', 800.00, 800.00, 0, '2025-02-25', 'Particular', 'Pendente', (SELECT id FROM unidades LIMIT 1))
ON CONFLICT DO NOTHING;
