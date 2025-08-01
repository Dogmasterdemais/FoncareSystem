-- Criar tabela para documentos dos pacientes
CREATE TABLE IF NOT EXISTS documentos_pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    tamanho BIGINT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_pacientes_paciente_id ON documentos_pacientes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_pacientes_tipo ON documentos_pacientes(tipo);

-- RLS (Row Level Security)
ALTER TABLE documentos_pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver documentos de suas unidades" ON documentos_pacientes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pacientes p 
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE p.id = documentos_pacientes.paciente_id 
            AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir documentos de suas unidades" ON documentos_pacientes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pacientes p 
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE p.id = documentos_pacientes.paciente_id 
            AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar documentos de suas unidades" ON documentos_pacientes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pacientes p 
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE p.id = documentos_pacientes.paciente_id 
            AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar documentos de suas unidades" ON documentos_pacientes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pacientes p 
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE p.id = documentos_pacientes.paciente_id 
            AND c.usuario_id = auth.uid()
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documentos_pacientes_updated_at 
    BEFORE UPDATE ON documentos_pacientes 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Criar bucket de storage se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o storage
CREATE POLICY "Usuários podem ver documentos de suas unidades" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documentos' AND
        EXISTS (
            SELECT 1 FROM documentos_pacientes dp
            JOIN pacientes p ON p.id = dp.paciente_id
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE dp.url = storage.objects.name 
            AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir documentos de suas unidades" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documentos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Usuários podem atualizar documentos de suas unidades" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documentos' AND
        EXISTS (
            SELECT 1 FROM documentos_pacientes dp
            JOIN pacientes p ON p.id = dp.paciente_id
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE dp.url = storage.objects.name 
            AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar documentos de suas unidades" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documentos' AND
        EXISTS (
            SELECT 1 FROM documentos_pacientes dp
            JOIN pacientes p ON p.id = dp.paciente_id
            JOIN colaboradores c ON c.unidade_id = p.unidade_id
            WHERE dp.url = storage.objects.name 
            AND c.usuario_id = auth.uid()
        )
    );
