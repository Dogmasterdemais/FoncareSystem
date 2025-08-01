const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testQuery() {
  console.log('=== TESTANDO CONSULTAS SUPABASE ===');
  
  // 1. Testar unidades
  console.log('\n1. Unidades:');
  const { data: unidades, error: unidadesError } = await supabase
    .from('unidades')
    .select('*')
    .limit(3);
  
  if (unidadesError) {
    console.log('Erro unidades:', unidadesError);
  } else {
    console.log('Unidades encontradas:', unidades?.length || 0);
    unidades?.forEach(u => console.log(`  - ${u.id}: ${u.nome}`));
  }
  
  // 2. Testar salas
  console.log('\n2. Salas:');
  const { data: salas, error: salasError } = await supabase
    .from('salas')
    .select('*')
    .eq('ativo', true)
    .limit(5);
  
  if (salasError) {
    console.log('Erro salas:', salasError);
  } else {
    console.log('Salas encontradas:', salas?.length || 0);
    salas?.forEach(s => console.log(`  - ${s.id}: ${s.nome} (Unidade: ${s.unidade_id})`));
  }
  
  // 3. Testar especialidades
  console.log('\n3. Especialidades:');
  const { data: especialidades, error: espError } = await supabase
    .from('especialidades')
    .select('*')
    .eq('ativo', true)
    .limit(5);
  
  if (espError) {
    console.log('Erro especialidades:', espError);
  } else {
    console.log('Especialidades encontradas:', especialidades?.length || 0);
    especialidades?.forEach(e => console.log(`  - ${e.id}: ${e.nome}`));
  }
  
  // 4. Testar query completa como no componente
  console.log('\n4. Query completa (como no componente):');
  if (unidades && unidades.length > 0) {
    const primeiraUnidade = unidades[0].id;
    console.log(`Testando com unidade: ${primeiraUnidade}`);
    
    const { data: salasCompletas, error: queryError } = await supabase
      .from('salas')
      .select(`
        *,
        especialidades(
          id,
          nome,
          cor
        ),
        profissionais_salas(
          id,
          profissional_id,
          turno,
          data_inicio,
          data_fim,
          ativo,
          profissionais:profissional_id(
            id,
            nome
          )
        )
      `)
      .eq('unidade_id', primeiraUnidade)
      .eq('ativo', true)
      .limit(3);
    
    if (queryError) {
      console.log('Erro query completa:', queryError);
    } else {
      console.log('Salas completas encontradas:', salasCompletas?.length || 0);
      salasCompletas?.forEach(s => {
        console.log(`  - ${s.nome} | Especialidade: ${s.especialidades?.nome || 'N/A'} | Prof: ${s.profissionais_salas?.length || 0}`);
      });
    }
  }
  
  // 5. Verificar se há problema com o campo especialidade_id sendo null
  console.log('\n5. Salas com especialidade_id null:');
  const { data: salasNull, error: nullError } = await supabase
    .from('salas')
    .select('id, nome, especialidade_id')
    .is('especialidade_id', null)
    .eq('ativo', true)
    .limit(5);
  
  if (nullError) {
    console.log('Erro salas null:', nullError);
  } else {
    console.log('Salas com especialidade_id null:', salasNull?.length || 0);
    salasNull?.forEach(s => console.log(`  - ${s.nome}: especialidade_id = ${s.especialidade_id}`));
  }
}

testQuery().catch(console.error);
