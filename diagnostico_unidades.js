const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnosticarSalas() {
  console.log('🔍 DIAGNÓSTICO DE SALAS');
  console.log('=' .repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔧 Configuração:');
  console.log('  URL:', supabaseUrl ? 'Definida' : 'NÃO DEFINIDA');
  console.log('  Key:', supabaseKey ? 'Definida' : 'NÃO DEFINIDA');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Unidade específica: Osasco 2
    const unidadeId = 'a4429bd3-1737-43bc-920e-dae4749e20dd';
    
    console.log('🏢 Verificando salas para unidade:', unidadeId);
    console.log('   (Foncare - Osasco 2)');
    
    // Buscar salas simples
    console.log('\n📋 Query simples de salas...');
    const { data: salasSimples, error: errorSimples } = await supabase
      .from('salas')
      .select('*')
      .eq('unidade_id', unidadeId);

    console.log('📊 Resultados salas simples:');
    console.log('  Erro:', errorSimples?.message || 'Nenhum');
    console.log('  Salas encontradas:', salasSimples?.length || 0);

    if (salasSimples && salasSimples.length > 0) {
      console.log('\n✅ Salas encontradas:');
      salasSimples.forEach((sala, index) => {
        console.log(`  ${index + 1}. ${sala.nome} (ID: ${sala.id})`);
        console.log(`     Especialidade ID: ${sala.especialidade_id || 'Não definida'}`);
        console.log(`     Ativo: ${sala.ativo}`);
      });
    }

    // Buscar salas com JOIN de especialidades
    console.log('\n🔗 Query com JOIN especialidades...');
    const { data: salasComEspecialidades, error: errorJoin } = await supabase
      .from('salas')
      .select(`
        *,
        especialidades(
          id,
          nome,
          cor,
          duracao_padrao_minutos
        )
      `)
      .eq('unidade_id', unidadeId);

    console.log('📊 Resultados salas com especialidades:');
    console.log('  Erro:', errorJoin?.message || 'Nenhum');
    console.log('  Salas encontradas:', salasComEspecialidades?.length || 0);

    if (errorJoin) {
      console.error('❌ ERRO DETALHADO JOIN:', {
        message: errorJoin.message,
        details: errorJoin.details,
        hint: errorJoin.hint,
        code: errorJoin.code
      });
    }

    if (salasComEspecialidades && salasComEspecialidades.length > 0) {
      console.log('\n✅ Salas com especialidades:');
      salasComEspecialidades.forEach((sala, index) => {
        console.log(`  ${index + 1}. ${sala.nome}`);
        console.log(`     Especialidade: ${sala.especialidades?.nome || 'Não vinculada'}`);
        console.log(`     Cor: ${sala.cor || 'Não definida'}`);
        console.log(`     Ativo: ${sala.ativo}`);
      });
    }

    // Verificar todas as unidades que têm salas
    console.log('\n🔍 Verificando todas as unidades com salas...');
    const { data: todasSalas, error: errorTodas } = await supabase
      .from('salas')
      .select('unidade_id, nome')
      .limit(20);

    if (todasSalas && todasSalas.length > 0) {
      const unidadesComSalas = [...new Set(todasSalas.map(s => s.unidade_id))];
      console.log('📊 Unidades que têm salas:');
      unidadesComSalas.forEach(uid => {
        const qtdSalas = todasSalas.filter(s => s.unidade_id === uid).length;
        const isOsasco2 = uid === unidadeId;
        console.log(`  ${isOsasco2 ? '🎯' : '  '} ${uid} (${qtdSalas} salas)${isOsasco2 ? ' ← NOSSA UNIDADE' : ''}`);
      });
    }

  } catch (err) {
    console.error('❌ ERRO GERAL:', err);
  }
}

diagnosticarSalas();
