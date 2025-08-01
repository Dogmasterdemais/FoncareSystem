require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verificarEstruturasViews() {
  console.log('🔍 VERIFICANDO ESTRUTURAS DAS VIEWS');
  console.log('==================================');
  
  try {
    // Buscar amostra da view agenda
    console.log('\n🔍 Estrutura vw_agenda_tempo_real_automatica:');
    const { data: sampleAgenda, error: errorAgenda } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(1);
    
    if (errorAgenda) {
      console.error('❌ Erro:', errorAgenda);
    } else if (sampleAgenda && sampleAgenda[0]) {
      console.log('✅ Campos encontrados:');
      const campos = Object.keys(sampleAgenda[0]).sort();
      campos.forEach(campo => {
        console.log(`  - ${campo}: ${sampleAgenda[0][campo]}`);
      });
      
      // Procurar campos relacionados a data
      console.log('\n📅 Campos relacionados a data:');
      const camposData = campos.filter(campo => 
        campo.toLowerCase().includes('data') || 
        campo.toLowerCase().includes('date') ||
        campo.toLowerCase().includes('agendamento')
      );
      camposData.forEach(campo => {
        console.log(`  - ${campo}: ${sampleAgenda[0][campo]}`);
      });
    } else {
      console.log('⚠️ Nenhum registro encontrado na view');
    }
    
    // Tentar buscar sem filtro de data
    console.log('\n🔍 Buscando todos os registros da view agenda:');
    const { data: todosRegistros, error: errorTodos } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(5);
    
    if (errorTodos) {
      console.error('❌ Erro:', errorTodos);
    } else {
      console.log(`✅ Total de registros encontrados: ${todosRegistros?.length || 0}`);
      todosRegistros?.forEach((registro, index) => {
        console.log(`\n📋 Registro ${index + 1}:`);
        Object.keys(registro).forEach(key => {
          console.log(`  ${key}: ${registro[key]}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarEstruturasViews();
