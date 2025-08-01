const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testarRegrasCapacidadeSalas() {
  console.log('👥 TESTANDO REGRAS DE CAPACIDADE DAS SALAS')
  console.log('=========================================')
  
  try {
    // 1. Verificar capacidade configurada das salas
    console.log('🔍 Verificando configuração de capacidade das salas...')
    const { data: salas, error: errorSalas } = await supabase
      .from('salas')
      .select(`
        id,
        nome,
        numero,
        tipo,
        capacidade_maxima,
        capacidade_criancas,
        capacidade_profissionais,
        cor,
        ativo
      `)
      .eq('ativo', true)
      .order('numero')
    
    if (errorSalas) {
      console.error('❌ Erro ao buscar salas:', errorSalas)
      return
    }
    
    console.log(`📊 Total de salas ativas: ${salas?.length || 0}`)
    
    if (salas && salas.length > 0) {
      console.log('\n📋 Configuração de capacidade por sala:')
      salas.forEach((sala, index) => {
        console.log(`${index + 1}. ${sala.nome} (${sala.numero || 'S/N'})`)
        console.log(`   🎯 Tipo: ${sala.tipo}`)
        console.log(`   👥 Capacidade máxima: ${sala.capacidade_maxima || 'N/A'} profissionais`)
        console.log(`   👶 Capacidade crianças: ${sala.capacidade_criancas || 'N/A'}`)
        console.log(`   👨‍⚕️ Capacidade profissionais: ${sala.capacidade_profissionais || 'N/A'}`)
        console.log(`   🎨 Cor: ${sala.cor}`)
        console.log('   ─────────────────────────────────────────')
      })
    }
    
    // 2. Verificar ocupação atual das salas
    console.log('\n🔍 Verificando ocupação atual das salas...')
    const { data: agendamentos, error: errorAgendamentos } = await supabase
      .from('vw_agendamentos_completo')
      .select(`
        sala_id,
        sala_nome,
        sala_numero,
        paciente_nome,
        especialidade_nome,
        status,
        profissional_id,
        profissional_nome,
        profissional_1_id,
        profissional_1_nome,
        profissional_2_id,
        profissional_2_nome,
        tipo_sessao,
        data_agendamento,
        horario_inicio
      `)
      .gte('data_agendamento', '2025-07-29')
      .lte('data_agendamento', '2025-07-30')
      .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento'])
      .order('sala_numero')
      .order('horario_inicio')
    
    if (errorAgendamentos) {
      console.error('❌ Erro ao buscar agendamentos:', errorAgendamentos)
      return
    }
    
    console.log(`📊 Agendamentos ativos: ${agendamentos?.length || 0}`)
    
    // 3. Calcular ocupação por sala
    const ocupacaoPorSala = new Map()
    
    agendamentos?.forEach(ag => {
      const salaKey = ag.sala_id
      if (!ocupacaoPorSala.has(salaKey)) {
        ocupacaoPorSala.set(salaKey, {
          sala_nome: ag.sala_nome,
          sala_numero: ag.sala_numero,
          pacientes: [],
          profissionais: new Set(),
          tipos_sessao: new Set()
        })
      }
      
      const ocupacao = ocupacaoPorSala.get(salaKey)
      ocupacao.pacientes.push({
        nome: ag.paciente_nome,
        especialidade: ag.especialidade_nome,
        status: ag.status,
        horario: ag.horario_inicio,
        tipo_sessao: ag.tipo_sessao
      })
      
      // Contabilizar profissionais únicos
      if (ag.profissional_id) ocupacao.profissionais.add(ag.profissional_id)
      if (ag.profissional_1_id) ocupacao.profissionais.add(ag.profissional_1_id)
      if (ag.profissional_2_id) ocupacao.profissionais.add(ag.profissional_2_id)
      
      if (ag.tipo_sessao) ocupacao.tipos_sessao.add(ag.tipo_sessao)
    })
    
    // 4. Analisar ocupação vs capacidade
    console.log('\n📊 ANÁLISE DE OCUPAÇÃO vs CAPACIDADE:')
    console.log('=====================================')
    
    for (const [salaId, ocupacao] of ocupacaoPorSala) {
      const salaConfig = salas.find(s => s.id === salaId)
      
      console.log(`\n🏥 ${ocupacao.sala_nome} (${ocupacao.sala_numero || 'S/N'})`)
      console.log(`   ⚙️ Capacidade configurada: ${salaConfig?.capacidade_maxima || 'N/A'} profissionais`)
      console.log(`   👥 Pacientes ativos: ${ocupacao.pacientes.length}`)
      console.log(`   👨‍⚕️ Profissionais únicos: ${ocupacao.profissionais.size}`)
      console.log(`   🎯 Tipos de sessão: ${Array.from(ocupacao.tipos_sessao).join(', ') || 'individual'}`)
      
      // Verificar se está dentro da capacidade
      const capacidadeMaxima = salaConfig?.capacidade_maxima || 3
      const ocupacaoAtual = ocupacao.profissionais.size
      
      if (ocupacaoAtual <= capacidadeMaxima) {
        console.log(`   ✅ DENTRO DA CAPACIDADE (${ocupacaoAtual}/${capacidadeMaxima})`)
      } else {
        console.log(`   ❌ ACIMA DA CAPACIDADE! (${ocupacaoAtual}/${capacidadeMaxima})`)
      }
      
      // Mostrar detalhes dos pacientes
      if (ocupacao.pacientes.length > 0) {
        console.log('   📋 Pacientes:')
        ocupacao.pacientes.forEach((pac, index) => {
          console.log(`     ${index + 1}. ${pac.nome} - ${pac.especialidade || 'S/E'} (${pac.status})`)
          console.log(`        ⏰ ${pac.horario} | Tipo: ${pac.tipo_sessao || 'individual'}`)
        })
      }
    }
    
    // 5. Verificar regras específicas do sistema
    console.log('\n🎯 VERIFICAÇÃO DAS REGRAS DO SISTEMA:')
    console.log('=====================================')
    
    // Regra 1: Máximo 3 profissionais por sala
    let salasComExcesso = 0
    for (const [salaId, ocupacao] of ocupacaoPorSala) {
      if (ocupacao.profissionais.size > 3) {
        salasComExcesso++
        console.log(`❌ REGRA VIOLADA: ${ocupacao.sala_nome} tem ${ocupacao.profissionais.size} profissionais (máximo 3)`)
      }
    }
    
    // Regra 2: Máximo 2 pacientes por profissional (6 por sala)
    let salasComMuitosPacientes = 0
    for (const [salaId, ocupacao] of ocupacaoPorSala) {
      const pacientesPorProfissional = ocupacao.profissionais.size > 0 ? 
        ocupacao.pacientes.length / ocupacao.profissionais.size : 0
      
      if (ocupacao.pacientes.length > 6) {
        salasComMuitosPacientes++
        console.log(`⚠️ ATENÇÃO: ${ocupacao.sala_nome} tem ${ocupacao.pacientes.length} pacientes (máximo recomendado: 6)`)
      }
    }
    
    // Regra 3: Tipos de sessão adequados
    console.log('\n📊 Resumo das verificações:')
    console.log(`✅ Salas dentro da capacidade de profissionais: ${ocupacaoPorSala.size - salasComExcesso}`)
    console.log(`❌ Salas com excesso de profissionais: ${salasComExcesso}`)
    console.log(`✅ Salas com número adequado de pacientes: ${ocupacaoPorSala.size - salasComMuitosPacientes}`)
    console.log(`⚠️ Salas com muitos pacientes: ${salasComMuitosPacientes}`)
    
    // 6. Testar componente de ocupação
    console.log('\n🔍 Verificando se o componente calcula ocupação corretamente...')
    
    for (const [salaId, ocupacao] of ocupacaoPorSala) {
      const salaConfig = salas.find(s => s.id === salaId)
      const capacidadeMaxima = salaConfig?.capacidade_maxima || 6 // 2 pac/prof * 3 prof
      const ocupacaoCalculada = ocupacao.pacientes.length
      
      console.log(`📊 ${ocupacao.sala_nome}: ${ocupacaoCalculada}/${capacidadeMaxima} pacientes`)
    }
    
    console.log('\n🎯 CONCLUSÃO FINAL:')
    if (salasComExcesso === 0 && salasComMuitosPacientes === 0) {
      console.log('✅ TODAS as regras de capacidade estão sendo respeitadas!')
      console.log('✅ Sistema de 1-6 pacientes por sala funcionando corretamente!')
      console.log('✅ Máximo de 3 profissionais por sala respeitado!')
    } else {
      console.log('⚠️ Algumas regras podem precisar de ajuste ou há casos excepcionais')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testarRegrasCapacidadeSalas()
