require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function investigarViewAgenda() {
  console.log('🔍 INVESTIGANDO A VIEW DA AGENDA');
  console.log('=================================');
  
  try {
    // Tentar buscar apenas alguns registros sem filtros para ver a estrutura
    console.log('📊 Buscando estrutura da view vw_agenda_tempo_real_automatica...');
    
    const { data: agendamentosAgenda, error: errorAgenda } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(3);
    
    if (errorAgenda) {
      console.error('❌ Erro ao acessar view:', errorAgenda);
    } else {
      console.log('✅ View acessível! Registros encontrados:', agendamentosAgenda?.length || 0);
      
      if (agendamentosAgenda && agendamentosAgenda.length > 0) {
        console.log('\n📋 ESTRUTURA DA VIEW:');
        const campos = Object.keys(agendamentosAgenda[0]);
        campos.forEach((campo, i) => {
          console.log(`  ${i+1}. ${campo}: ${typeof agendamentosAgenda[0][campo]} (${agendamentosAgenda[0][campo]})`);
        });
        
        console.log('\n📋 EXEMPLOS DE DADOS:');
        agendamentosAgenda.forEach((ag, i) => {
          console.log(`\nRegistro ${i+1}:`);
          Object.entries(ag).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        });
      } else {
        console.log('📋 View vazia, vamos tentar buscar qualquer coisa...');
        
        // Tentar count
        const { count, error: countError } = await supabase
          .from('vw_agenda_tempo_real_automatica')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('❌ Erro no count:', countError);
        } else {
          console.log('📊 Total de registros na view:', count);
        }
      }
    }
    
    // Também vamos verificar se existe campo similar
    console.log('\n🔍 Tentando diferentes filtros de data...');
    
    const possiveisCamposData = ['data', 'data_consulta', 'data_sessao', 'created_at', 'horario_inicio'];
    
    for (const campo of possiveisCamposData) {
      try {
        console.log(`\n🧪 Testando campo: ${campo}`);
        const { data: teste, error: erroTeste } = await supabase
          .from('vw_agenda_tempo_real_automatica')
          .select(campo)
          .limit(1);
        
        if (erroTeste) {
          console.log(`  ❌ ${campo}: ${erroTeste.message}`);
        } else {
          console.log(`  ✅ ${campo}: Existe! Valor exemplo: ${teste?.[0]?.[campo]}`);
        }
      } catch (error) {
        console.log(`  ❌ ${campo}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

investigarViewAgenda();
