const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function analisarConflito() {
  console.log('⚠️ ANÁLISE DO CONFLITO DE AGENDAMENTO')
  console.log('====================================')
  
  try {
    // Buscar agendamentos recentes
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(`
        id,
        paciente_id,
        sala_id,
        data_agendamento,
        horario_inicio,
        horario_fim,
        status,
        created_at
      `)
      .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString()) // últimas 24h
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    console.log(`📊 Agendamentos das últimas 24h: ${agendamentos?.length || 0}`)
    
    if (agendamentos && agendamentos.length > 0) {
      agendamentos.forEach((ag, i) => {
        const data = new Date(ag.created_at).toLocaleString('pt-BR')
        console.log(`${i+1}. ID: ${ag.id.substring(0,8)}...`)
        console.log(`   📅 ${ag.data_agendamento} ${ag.horario_inicio}-${ag.horario_fim}`)
        console.log(`   🏥 Sala: ${ag.sala_id.substring(0,8)}...`)
        console.log(`   ⚡ Status: ${ag.status}`)
        console.log(`   🕐 Criado: ${data}`)
        console.log('')
      })
      
      // Verificar conflitos
      const grupos = {}
      agendamentos.forEach(ag => {
        const chave = `${ag.sala_id}_${ag.data_agendamento}_${ag.horario_inicio}`
        if (!grupos[chave]) grupos[chave] = []
        grupos[chave].push(ag)
      })
      
      console.log('🔍 Verificando conflitos...')
      let encontrouConflito = false
      
      for (const [chave, lista] of Object.entries(grupos)) {
        if (lista.length > 1) {
          encontrouConflito = true
          console.log(`❌ CONFLITO: ${lista.length} agendamentos no mesmo horário/sala`)
          lista.forEach(ag => {
            console.log(`   - ${ag.id.substring(0,8)}... (${ag.status})`)
          })
        }
      }
      
      if (!encontrouConflito) {
        console.log('✅ Nenhum conflito real detectado')
      }
    }
    
    console.log('\n💡 SOLUÇÕES PARA O ERRO:')
    console.log('=========================')
    console.log('1. ✅ Escolher SALA DIFERENTE no mesmo horário')
    console.log('2. ✅ Escolher HORÁRIO DIFERENTE na mesma sala')  
    console.log('3. ✅ Verificar se já existe agendamento no horário desejado')
    console.log('4. ⚠️ Se for sessão compartilhada, configurar corretamente')
    
    console.log('\n🎯 O erro "unique_sala_horario" é uma PROTEÇÃO do sistema')
    console.log('   Evita duplos agendamentos na mesma sala/horário')
    console.log('   Isso é NORMAL e DESEJÁVEL para controle operacional')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

analisarConflito()
