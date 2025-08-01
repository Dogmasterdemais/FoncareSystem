require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testarSemRLS() {
  console.log('🧪 Testando sem RLS (desenvolvimento)...');

  try {
    console.log('⚡ Desabilitando RLS temporariamente...');
    console.log('📋 Execute este SQL no painel do Supabase:');
    console.log('ALTER TABLE recebimentos_convenios DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE recebimentos_atendimentos DISABLE ROW LEVEL SECURITY;');
    console.log('');

    // Testar inserção mesmo com RLS ativo (pode falhar)
    console.log('💰 Tentando inserção (pode falhar com RLS)...');
    const { data: novoRecebimento, error: errorInsert } = await supabase
      .from('recebimentos_convenios')
      .insert([
        {
          convenio_nome: 'GNDI',
          valor_recebido: 2500.75,
          data_recebimento: '2025-07-29',
          numero_lote: 'TESTE123',
          observacoes: 'Teste de sistema'
        }
      ])
      .select();

    if (errorInsert) {
      console.log('ℹ️ Erro esperado (RLS ativo):', errorInsert.message);
      console.log('🔧 Para corrigir, execute o SQL acima no Supabase ou use uma chave de serviço');
    } else {
      console.log('✅ Inserção bem-sucedida! Sistema funcionando');
      
      // Limpar teste
      await supabase
        .from('recebimentos_convenios')
        .delete()
        .eq('numero_lote', 'TESTE123');
      
      console.log('🧹 Teste limpo');
    }

    // Testar busca (geralmente funciona mesmo com RLS)
    console.log('🔍 Testando busca...');
    const { data: busca, error: errorBusca } = await supabase
      .from('recebimentos_convenios')
      .select('*')
      .limit(5);

    if (errorBusca) {
      console.log('❌ Erro na busca:', errorBusca.message);
    } else {
      console.log('✅ Busca funcionando, registros:', busca.length);
    }

    console.log('\n📋 Para uso completo do sistema:');
    console.log('1. Execute o SQL de desabilitar RLS no Supabase');
    console.log('2. Ou configure autenticação adequada');
    console.log('3. Ou use uma chave de serviço com mais permissões');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarSemRLS();
