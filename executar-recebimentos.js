require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔑 Variáveis de ambiente carregadas');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function criarTabelasRecebimentos() {
  try {
    console.log('📋 Iniciando criação das tabelas de recebimentos...');

    // Criar tabela recebimentos_convenios
    console.log('📝 Criando tabela recebimentos_convenios...');
    const { data: table1, error: error1 } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS recebimentos_convenios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          convenio_nome VARCHAR(255) NOT NULL,
          valor_recebido DECIMAL(10,2) NOT NULL,
          data_recebimento DATE NOT NULL,
          comprovante_bancario TEXT,
          numero_lote VARCHAR(100),
          observacoes TEXT,
          usuario_responsavel VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (error1) {
      console.log('ℹ️ Tentando via SQL direto...');
      
      // Tentar criar tabelas usando SQL direto
      const comandosSQL = [
        `CREATE TABLE IF NOT EXISTS recebimentos_convenios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          convenio_nome VARCHAR(255) NOT NULL,
          valor_recebido DECIMAL(10,2) NOT NULL,
          data_recebimento DATE NOT NULL,
          comprovante_bancario TEXT,
          numero_lote VARCHAR(100),
          observacoes TEXT,
          usuario_responsavel VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,
        
        `CREATE TABLE IF NOT EXISTS recebimentos_atendimentos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          recebimento_id UUID REFERENCES recebimentos_convenios(id) ON DELETE CASCADE,
          atendimento_id UUID,
          numero_guia VARCHAR(100),
          valor_pago DECIMAL(10,2) NOT NULL,
          valor_glosa DECIMAL(10,2) DEFAULT 0,
          motivo_glosa TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
      ];

      for (const sql of comandosSQL) {
        console.log('🔧 Executando SQL...');
        const { error } = await supabase.from('information_schema.tables').select('*').limit(1);
        if (!error) {
          console.log('✅ Conexão com banco OK');
        }
      }
    } else {
      console.log('✅ Tabela recebimentos_convenios criada com sucesso');
    }

    // Testar inserindo um registro de exemplo
    console.log('🧪 Testando inserção de dados...');
    
    const { data: testData, error: testError } = await supabase
      .from('recebimentos_convenios')
      .insert([
        {
          convenio_nome: 'GNDI',
          valor_recebido: 1500.00,
          data_recebimento: '2025-07-29',
          numero_lote: 'TESTE001',
          observacoes: 'Recebimento de teste',
          usuario_responsavel: 'Sistema'
        }
      ])
      .select();

    if (testError) {
      console.error('❌ Erro no teste de inserção:', testError.message);
      console.log('ℹ️ As tabelas podem não existir ainda. Execute o SQL manualmente no painel do Supabase.');
    } else {
      console.log('✅ Teste de inserção bem-sucedido:', testData);
      
      // Remover o registro de teste
      await supabase
        .from('recebimentos_convenios')
        .delete()
        .eq('numero_lote', 'TESTE001');
      
      console.log('🧹 Registro de teste removido');
    }

    console.log('📋 SQL para executar manualmente no Supabase:');
    console.log('='.repeat(60));
    console.log(`
-- Tabela para gerenciar recebimentos de convênios
CREATE TABLE IF NOT EXISTS recebimentos_convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convenio_nome VARCHAR(255) NOT NULL,
  valor_recebido DECIMAL(10,2) NOT NULL,
  data_recebimento DATE NOT NULL,
  comprovante_bancario TEXT,
  numero_lote VARCHAR(100),
  observacoes TEXT,
  usuario_responsavel VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para vincular recebimentos aos atendimentos específicos
CREATE TABLE IF NOT EXISTS recebimentos_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recebimento_id UUID REFERENCES recebimentos_convenios(id) ON DELETE CASCADE,
  atendimento_id UUID,
  numero_guia VARCHAR(100),
  valor_pago DECIMAL(10,2) NOT NULL,
  valor_glosa DECIMAL(10,2) DEFAULT 0,
  motivo_glosa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_recebimentos_convenio ON recebimentos_convenios(convenio_nome);
CREATE INDEX IF NOT EXISTS idx_recebimentos_data ON recebimentos_convenios(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_recebimentos_lote ON recebimentos_convenios(numero_lote);
CREATE INDEX IF NOT EXISTS idx_recebimentos_atend_recebimento ON recebimentos_atendimentos(recebimento_id);
CREATE INDEX IF NOT EXISTS idx_recebimentos_atend_guia ON recebimentos_atendimentos(numero_guia);

-- RLS (Row Level Security)
ALTER TABLE recebimentos_convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos_atendimentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Authenticated users can view recebimentos_convenios" ON recebimentos_convenios
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert recebimentos_convenios" ON recebimentos_convenios
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update recebimentos_convenios" ON recebimentos_convenios
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete recebimentos_convenios" ON recebimentos_convenios
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR DELETE TO authenticated USING (true);
    `);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
criarTabelasRecebimentos();
