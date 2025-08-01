const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testarSalas() {
  console.log('🔍 TESTE DIRETO DAS SALAS');
  console.log('=' .repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const unidadeId = 'a4429bd3-1737-43bc-920e-dae4749e20dd'; // Osasco 2

  try {
    console.log('🔍 Buscando salas para unidade:', unidadeId);
    
    const { data: salas, error } = await supabase
      .from('salas')
      .select('id, nome, cor, tipo, ativo, unidade_id')
      .eq('unidade_id', unidadeId)
      .order('nome');

    console.log('📊 Resultados:');
    console.log('  Erro:', error?.message || 'Nenhum');
    console.log('  Total de salas:', salas?.length || 0);

    if (salas && salas.length > 0) {
      console.log('\n✅ Salas encontradas:');
      salas.forEach((sala, index) => {
        console.log(`  ${index + 1}. ${sala.nome}`);
        console.log(`     - ID: ${sala.id}`);
        console.log(`     - Cor: ${sala.cor}`);
        console.log(`     - Tipo: ${sala.tipo}`);
        console.log(`     - Ativo: ${sala.ativo}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Nenhuma sala encontrada');
    }

  } catch (err) {
    console.error('❌ ERRO:', err);
  }
}

testarSalas();
