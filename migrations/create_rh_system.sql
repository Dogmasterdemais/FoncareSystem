-- Schema completo para módulo RH/PJ
-- Sistema de gestão de colaboradores CLT e Prestadores

-- ========================================
-- 1. TABELA PRINCIPAL DE COLABORADORES
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados Pessoais
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'feminino', 'outro')),
    estado_civil VARCHAR(20) CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
    nacionalidade VARCHAR(100) DEFAULT 'Brasileira',
    naturalidade_cidade VARCHAR(100),
    naturalidade_estado CHAR(2),
    nome_mae VARCHAR(255) NOT NULL,
    nome_pai VARCHAR(255),
    
    -- Documentos
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20) NOT NULL,
    rg_orgao_emissor VARCHAR(20),
    rg_uf CHAR(2),
    titulo_eleitor VARCHAR(15),
    titulo_zona VARCHAR(10),
    titulo_secao VARCHAR(10),
    cnh VARCHAR(15),
    cnh_categoria VARCHAR(5),
    cnh_vencimento DATE,
    
    -- Endereço
    endereco_logradouro VARCHAR(255),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado CHAR(2),
    endereco_cep VARCHAR(10),
    
    -- Contato
    telefone_celular VARCHAR(20) NOT NULL,
    telefone_fixo VARCHAR(20),
    email_pessoal VARCHAR(255),
    
    -- Dados Bancários
    banco_codigo VARCHAR(10),
    banco_nome VARCHAR(100),
    banco_agencia VARCHAR(20),
    banco_conta VARCHAR(30),
    banco_tipo_conta VARCHAR(20) CHECK (banco_tipo_conta IN ('corrente', 'poupanca')),
    banco_cpf_titular VARCHAR(14), -- se conta de terceiros
    
    -- Dados Profissionais
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    unidade_id UUID REFERENCES unidades(id),
    regime_contratacao VARCHAR(20) NOT NULL CHECK (regime_contratacao IN ('clt', 'pj', 'autonomo', 'estagiario')),
    jornada_horario_inicio TIME,
    jornada_horario_fim TIME,
    jornada_carga_semanal INTEGER,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    salario_valor DECIMAL(10,2),
    comissao_tipo VARCHAR(50),
    comissao_percentual DECIMAL(5,2),
    
    -- Benefícios
    vale_transporte BOOLEAN DEFAULT FALSE,
    vale_alimentacao BOOLEAN DEFAULT FALSE,
    vale_alimentacao_valor DECIMAL(8,2),
    plano_saude BOOLEAN DEFAULT FALSE,
    plano_dental BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado', 'demitido')),
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- ========================================
-- 2. DOCUMENTOS ESPECÍFICOS CLT
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores_documentos_clt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    
    -- CTPS
    ctps_numero VARCHAR(20),
    ctps_serie VARCHAR(10),
    ctps_uf CHAR(2),
    ctps_data_emissao DATE,
    
    -- PIS/NIS/NIT
    pis_nis_nit VARCHAR(15),
    
    -- Certidões
    certidao_nascimento_casamento TEXT, -- caminho do arquivo
    comprovante_endereco TEXT, -- caminho do arquivo
    comprovante_escolaridade TEXT, -- caminho do arquivo
    antecedentes_criminais TEXT, -- caminho do arquivo
    
    -- Saúde Ocupacional
    aso_admissional TEXT, -- caminho do arquivo
    aso_data_realizacao DATE,
    aso_data_vencimento DATE,
    aso_resultado VARCHAR(20) CHECK (aso_resultado IN ('apto', 'inapto', 'apto_com_restricoes')),
    
    -- Reservista (homens)
    certificado_reservista TEXT, -- caminho do arquivo
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. DOCUMENTOS ESPECÍFICOS PJ/PRESTADOR
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores_documentos_pj (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    
    -- Dados da Empresa
    cnpj VARCHAR(18) UNIQUE,
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    
    -- Contratos
    contrato_prestacao_servicos TEXT, -- caminho do arquivo
    data_inicio_contrato DATE,
    data_fim_contrato DATE,
    valor_contrato DECIMAL(10,2),
    
    -- Certidões
    certidao_negativa_inss TEXT, -- caminho do arquivo
    certidao_negativa_fgts TEXT, -- caminho do arquivo
    certidao_negativa_receita TEXT, -- caminho do arquivo
    comprovante_iss TEXT, -- caminho do arquivo
    
    -- Nota Fiscal
    nfe_configurada BOOLEAN DEFAULT FALSE,
    nfe_ultimo_numero INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. DEPENDENTES
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores_dependentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    
    nome_completo VARCHAR(255) NOT NULL,
    grau_parentesco VARCHAR(50) NOT NULL CHECK (grau_parentesco IN ('conjuge', 'filho', 'enteado', 'pai', 'mae', 'irmao', 'outro')),
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14),
    
    -- Inclusões
    inclusao_irrf BOOLEAN DEFAULT FALSE,
    inclusao_plano_saude BOOLEAN DEFAULT FALSE,
    inclusao_plano_dental BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. PERFIS DE ACESSO
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores_perfis_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('recepcao', 'terapeuta', 'financeiro', 'rh', 'gestor', 'admin')),
    unidade_id UUID REFERENCES unidades(id),
    
    -- Permissões específicas
    pode_agendar BOOLEAN DEFAULT FALSE,
    pode_cancelar BOOLEAN DEFAULT FALSE,
    pode_faturar BOOLEAN DEFAULT FALSE,
    pode_gerar_relatorios BOOLEAN DEFAULT FALSE,
    pode_gerenciar_usuarios BOOLEAN DEFAULT FALSE,
    
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. FOLHA DE PAGAMENTO CLT
-- ========================================
CREATE TABLE IF NOT EXISTS folha_pagamento_clt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
    
    -- Período
    mes_referencia INTEGER NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
    ano_referencia INTEGER NOT NULL,
    
    -- Vencimentos
    salario_base DECIMAL(10,2) NOT NULL,
    horas_extras DECIMAL(8,2) DEFAULT 0,
    valor_horas_extras DECIMAL(10,2) DEFAULT 0,
    adicional_noturno DECIMAL(10,2) DEFAULT 0,
    comissoes DECIMAL(10,2) DEFAULT 0,
    gratificacoes DECIMAL(10,2) DEFAULT 0,
    vale_alimentacao DECIMAL(8,2) DEFAULT 0,
    vale_transporte DECIMAL(8,2) DEFAULT 0,
    outros_vencimentos DECIMAL(10,2) DEFAULT 0,
    
    -- Descontos
    inss DECIMAL(10,2) DEFAULT 0,
    irrf DECIMAL(10,2) DEFAULT 0,
    fgts DECIMAL(10,2) DEFAULT 0,
    vale_transporte_desconto DECIMAL(8,2) DEFAULT 0,
    vale_alimentacao_desconto DECIMAL(8,2) DEFAULT 0,
    plano_saude_desconto DECIMAL(8,2) DEFAULT 0,
    outros_descontos DECIMAL(10,2) DEFAULT 0,
    
    -- Totais
    total_vencimentos DECIMAL(10,2) NOT NULL,
    total_descontos DECIMAL(10,2) NOT NULL,
    salario_liquido DECIMAL(10,2) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga')),
    data_pagamento DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- ========================================
