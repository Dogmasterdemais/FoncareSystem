-- Script de verificação e configuração das tabelas do módulo financeiro
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas principais existem
DO $$
BEGIN
    -- Verificar unidades
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'unidades') THEN
        RAISE NOTICE 'Tabela unidades não existe!';
    ELSE
        RAISE NOTICE 'Tabela unidades existe ✓';
    END IF;

    -- Verificar convenios
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'convenios') THEN
        RAISE NOTICE 'Tabela convenios não existe!';
    ELSE
        RAISE NOTICE 'Tabela convenios existe ✓';
    END IF;

    -- Verificar pacientes
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pacientes') THEN
        RAISE NOTICE 'Tabela pacientes não existe!';
    ELSE
        RAISE NOTICE 'Tabela pacientes existe ✓';
    END IF;

    -- Verificar agendamentos
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
        RAISE NOTICE 'Tabela agendamentos não existe!';
    ELSE
        RAISE NOTICE 'Tabela agendamentos existe ✓';
    END IF;
END $$;

-- 2. Criar tabelas do módulo financeiro se não existirem
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

CREATE TABLE IF NOT EXISTS atendimentos_guias_tabuladas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unidade_id UUID REFERENCES unidades(id),
    numero_guia VARCHAR(50) UNIQUE NOT NULL,
    paciente_nome VARCHAR(255) NOT NULL,
    paciente_documento VARCHAR(20),
    convenio VARCHAR(100) NOT NULL,
    procedimento TEXT NOT NULL,
    codigo_procedimento VARCHAR(20),
    valor_guia DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_pago DECIMAL(12,2),
    valor_glosa DECIMAL(12,2) DEFAULT 0,
    data_atendimento DATE NOT NULL,
    data_autorizacao DATE,
    profissional_nome VARCHAR(255),
    profissional_id UUID,
    status VARCHAR(20) DEFAULT 'Realizado' CHECK (status IN ('Agendado', 'Realizado', 'Cancelado', 'Em_Processamento')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anexos_notas_fiscais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conta_pagar_id UUID REFERENCES contas_pagar(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    url_arquivo TEXT NOT NULL,
    tamanho_arquivo BIGINT NOT NULL,
    tipo_arquivo VARCHAR(100) NOT NULL,
    hash_arquivo VARCHAR(255),
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar bucket para armazenamento de notas fiscais (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Configurar policies para o bucket
CREATE POLICY "Todos podem visualizar notas fiscais" ON storage.objects FOR SELECT USING (bucket_id = 'notas-fiscais');
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notas-fiscais' AND auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem atualizar" ON storage.objects FOR UPDATE USING (bucket_id = 'notas-fiscais' AND auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem deletar" ON storage.objects FOR DELETE USING (bucket_id = 'notas-fiscais' AND auth.role() = 'authenticated');

-- 5. Criar view para análise de superávit
CREATE OR REPLACE VIEW vw_analise_superavit_unidades AS
WITH receitas_unidade AS (
    SELECT 
        u.id as unidade_id,
        u.nome as unidade_nome,
        COALESCE(SUM(CASE WHEN cr.origem = 'Particular' THEN cr.valor_liquido END), 0) as receita_particular,
        COALESCE(SUM(CASE WHEN cr.origem = 'Guia_Tabulada' THEN cr.valor_liquido END), 0) as receita_guias,
        COALESCE(SUM(CASE WHEN cr.origem NOT IN ('Particular', 'Guia_Tabulada') THEN cr.valor_liquido END), 0) as receita_convenios,
        COALESCE(SUM(cr.valor_liquido), 0) as receita_total
    FROM unidades u
    LEFT JOIN contas_receber cr ON u.id = cr.unidade_id 
        AND cr.status = 'Recebido'
        AND cr.data_vencimento >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id, u.nome
),
despesas_unidade AS (
    SELECT 
        u.id as unidade_id,
        u.nome as unidade_nome,
        COALESCE(SUM(CASE WHEN cp.categoria = 'Consumo' THEN cp.valor END), 0) as despesa_consumo,
        COALESCE(SUM(CASE WHEN cp.categoria = 'Fixa' THEN cp.valor END), 0) as despesa_fixa,
        COALESCE(SUM(CASE WHEN cp.categoria = 'Variavel' THEN cp.valor END), 0) as despesa_variavel,
        COALESCE(SUM(cp.valor), 0) as despesa_total
    FROM unidades u
    LEFT JOIN contas_pagar cp ON u.id = cp.unidade_id 
        AND cp.status IN ('Pago', 'Pendente')
        AND cp.data_vencimento >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id, u.nome
),
atendimentos_unidade AS (
    SELECT 
        u.id as unidade_id,
        COUNT(agt.id) as total_atendimentos,
        COUNT(CASE WHEN agt.convenio != 'Particular' THEN 1 END) as atendimentos_guias,
        COUNT(CASE WHEN agt.convenio = 'Particular' THEN 1 END) as atendimentos_particular,
        COALESCE(AVG(agt.valor_guia), 0) as ticket_medio
    FROM unidades u
    LEFT JOIN atendimentos_guias_tabuladas agt ON u.id = agt.unidade_id 
        AND agt.status = 'Realizado'
        AND agt.data_atendimento >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id
)
SELECT 
    r.unidade_id,
    r.unidade_nome,
    r.receita_particular,
    r.receita_guias,
    r.receita_convenios,
    r.receita_total,
    d.despesa_consumo,
    d.despesa_fixa,
    d.despesa_variavel,
    d.despesa_total,
    (r.receita_total - d.despesa_total) as resultado,
    CASE 
        WHEN (r.receita_total - d.despesa_total) > 0 THEN 'lucro'
        WHEN (r.receita_total - d.despesa_total) < 0 THEN 'prejuizo'
        ELSE 'equilibrio'
    END as status_resultado,
    CASE 
        WHEN r.receita_total > 0 THEN ROUND(((r.receita_total - d.despesa_total) / r.receita_total) * 100, 2)
        ELSE 0
    END as percentual_margem,
    a.total_atendimentos,
    a.atendimentos_guias,
    a.atendimentos_particular,
    a.ticket_medio
FROM receitas_unidade r
FULL OUTER JOIN despesas_unidade d ON r.unidade_id = d.unidade_id
FULL OUTER JOIN atendimentos_unidade a ON COALESCE(r.unidade_id, d.unidade_id) = a.unidade_id
WHERE COALESCE(r.unidade_id, d.unidade_id) IS NOT NULL;

-- 6. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_atendimentos_guias_updated_at BEFORE UPDATE ON atendimentos_guias_tabuladas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anexos_notas_fiscais_updated_at BEFORE UPDATE ON anexos_notas_fiscais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar dados de exemplo para testes
INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, categoria, unidade_id)
SELECT 
    'Fornecimento de Energia Elétrica',
    'ENEL Distribuição',
    1250.80,
    CURRENT_DATE + INTERVAL '5 days',
    'Fixa',
    u.id
FROM unidades u 
WHERE u.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, categoria, unidade_id)
SELECT 
    'Material de Limpeza',
    'Distribuidora Clean',
    380.50,
    CURRENT_DATE + INTERVAL '10 days',
    'Consumo',
    u.id
FROM unidades u 
WHERE u.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO contas_receber (descricao, valor_bruto, valor_liquido, data_vencimento, origem, unidade_id)
SELECT 
    'Consulta Psicológica - João Silva',
    150.00,
    135.00,
    CURRENT_DATE + INTERVAL '15 days',
    'Particular',
    u.id
FROM unidades u 
WHERE u.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO atendimentos_guias_tabuladas (numero_guia, paciente_nome, convenio, procedimento, valor_guia, data_atendimento, unidade_id)
SELECT 
    'GT2025001',
    'Maria Santos Silva',
    'Unimed',
    'Terapia Individual Psicológica',
    120.00,
    CURRENT_DATE,
    u.id
FROM unidades u 
WHERE u.ativo = true
LIMIT 1
ON CONFLICT (numero_guia) DO NOTHING;

-- 8. Verificar se tudo foi criado corretamente
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Contar registros em cada tabela
    RAISE NOTICE 'Contas a Pagar: % registros', (SELECT COUNT(*) FROM contas_pagar);
    RAISE NOTICE 'Contas a Receber: % registros', (SELECT COUNT(*) FROM contas_receber);
    RAISE NOTICE 'Atendimentos Guias: % registros', (SELECT COUNT(*) FROM atendimentos_guias_tabuladas);
    RAISE NOTICE 'Anexos Notas Fiscais: % registros', (SELECT COUNT(*) FROM anexos_notas_fiscais);
    RAISE NOTICE 'View Superávit: % unidades', (SELECT COUNT(*) FROM vw_analise_superavit_unidades);
    
    RAISE NOTICE 'Setup do módulo financeiro concluído com sucesso! ✓';
END $$;
