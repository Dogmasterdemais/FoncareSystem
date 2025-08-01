const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function investigarDadosAusentes() {
  console.log('🔍 INVESTIGANDO POR QUE A VIEW AGENDA ESTÁ VAZIA')
  console.log('===============================================')
  
  try {
    // 1. Verificar quantos agendamentos temos na tabela base
    const { data: totalAgendamentos, error: errorTotal } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact' })
    
    console.log(`📊 Total na tabela agendamentos: ${totalAgendamentos?.length || 0}`)
    
    // 2. Verificar os últimos agendamentos na tabela base
    const { data: ultimosAgendamentos, error: errorUltimos } = await supabase
      .from('agendamentos')
      .select('id, data_agendamento, horario_inicio, status, paciente_id')
      .order('created_at', { ascending: false })
      .limit(3)
    
    console.log('\n📋 Últimos agendamentos na tabela base:')
    ultimosAgendamentos?.forEach(ag => {
      console.log(`  - ${ag.data_agendamento} ${ag.horario_inicio} | Status: ${ag.status}`)
    })
    
    // 3. Verificar especificamente a view completa
    const { data: viewCompleta, error: errorCompleta } = await supabase
      .from('vw_agendamentos_completo')
      .select('data_agendamento, horario_inicio, status, paciente_nome')
      .order('created_at', { ascending: false })
      .limit(3)
    
    console.log('\n📋 Últimos na view completa:')
    viewCompleta?.forEach(ag => {
      console.log(`  - ${ag.data_agendamento} ${ag.horario_inicio} | ${ag.paciente_nome} | Status: ${ag.status}`)
    })
    
    // 4. Verificar se existem JOINs que podem estar causando problema na view agenda
    const { data: viewAgenda, error: errorAgenda } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(1)
    
    console.log(`\n📊 View agenda (primeira linha): ${JSON.stringify(viewAgenda, null, 2)}`)
    
    // 5. Verificar se há algum filtro implícito na view agenda
    console.log('\n🔍 Testando filtros na view agenda...')
    
    // Teste sem filtros
    const { data: semFiltro, error: errorSemFiltro } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('id')
    
    console.log(`📊 Registros sem filtro: ${semFiltro?.length || 0}`)
    
    // Teste com data específica
    const { data: comData, error: errorComData } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('id')
      .gte('data_agendamento', '2025-01-01')
    
    console.log(`📊 Registros com data >= 2025-01-01: ${comData?.length || 0}`)
    
    // 6. Comparar estruturas das views
    console.log('\n🔍 Verificando diferenças estruturais...')
    
    const { data: exemplo1 } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .limit(1)
    
    const { data: exemplo2 } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(1)
    
    console.log('\n📋 Campos view completa:', exemplo1?.[0] ? Object.keys(exemplo1[0]).join(', ') : 'Nenhum')
    console.log('📋 Campos view agenda:', exemplo2?.[0] ? Object.keys(exemplo2[0]).join(', ') : 'Nenhum')
    
    if (errorTotal) console.error('❌ Erro total:', errorTotal)
    if (errorUltimos) console.error('❌ Erro últimos:', errorUltimos)
    if (errorCompleta) console.error('❌ Erro view completa:', errorCompleta)
    if (errorAgenda) console.error('❌ Erro view agenda:', errorAgenda)
    if (errorSemFiltro) console.error('❌ Erro sem filtro:', errorSemFiltro)
    if (errorComData) console.error('❌ Erro com data:', errorComData)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

investigarDadosAusentes()
