const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function analisarConstraintProblematica() {
  console.log('🔍 ANALISANDO CONSTRAINT PROBLEMÁTICA')
  console.log('====================================')
  
  try {
    // 1. Buscar a constraint atual
    console.log('🔍 Buscando constraints relacionadas a sala/horário...')
    
    // Tentar diferentes abordagens para encontrar a constraint
    const abordagens = [
      // Abordagem 1: Buscar na tabela agendamentos
      {
        nome: 'Busca direta na tabela agendamentos',
        sql: `
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = 'agendamentos' 
        AND (indexname LIKE '%unique%' OR indexname LIKE '%sala%' OR indexname LIKE '%horario%');
        `
      },
      // Abordagem 2: Buscar constraints
      {
        nome: 'Busca constraints',
        sql: `
        SELECT 
          constraint_name,
          constraint_type,
          table_name
        FROM information_schema.table_constraints 
        WHERE table_name = 'agendamentos'
        AND constraint_type = 'UNIQUE';
        `
      }
    ]
    
    for (const abordagem of abordagens) {
      console.log(`\n🔍 ${abordagem.nome}...`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: abordagem.sql
        })
        
        if (error) {
          console.log(`❌ Erro: ${error.message}`)
        } else if (data && data.length > 0) {
          console.log('📋 Resultados encontrados:')
          data.forEach(item => {
            console.log(`   - ${JSON.stringify(item)}`)
          })
        } else {
          console.log('📋 Nenhum resultado encontrado')
        }
      } catch (err) {
        console.log(`❌ Erro na execução: ${err.message}`)
      }
    }
    
    // 2. Tentar criar um agendamento de teste para capturar o erro exato
    console.log('\n🧪 Teste: Tentando criar agendamento duplicado para capturar erro...')
    
    // Buscar um agendamento existente
    const { data: agendamentoExistente } = await supabase
      .from('agendamentos')
      .select('sala_id, data_agendamento, horario_inicio, horario_fim')
      .limit(1)
    
    if (agendamentoExistente && agendamentoExistente.length > 0) {
      const ag = agendamentoExistente[0]
      console.log('📋 Agendamento de referência encontrado:')
      console.log(`   Sala: ${ag.sala_id}`)
      console.log(`   Data: ${ag.data_agendamento}`)
      console.log(`   Horário: ${ag.horario_inicio} - ${ag.horario_fim}`)
      
      // Tentar criar um agendamento conflitante
      console.log('\n🎯 Tentando criar agendamento no mesmo horário/sala...')
      
      const { data: teste, error: erroTeste } = await supabase
        .from('agendamentos')
        .insert({
          paciente_id: 'test-uuid-paciente',
          sala_id: ag.sala_id,
          data_agendamento: ag.data_agendamento,
          horario_inicio: ag.horario_inicio,
          horario_fim: ag.horario_fim,
          status: 'agendado',
          tipo_sessao: 'compartilhada'
        })
      
      if (erroTeste) {
        console.log('🎯 ERRO CAPTURADO:')
        console.log(`   Código: ${erroTeste.code}`)
        console.log(`   Mensagem: ${erroTeste.message}`)
        console.log(`   Detalhes: ${erroTeste.details || 'N/A'}`)
        console.log(`   Hint: ${erroTeste.hint || 'N/A'}`)
        
        // Extrair o nome da constraint do erro
        const match = erroTeste.message.match(/constraint "([^"]+)"/)
        if (match) {
          const constraintName = match[1]
          console.log(`\n🎯 CONSTRAINT IDENTIFICADA: ${constraintName}`)
          
          // Agora buscar detalhes desta constraint específica
          console.log('\n🔍 Buscando detalhes da constraint...')
          
          const { data: detalhes, error: erroDetalhes } = await supabase.rpc('exec_sql', {
            sql: `
            SELECT 
              conname as constraint_name,
              pg_get_constraintdef(oid) as definition,
              contype as type
            FROM pg_constraint 
            WHERE conname = '${constraintName}';
            `
          })
          
          if (!erroDetalhes && detalhes && detalhes.length > 0) {
            console.log('📋 Detalhes da constraint:')
            detalhes.forEach(det => {
              console.log(`   Nome: ${det.constraint_name}`)
              console.log(`   Tipo: ${det.type}`)
              console.log(`   Definição: ${det.definition}`)
            })
          }
        }
      } else {
        console.log('✅ Agendamento criado sem erro (isso seria inesperado)')
        // Limpar o teste
        await supabase
          .from('agendamentos')
          .delete()
          .eq('paciente_id', 'test-uuid-paciente')
      }
    }
    
    console.log('\n💡 DIAGNÓSTICO:')
    console.log('===============')
    console.log('A constraint está impedindo sessões compartilhadas')
    console.log('Precisamos MODIFICAR ou REMOVER a constraint')
    console.log('Para permitir múltiplos agendamentos na mesma sala/horário')
    
    console.log('\n🔧 SOLUÇÕES POSSÍVEIS:')
    console.log('======================')
    console.log('1. ✅ MODIFICAR constraint para permitir até 6 crianças')
    console.log('2. ✅ REMOVER constraint e implementar validação no código')
    console.log('3. ✅ CRIAR constraint mais inteligente (contar agendamentos)')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

analisarConstraintProblematica()
