const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarConflitosAgendamento() {
  console.log('⚠️ ANALISANDO CONFLITO DE AGENDAMENTO')
  console.log('====================================')
  
  try {
    // 1. Verificar agendamentos atuais
    console.log('🔍 Verificando agendamentos existentes...')
    const { data: agendamentos, error } = await supabase
      .from('vw_agendamentos_completo')
      .select(`
        id,
        paciente_nome,
        sala_id,
        sala_nome,
        sala_numero,
        data_agendamento,
        horario_inicio,
        horario_fim,
        status,
        especialidade_nome,
        created_at
      `)
      .gte('data_agendamento', '2025-07-29')
      .lte('data_agendamento', '2025-07-30')
      .order('data_agendamento')
      .order('horario_inicio')
    
    if (error) {
      console.error('❌ Erro ao buscar agendamentos:', error)
      return
    }
    
    console.log(`📊 Total de agendamentos encontrados: ${agendamentos?.length || 0}`)
    
    if (agendamentos && agendamentos.length > 0) {
      console.log('\n📋 Agendamentos atuais:')
      agendamentos.forEach((ag, index) => {
        const criadoEm = new Date(ag.created_at).toLocaleString('pt-BR')
        console.log(`${index + 1}. ${ag.paciente_nome}`)
        console.log(`   📅 ${ag.data_agendamento} | ⏰ ${ag.horario_inicio}-${ag.horario_fim}`)
        console.log(`   🏥 ${ag.sala_nome} (${ag.sala_numero || 'S/N'})`)
        console.log(`   🎯 ${ag.especialidade_nome || 'Sem especialidade'} | Status: ${ag.status}`)
        console.log(`   🕐 Criado em: ${criadoEm}`)
        console.log('   ─────────────────────────────────────────')
      })
    }
    
    // 2. Identificar conflitos potenciais
    console.log('\n🔍 Analisando conflitos de horário...')
    
    const conflitos = new Map()
    
    agendamentos?.forEach(ag => {
      const chave = `${ag.sala_id}_${ag.data_agendamento}_${ag.horario_inicio}`
      
      if (conflitos.has(chave)) {
        conflitos.get(chave).push(ag)
      } else {
        conflitos.set(chave, [ag])
      }
    })
    
    let temConflitos = false
    for (const [chave, lista] of conflitos) {
      if (lista.length > 1) {
        temConflitos = true
        const [salaId, data, horario] = chave.split('_')
        console.log(`❌ CONFLITO DETECTADO: ${data} ${horario}`)
        console.log(`   🏥 Sala: ${lista[0].sala_nome}`)
        lista.forEach((ag, i) => {
          console.log(`   ${i + 1}. ${ag.paciente_nome} (${ag.especialidade_nome || 'S/E'})`)
        })
        console.log('')
      }
    }
    
    if (!temConflitos) {
      console.log('✅ Nenhum conflito detectado nos agendamentos existentes')
    }
    
    // 3. Verificar a constraint
    console.log('\n🔍 Verificando constraint unique_sala_horario...')
    
    const { data: constraints, error: errorConstraints } = await supabase
      .rpc('exec_sql', {
        sql: `
        SELECT 
          constraint_name,
          constraint_type,
          table_name
        FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%unique_sala_horario%'
        OR constraint_name LIKE '%sala%horario%';
        `
      })
    
    if (errorConstraints) {
      console.log('⚠️ Não foi possível verificar constraints via RPC')
    } else if (constraints && constraints.length > 0) {
      console.log('📋 Constraints encontradas:')
      constraints.forEach(c => {
        console.log(`   - ${c.constraint_name} (${c.constraint_type}) na tabela ${c.table_name}`)
      })
    }
    
    // 4. Sugerir soluções
    console.log('\n💡 SOLUÇÕES POSSÍVEIS:')
    console.log('======================')
    
    console.log('✅ OPÇÃO 1: Agendar em SALA DIFERENTE')
    console.log('   - Escolher outra sala disponível no mesmo horário')
    console.log('   - Manter o horário desejado')
    
    console.log('\n✅ OPÇÃO 2: Agendar em HORÁRIO DIFERENTE')
    console.log('   - Escolher outro horário na mesma sala')
    console.log('   - Manter a sala desejada')
    
    console.log('\n✅ OPÇÃO 3: SESSÃO COMPARTILHADA (se aplicável)')
    console.log('   - Dois pacientes na mesma sala/horário')
    console.log('   - Precisa configurar como "compartilhada"')
    
    console.log('\n⚠️ OPÇÃO 4: REMOVER CONSTRAINT (não recomendado)')
    console.log('   - Permitiria conflitos de agendamento')
    console.log('   - Pode causar problemas operacionais')
    
    // 5. Mostrar salas disponíveis
    console.log('\n🏥 Verificando salas disponíveis...')
    
    const { data: salas, error: errorSalas } = await supabase
      .from('salas')
      .select('id, nome, numero, tipo, cor, ativo')
      .eq('ativo', true)
      .order('numero')
    
    if (salas && salas.length > 0) {
      console.log(`📊 ${salas.length} salas disponíveis para agendamento:`)
      
      salas.slice(0, 10).forEach((sala, index) => {
        console.log(`${index + 1}. ${sala.nome} (${sala.numero || 'S/N'}) - ${sala.tipo}`)
      })
      
      if (salas.length > 10) {
        console.log(`   ... e mais ${salas.length - 10} salas`)
      }
    }
    
    console.log('\n🎯 RECOMENDAÇÃO:')
    console.log('================')
    console.log('✅ Tente agendar o segundo paciente em uma SALA DIFERENTE')
    console.log('✅ Ou escolha um HORÁRIO DIFERENTE na mesma sala')
    console.log('✅ O sistema está protegendo contra conflitos de agendamento')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verificarConflitosAgendamento()
