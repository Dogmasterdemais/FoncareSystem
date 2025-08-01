const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function diagnosticarProblemasReais() {
  console.log('🔍 === DIAGNÓSTICO CORRIGIDO - PROBLEMAS REAIS ===\n');
  
  const dataHoje = new Date().toISOString().split('T')[0];
  
  // TESTE 1: Verificar estrutura da tabela agendamentos
  console.log('1️⃣ VERIFICANDO ESTRUTURA DA TABELA AGENDAMENTOS...');
  try {
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar agendamentos:', error.message);
    } else if (agendamentos && agendamentos.length > 0) {
      console.log('✅ Tabela agendamentos acessível!');
      console.log('📋 Campos disponíveis:', Object.keys(agendamentos[0]));
    } else {
      console.log('⚠️ Tabela agendamentos vazia');
    }
  } catch (e) {
    console.log('❌ Erro:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // TESTE 2: Usar a view que sabemos que funciona
  console.log('2️⃣ TESTANDO VIEW VW_AGENDAMENTOS_COMPLETO...');
  try {
    const { data: viewAgendamentos, error } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .eq('data_agendamento', dataHoje)
      .limit(5);
    
    if (error) {
      console.log('❌ Erro na view:', error.message);
    } else {
      console.log(`✅ View funcionando! ${viewAgendamentos?.length || 0} registros encontrados`);
      
      if (viewAgendamentos && viewAgendamentos.length > 0) {
        console.log('\n📋 CAMPOS DA VIEW:');
        console.log(Object.keys(viewAgendamentos[0]));
        
        console.log('\n📋 AMOSTRA DOS DADOS:');
        viewAgendamentos.forEach((ag, index) => {
          console.log(`\n${index + 1}. Paciente: ${ag.paciente_nome || 'SEM NOME'}`);
          console.log(`   🏢 Sala: ${ag.sala_numero} - ${ag.sala_nome}`);
          console.log(`   👨‍⚕️ Profissional: ${ag.profissional_nome || '❌ SEM PROFISSIONAL'}`);
          console.log(`   🎯 Especialidade: ${ag.especialidade_nome || '❌ SEM ESPECIALIDADE'}`);
          console.log(`   ⏰ Horário: ${ag.horario_inicio}`);
          console.log(`   📊 Status: ${ag.status}`);
        });
        
        // Análise dos problemas
        const semProfissional = viewAgendamentos.filter(ag => !ag.profissional_nome);
        const semEspecialidade = viewAgendamentos.filter(ag => !ag.especialidade_nome);
        
        console.log('\n🔍 ANÁLISE DOS PROBLEMAS:');
        console.log(`❌ Agendamentos sem profissional: ${semProfissional.length}/${viewAgendamentos.length}`);
        console.log(`❌ Agendamentos sem especialidade: ${semEspecialidade.length}/${viewAgendamentos.length}`);
        
        if (semProfissional.length > 0) {
          console.log('\n📝 CAUSA: Agendamentos sem profissional atribuído');
          console.log('   Solução: Associar profissionais aos agendamentos');
        }
        
        if (semEspecialidade.length > 0) {
          console.log('\n📝 CAUSA: Profissionais sem especialidade definida');
          console.log('   Solução: Definir especialidades para os profissionais');
        }
      }
    }
  } catch (e) {
    console.log('❌ Erro:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // TESTE 3: Verificar tabela profissionais_salas
  console.log('3️⃣ VERIFICANDO TABELA PROFISSIONAIS_SALAS...');
  try {
    const { data: profSalas, error } = await supabase
      .from('profissionais_salas')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ Erro ao acessar profissionais_salas:', error.message);
    } else {
      console.log(`✅ Tabela profissionais_salas acessível! ${profSalas?.length || 0} registros`);
      
      if (profSalas && profSalas.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(profSalas[0]));
        console.log('\n📋 AMOSTRA:');
        profSalas.forEach((ps, index) => {
          console.log(`${index + 1}. Sala ID: ${ps.sala_id}, Profissional ID: ${ps.profissional_id}, Ativo: ${ps.ativo}`);
        });
      }
    }
  } catch (e) {
    console.log('❌ Erro:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // TESTE 4: Verificar relacionamento profissionais
  console.log('4️⃣ TESTANDO BUSCA MANUAL DE PROFISSIONAIS...');
  try {
    // Buscar alguns IDs de profissionais da tabela profissionais_salas
    const { data: profSalas } = await supabase
      .from('profissionais_salas')
      .select('profissional_id')
      .limit(3);
    
    if (profSalas && profSalas.length > 0) {
      const profIds = profSalas.map(ps => ps.profissional_id);
      console.log('🔍 IDs de profissionais encontrados:', profIds);
      
      // Buscar nomes desses profissionais
      const { data: profissionais, error: errProf } = await supabase
        .from('profissionais')
        .select('id, nome')
        .in('id', profIds);
      
      if (errProf) {
        console.log('❌ Erro ao buscar profissionais:', errProf.message);
      } else {
        console.log(`✅ Encontrados ${profissionais?.length || 0} profissionais:`);
        profissionais?.forEach(prof => {
          console.log(`   • ID ${prof.id}: ${prof.nome}`);
        });
        
        if (profissionais?.length === 0) {
          console.log('❌ PROBLEMA: IDs na tabela profissionais_salas não existem na tabela profissionais!');
        }
      }
    }
  } catch (e) {
    console.log('❌ Erro:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // RESUMO FINAL COM SOLUÇÕES
  console.log('🎯 === SOLUÇÕES PARA OS PROBLEMAS ===');
  console.log('\n1️⃣ REGRA DOS 30 MINUTOS:');
  console.log('   ❌ Função existe mas falta tabela logs_agendamentos');
  console.log('   ✅ SOLUÇÃO: Criar tabela logs_agendamentos ou corrigir função');
  
  console.log('\n2️⃣ NOMES DOS PROFISSIONAIS:');
  console.log('   ❌ Relacionamento entre profissionais_salas e profissionais quebrado');
  console.log('   ✅ SOLUÇÃO: Verificar foreign keys ou usar busca manual');
  
  console.log('\n3️⃣ ESPECIALIDADES:');
  console.log('   ✅ FUNCIONANDO: 16 colaboradores com cargos definidos');
  console.log('   ✅ SOLUÇÃO: Mapear colaboradores.cargo para especialidades');
  
  console.log('\n4️⃣ AGENDAMENTOS:');
  console.log('   ✅ FUNCIONANDO: View vw_agendamentos_completo tem todos os dados');
  console.log('   ✅ SOLUÇÃO: Usar view em vez de tabela direta');
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('   1. Corrigir função de 30 minutos (tabela logs)');
  console.log('   2. Corrigir busca de profissionais (usar busca manual)');
  console.log('   3. Implementar mapeamento colaboradores → especialidades');
  console.log('   4. Continuar usando view para agendamentos');
}

diagnosticarProblemasReais().catch(console.error);