-- 7. FOLHA DE PAGAMENTO PJ/PRESTADORES
-- ========================================
CREATE TABLE IF NOT EXISTS folha_pagamento_pj (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
    
    -- Período
    mes_referencia INTEGER NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
    ano_referencia INTEGER NOT NULL,
    
    -- Valores
    valor_bruto DECIMAL(10,2) NOT NULL,
    quantidade_atendimentos INTEGER DEFAULT 0,
    valor_por_atendimento DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    
    -- Descontos/Impostos
    iss_percentual DECIMAL(5,2) DEFAULT 0,
    iss_valor DECIMAL(10,2) DEFAULT 0,
    irrf_percentual DECIMAL(5,2) DEFAULT 0,
    irrf_valor DECIMAL(10,2) DEFAULT 0,
    outros_descontos DECIMAL(10,2) DEFAULT 0,
    
    -- Totais
    total_descontos DECIMAL(10,2) NOT NULL,
    valor_liquido DECIMAL(10,2) NOT NULL,
    
    -- Nota Fiscal
    nfe_numero VARCHAR(20),
    nfe_data_emissao DATE,
    nfe_valor DECIMAL(10,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga')),
    data_pagamento DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- ========================================
-- 8. HISTÓRICO DE ALTERAÇÕES
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
    
    campo_alterado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    motivo TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);
CREATE INDEX IF NOT EXISTS idx_colaboradores_regime ON colaboradores(regime_contratacao);
CREATE INDEX IF NOT EXISTS idx_colaboradores_unidade ON colaboradores(unidade_id);
CREATE INDEX IF NOT EXISTS idx_folha_clt_colaborador ON folha_pagamento_clt(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_folha_clt_periodo ON folha_pagamento_clt(ano_referencia, mes_referencia);
CREATE INDEX IF NOT EXISTS idx_folha_pj_colaborador ON folha_pagamento_pj(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_folha_pj_periodo ON folha_pagamento_pj(ano_referencia, mes_referencia);

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View colaboradores completos
CREATE OR REPLACE VIEW vw_colaboradores_completo AS
SELECT 
    c.*,
    u.nome as unidade_nome,
    dc.ctps_numero,
    dc.pis_nis_nit,
    dc.aso_data_vencimento,
    dp.cnpj,
    dp.razao_social,
    COUNT(cd.id) as total_dependentes
FROM colaboradores c
LEFT JOIN unidades u ON c.unidade_id = u.id
LEFT JOIN colaboradores_documentos_clt dc ON c.id = dc.colaborador_id
LEFT JOIN colaboradores_documentos_pj dp ON c.id = dp.colaborador_id
LEFT JOIN colaboradores_dependentes cd ON c.id = cd.colaborador_id AND cd.status = 'ativo'
GROUP BY c.id, u.nome, dc.ctps_numero, dc.pis_nis_nit, dc.aso_data_vencimento, dp.cnpj, dp.razao_social;

-- View para relatórios de folha CLT
CREATE OR REPLACE VIEW vw_folha_clt_relatorio AS
SELECT 
    fp.*,
    c.nome_completo,
    c.cpf,
    c.cargo,
    u.nome as unidade_nome
FROM folha_pagamento_clt fp
JOIN colaboradores c ON fp.colaborador_id = c.id
LEFT JOIN unidades u ON c.unidade_id = u.id;

-- View para relatórios de folha PJ
CREATE OR REPLACE VIEW vw_folha_pj_relatorio AS
SELECT 
    fp.*,
    c.nome_completo,
    c.cpf,
    c.cargo,
    u.nome as unidade_nome,
    dp.cnpj,
    dp.razao_social
FROM folha_pagamento_pj fp
JOIN colaboradores c ON fp.colaborador_id = c.id
LEFT JOIN unidades u ON c.unidade_id = u.id
LEFT JOIN colaboradores_documentos_pj dp ON c.id = dp.colaborador_id;

-- ========================================
-- COMENTÁRIOS NAS TABELAS
-- ========================================
COMMENT ON TABLE colaboradores IS 'Tabela principal de colaboradores CLT e PJ';
COMMENT ON TABLE colaboradores_documentos_clt IS 'Documentos específicos para colaboradores CLT';
COMMENT ON TABLE colaboradores_documentos_pj IS 'Documentos específicos para prestadores PJ';
COMMENT ON TABLE colaboradores_dependentes IS 'Dependentes dos colaboradores';
COMMENT ON TABLE colaboradores_perfis_acesso IS 'Perfis de acesso ao sistema';
COMMENT ON TABLE folha_pagamento_clt IS 'Folha de pagamento CLT mensal';
COMMENT ON TABLE folha_pagamento_pj IS 'Folha de pagamento PJ mensal';
COMMENT ON TABLE colaboradores_historico IS 'Histórico de alterações nos dados dos colaboradores';
