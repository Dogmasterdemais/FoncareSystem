const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service role para acessar metadados
)

async function verificarDefinicaoViews() {
  console.log('🔍 VERIFICANDO DEFINIÇÃO DAS VIEWS')
  console.log('==================================')
  
  try {
    // Verificar se as views existem no schema
    const { data: views, error: errorViews } = await supabase
      .rpc('exec_sql', {
        sql: `
        SELECT 
          schemaname,
          viewname,
          definition
        FROM pg_views 
        WHERE viewname IN ('vw_agendamentos_completo', 'vw_agenda_tempo_real_automatica')
        ORDER BY viewname;
        `
      })
    
    if (errorViews) {
      console.log('❌ Erro ao buscar views via RPC, tentando outra abordagem...')
      
      // Tentar com query SQL direta
      const { data: tabelas, error: errorTabelas } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .like('table_name', '%agenda%')
      
      console.log('📋 Tabelas/Views relacionadas à agenda:')
      tabelas?.forEach(t => {
        console.log(`  - ${t.table_name} (${t.table_type})`)
      })
      
    } else {
      console.log('📋 Definições das views encontradas:')
      views?.forEach(v => {
        console.log(`\n📝 View: ${v.viewname}`)
        console.log(`📄 Definição: ${v.definition}`)
      })
    }
    
    // Verificar se conseguimos acessar as views diretamente
    console.log('\n🔍 Testando acesso direto às views...')
    
    const { data: test1, error: error1 } = await supabase
      .from('vw_agendamentos_completo')
      .select('id')
      .limit(1)
    
    console.log(`✅ vw_agendamentos_completo: ${test1?.length || 0} registros`)
    if (error1) console.log(`❌ Erro: ${error1.message}`)
    
    const { data: test2, error: error2 } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('id')
      .limit(1)
    
    console.log(`✅ vw_agenda_tempo_real_automatica: ${test2?.length || 0} registros`)
    if (error2) console.log(`❌ Erro: ${error2.message}`)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verificarDefinicaoViews()
