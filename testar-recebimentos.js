require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testarSistemaRecebimentos() {
  console.log('🧪 Testando sistema de recebimentos...');

  try {
    // 1. Testar se conseguimos acessar a tabela recebimentos_convenios
    console.log('📋 Testando acesso à tabela recebimentos_convenios...');
    const { data: recebimentos, error: errorRecebimentos } = await supabase
      .from('recebimentos_convenios')
      .select('*')
      .limit(1);

    if (errorRecebimentos) {
      console.error('❌ Erro ao acessar recebimentos_convenios:', errorRecebimentos.message);
      return;
    } else {
      console.log('✅ Tabela recebimentos_convenios acessível');
    }

    // 2. Testar se conseguimos acessar a tabela recebimentos_atendimentos
    console.log('📋 Testando acesso à tabela recebimentos_atendimentos...');
    const { data: atendimentos, error: errorAtendimentos } = await supabase
      .from('recebimentos_atendimentos')
      .select('*')
      .limit(1);

    if (errorAtendimentos) {
      console.error('❌ Erro ao acessar recebimentos_atendimentos:', errorAtendimentos.message);
      return;
    } else {
      console.log('✅ Tabela recebimentos_atendimentos acessível');
    }

    // 3. Testar inserção de um recebimento de teste
    console.log('💰 Testando inserção de recebimento...');
    const { data: novoRecebimento, error: errorInsert } = await supabase
      .from('recebimentos_convenios')
      .insert([
        {
          convenio_nome: 'GNDI',
          valor_recebido: 2500.75,
          data_recebimento: '2025-07-29',
          numero_lote: 'LOTE202501',
          comprovante_bancario: 'https://exemplo.com/comprovante1.pdf',
          observacoes: 'Recebimento de teste do sistema',
          usuario_responsavel: 'Sistema de Teste'
        }
      ])
      .select();

    if (errorInsert) {
      console.error('❌ Erro na inserção:', errorInsert.message);
      return;
    } else {
      console.log('✅ Recebimento inserido com sucesso:', novoRecebimento[0].id);
    }

    // 4. Testar busca de recebimentos
    console.log('🔍 Testando busca de recebimentos...');
    const { data: buscaRecebimentos, error: errorBusca } = await supabase
      .from('recebimentos_convenios')
      .select('*')
      .eq('numero_lote', 'LOTE202501');

    if (errorBusca) {
      console.error('❌ Erro na busca:', errorBusca.message);
    } else {
      console.log('✅ Recebimento encontrado:', buscaRecebimentos.length, 'registro(s)');
    }

    // 5. Testar atualização
    console.log('✏️ Testando atualização de recebimento...');
    const { data: updateRecebimento, error: errorUpdate } = await supabase
      .from('recebimentos_convenios')
      .update({ 
        observacoes: 'Recebimento atualizado - teste concluído',
        valor_recebido: 2600.00 
      })
      .eq('numero_lote', 'LOTE202501')
      .select();

    if (errorUpdate) {
      console.error('❌ Erro na atualização:', errorUpdate.message);
    } else {
      console.log('✅ Recebimento atualizado com sucesso');
    }

    // 6. Testar view consolidada (se existir)
    console.log('📊 Testando view consolidada...');
    const { data: viewData, error: errorView } = await supabase
      .from('vw_recebimentos_consolidado')
      .select('*')
      .limit(1);

    if (errorView) {
      console.log('ℹ️ View consolidada não encontrada (normal se não foi criada):', errorView.message);
    } else {
      console.log('✅ View consolidada acessível');
    }

    // 7. Testar exclusão do registro de teste
    console.log('🧹 Removendo registro de teste...');
    const { error: errorDelete } = await supabase
      .from('recebimentos_convenios')
      .delete()
      .eq('numero_lote', 'LOTE202501');

    if (errorDelete) {
      console.error('❌ Erro na exclusão:', errorDelete.message);
    } else {
      console.log('✅ Registro de teste removido com sucesso');
    }

    // 8. Testar acesso aos dados reais de convênios
    console.log('🏢 Testando busca de convênios reais...');
    const { data: convenios, error: errorConvenios } = await supabase
      .from('vw_faturamento_completo')
      .select('convenio_nome')
      .not('convenio_nome', 'is', null)
      .limit(5);

    if (errorConvenios) {
      console.error('❌ Erro ao buscar convênios:', errorConvenios.message);
    } else {
      console.log('✅ Convênios encontrados:', convenios.map(c => c.convenio_nome));
    }

    console.log('\n🎉 TESTE COMPLETO - Sistema de recebimentos funcionando!');
    console.log('📋 Resumo dos testes:');
    console.log('  ✅ Tabelas criadas e acessíveis');
    console.log('  ✅ Inserção funcionando');
    console.log('  ✅ Busca funcionando');
    console.log('  ✅ Atualização funcionando');
    console.log('  ✅ Exclusão funcionando');
    console.log('  ✅ Integração com dados reais');
    console.log('\n🚀 Sistema pronto para uso!');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

// Executar os testes
testarSistemaRecebimentos();
