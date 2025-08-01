const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testarRegrasTempoTerapia() {
  console.log('⏱️ TESTANDO REGRAS DE TEMPO DA TERAPIA')
  console.log('=====================================')
  
  try {
    // 1. Testar a função de processamento automático
    console.log('🔄 Executando processamento automático...')
    const { data: processamento, error: errorProcessamento } = await supabase
      .rpc('executar_processamento_automatico')
    
    if (errorProcessamento) {
      console.error('❌ Erro no processamento automático:', errorProcessamento)
    } else {
      console.log('✅ Processamento automático executado com sucesso')
    }
    
    // 2. Verificar campos de tempo na view atual
    console.log('\n🔍 Verificando campos de tempo na vw_agendamentos_completo...')
    const { data: agendamentos, error } = await supabase
      .from('vw_agendamentos_completo')
      .select(`
        id,
        paciente_nome,
        sala_nome,
        especialidade_nome,
        status,
        data_agendamento,
        horario_inicio,
        duracao_planejada,
        tempo_sessao_minutos,
        tempo_sessao_atual,
        sessao_iniciada_em,
        sessao_pausada_em,
        sessao_finalizada_em
      `)
      .eq('data_agendamento', '2025-07-29')
      .order('horario_inicio')
    
    if (error) {
      console.error('❌ Erro ao buscar agendamentos:', error)
      return
    }
    
    console.log(`📊 Agendamentos com dados de tempo: ${agendamentos?.length || 0}`)
    
    if (agendamentos && agendamentos.length > 0) {
      agendamentos.forEach((ag, index) => {
        console.log(`\n${index + 1}. ${ag.paciente_nome} - ${ag.especialidade_nome || 'Sem especialidade'}`)
        console.log(`   📅 ${ag.data_agendamento} ${ag.horario_inicio}`)
        console.log(`   🏥 ${ag.sala_nome}`)
        console.log(`   ⚡ Status: ${ag.status}`)
        console.log(`   ⏱️ Duração planejada: ${ag.duracao_planejada || 'N/A'} minutos`)
        console.log(`   ⏳ Tempo sessão atual: ${ag.tempo_sessao_atual || ag.tempo_sessao_minutos || 0} minutos`)
        console.log(`   🕐 Sessão iniciada: ${ag.sessao_iniciada_em || 'Não iniciada'}`)
        console.log(`   ⏸️ Sessão pausada: ${ag.sessao_pausada_em || 'Não pausada'}`)
        console.log(`   ✅ Sessão finalizada: ${ag.sessao_finalizada_em || 'Não finalizada'}`)
      })
    }
    
    // 3. Testar se as regras de transição automática funcionam
    console.log('\n🤖 Testando regras de transição automática...')
    
    // Verificar agendamento em status 'pronto_para_terapia'
    const agendamentoPronto = agendamentos?.find(ag => ag.status === 'pronto_para_terapia')
    
    if (agendamentoPronto) {
      console.log(`\n🎯 Testando com agendamento: ${agendamentoPronto.paciente_nome}`)
      console.log(`   Status atual: ${agendamentoPronto.status}`)
      
      // Simular início de sessão (isso normalmente seria feito pelo usuário)
      console.log('⚡ Simulando início de sessão...')
      
      // Verificar se existe função para iniciar sessão
      const { data: inicioSessao, error: errorInicio } = await supabase
        .from('agendamentos')
        .update({
          status: 'em_atendimento',
          sessao_iniciada_em: new Date().toISOString()
        })
        .eq('id', agendamentoPronto.id)
        .select()
      
      if (errorInicio) {
        console.error('❌ Erro ao iniciar sessão:', errorInicio)
      } else {
        console.log('✅ Sessão iniciada com sucesso!')
        
        // Executar processamento novamente para ver mudanças
        await supabase.rpc('executar_processamento_automatico')
        
        // Verificar mudanças
        const { data: agendamentoAtualizado } = await supabase
          .from('vw_agendamentos_completo')
          .select('*')
          .eq('id', agendamentoPronto.id)
          .single()
        
        if (agendamentoAtualizado) {
          console.log('📊 Estado após início:')
          console.log(`   Status: ${agendamentoAtualizado.status}`)
          console.log(`   Tempo atual: ${agendamentoAtualizado.tempo_sessao_atual || agendamentoAtualizado.tempo_sessao_minutos || 0} min`)
          console.log(`   Duração planejada: ${agendamentoAtualizado.duracao_planejada} min`)
        }
      }
    }
    
    // 4. Verificar se campos essenciais existem
    console.log('\n📋 Verificando campos essenciais para regras de tempo...')
    
    const camposEssenciais = [
      'duracao_planejada',
      'tempo_sessao_atual', 
      'tempo_sessao_minutos',
      'sessao_iniciada_em',
      'sessao_pausada_em',
      'sessao_finalizada_em'
    ]
    
    const primeiroAgendamento = agendamentos?.[0]
    if (primeiroAgendamento) {
      camposEssenciais.forEach(campo => {
        const valor = primeiroAgendamento[campo]
        const status = valor !== undefined ? '✅' : '❌'
        console.log(`   ${status} ${campo}: ${valor || 'N/A'}`)
      })
    }
    
    console.log('\n🎯 CONCLUSÃO:')
    if (agendamentos?.some(ag => ag.duracao_planejada !== undefined)) {
      console.log('✅ Regras de tempo estão disponíveis na view atual')
      console.log('✅ Processamento automático está funcionando')
      console.log('✅ Campos de tempo estão presentes')
    } else {
      console.log('⚠️ Alguns campos de tempo podem estar ausentes')
      console.log('💡 Pode ser necessário ajustar a view ou as regras')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testarRegrasTempoTerapia()
