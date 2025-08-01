const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não encontradas!');
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarAlocacaoSalas() {
  console.log('🔍 === TESTE DE ALOCAÇÃO NAS SALAS ===\n');
  
  // TESTE 1: Verificar se a função de 30 minutos existe e funciona
  console.log('1️⃣ TESTANDO REGRA DOS 30 MINUTOS...');
  try {
    console.log('🔄 Executando função executar_processamento_automatico...');
    const { data: resultadoProcessamento, error: erroProcessamento } = await supabase
      .rpc('executar_processamento_automatico');
    
    if (erroProcessamento) {
      console.log('❌ Função de 30 minutos FALHOU:', erroProcessamento.message);
      console.log('📝 Possíveis causas:');
      console.log('   • Função não existe no banco de dados');
      console.log('   • Permissões insuficientes');
      console.log('   • Erro na lógica da função');
    } else {
      console.log('✅ Função de 30 minutos FUNCIONOU!');
      console.log('📊 Resultado:', resultadoProcessamento);
    }
  } catch (e) {
    console.log('❌ Erro inesperado na função de 30 minutos:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // TESTE 2: Verificar nomes dos profissionais alocados nas salas
  console.log('2️⃣ TESTANDO NOMES DOS PROFISSIONAIS...');
  
  const dataHoje = new Date().toISOString().split('T')[0];
  console.log(`📅 Data de referência: ${dataHoje}`);
  
  try {
    console.log('🔄 Buscando profissionais alocados nas salas...');
    const { data: profissionaisSalas, error: erroProfissionaisSalas } = await supabase
      .from('profissionais_salas')
      .select(`
        sala_id,
        profissional_id,
        turno,
        ativo,
        data_inicio,
        data_fim,
        profissionais(
          id,
          nome,
          ativo,
          especialidades(
            nome,
            cor
          )
        ),
        salas(
          id,
          numero,
          nome,
          unidade_id
        )
      `)
      .eq('ativo', true)
      .lte('data_inicio', dataHoje)
      .or(`data_fim.is.null,data_fim.gte.${dataHoje}`);

    if (erroProfissionaisSalas) {
      console.log('❌ ERRO ao buscar profissionais nas salas:', erroProfissionaisSalas.message);
    } else {
      console.log(`📊 Encontrados ${profissionaisSalas?.length || 0} registros de profissionais alocados`);
      
      if (profissionaisSalas && profissionaisSalas.length > 0) {
        console.log('\n📋 DETALHES DOS PROFISSIONAIS ALOCADOS:');
        profissionaisSalas.forEach((ps, index) => {
          console.log(`\n${index + 1}. Alocação:`);
          console.log(`   🏢 Sala: ${ps.salas?.numero} - ${ps.salas?.nome}`);
          console.log(`   👨‍⚕️ Profissional ID: ${ps.profissional_id}`);
          console.log(`   📛 Nome: ${ps.profissionais?.nome || '❌ NOME NÃO ENCONTRADO'}`);
          console.log(`   🎯 Especialidade: ${ps.profissionais?.especialidades?.[0]?.nome || '❌ ESPECIALIDADE NÃO ENCONTRADA'}`);
          console.log(`   🕐 Turno: ${ps.turno}`);
          console.log(`   ✅ Ativo: ${ps.ativo}`);
          console.log(`   📅 Período: ${ps.data_inicio} até ${ps.data_fim || 'indefinido'}`);
        });
        
        // Analisar problemas
        const semNome = profissionaisSalas.filter(ps => !ps.profissionais?.nome);
        const semEspecialidade = profissionaisSalas.filter(ps => !ps.profissionais?.especialidades?.[0]?.nome);
        
        console.log('\n🔍 ANÁLISE DE PROBLEMAS:');
        console.log(`❌ Profissionais sem nome: ${semNome.length}`);
        console.log(`❌ Profissionais sem especialidade: ${semEspecialidade.length}`);
        
        if (semNome.length > 0) {
          console.log('\n📝 IDs dos profissionais sem nome:');
          semNome.forEach(ps => {
            console.log(`   • ID ${ps.profissional_id} na sala ${ps.salas?.numero}`);
          });
        }
        
        if (semEspecialidade.length > 0) {
          console.log('\n📝 IDs dos profissionais sem especialidade:');
          semEspecialidade.forEach(ps => {
            console.log(`   • ID ${ps.profissional_id} (${ps.profissionais?.nome || 'Sem nome'}) na sala ${ps.salas?.numero}`);
          });
        }
        
      } else {
        console.log('⚠️ NENHUM profissional alocado encontrado!');
        console.log('📝 Possíveis causas:');
        console.log('   • Tabela profissionais_salas vazia');
        console.log('   • Filtros de data muito restritivos');
        console.log('   • Todos os registros têm ativo=false');
      }
    }
  } catch (e) {
    console.log('❌ Erro inesperado ao buscar profissionais:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // TESTE 3: Verificar especialidades na tabela colaboradores
  console.log('3️⃣ TESTANDO ESPECIALIDADES DOS COLABORADORES...');
  
  try {
    console.log('🔄 Buscando colaboradores ativos com cargos...');
    const { data: colaboradores, error: erroColaboradores } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, cargo, status')
      .eq('status', 'ativo');

    if (erroColaboradores) {
      console.log('❌ ERRO ao buscar colaboradores:', erroColaboradores.message);
    } else {
      console.log(`📊 Encontrados ${colaboradores?.length || 0} colaboradores ativos`);
      
      if (colaboradores && colaboradores.length > 0) {
        const comCargo = colaboradores.filter(c => c.cargo && c.cargo.trim() !== '');
        const semCargo = colaboradores.filter(c => !c.cargo || c.cargo.trim() === '');
        
        console.log(`✅ Com cargo/especialidade: ${comCargo.length}`);
        console.log(`❌ Sem cargo/especialidade: ${semCargo.length}`);
        
        console.log('\n📋 AMOSTRA DOS COLABORADORES COM CARGO:');
        comCargo.slice(0, 5).forEach((colaborador, index) => {
          console.log(`${index + 1}. ${colaborador.nome_completo} - ${colaborador.cargo}`);
        });
        
        if (semCargo.length > 0) {
          console.log('\n⚠️ COLABORADORES SEM CARGO (primeiros 5):');
          semCargo.slice(0, 5).forEach((colaborador, index) => {
            console.log(`${index + 1}. ${colaborador.nome_completo} - CARGO VAZIO`);
          });
        }
        
        // Verificar mapeamento de cargos únicos
        const cargosUnicos = [...new Set(comCargo.map(c => c.cargo))];
        console.log('\n🎯 CARGOS/ESPECIALIDADES ÚNICAS ENCONTRADAS:');
        cargosUnicos.forEach((cargo, index) => {
          const quantidade = comCargo.filter(c => c.cargo === cargo).length;
          console.log(`${index + 1}. ${cargo} (${quantidade} profissionais)`);
        });
        
      } else {
        console.log('⚠️ NENHUM colaborador ativo encontrado!');
      }
    }
  } catch (e) {
    console.log('❌ Erro inesperado ao buscar colaboradores:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // TESTE 4: Verificar agendamentos do dia com profissionais
  console.log('4️⃣ TESTANDO AGENDAMENTOS COM PROFISSIONAIS...');
  
  try {
    console.log('🔄 Buscando agendamentos do dia...');
    const { data: agendamentos, error: erroAgendamentos } = await supabase
      .from('agendamentos')
      .select(`
        id,
        paciente_nome,
        profissional_id,
        sala_id,
        horario_inicio,
        status,
        profissionais(
          id,
          nome
        ),
        salas(
          numero,
          nome
        )
      `)
      .eq('data_agendamento', dataHoje)
      .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento']);

    if (erroAgendamentos) {
      console.log('❌ ERRO ao buscar agendamentos:', erroAgendamentos.message);
    } else {
      console.log(`📊 Encontrados ${agendamentos?.length || 0} agendamentos para hoje`);
      
      if (agendamentos && agendamentos.length > 0) {
        console.log('\n📋 AMOSTRA DOS AGENDAMENTOS (primeiros 10):');
        agendamentos.slice(0, 10).forEach((agendamento, index) => {
          console.log(`\n${index + 1}. ${agendamento.paciente_nome}`);
          console.log(`   🕐 ${agendamento.horario_inicio} - Status: ${agendamento.status}`);
          console.log(`   🏢 Sala ${agendamento.salas?.numero} - ${agendamento.salas?.nome}`);
          console.log(`   👨‍⚕️ Profissional: ${agendamento.profissionais?.nome || '❌ NOME NÃO ENCONTRADO'} (ID: ${agendamento.profissional_id})`);
        });
        
        const semProfissional = agendamentos.filter(a => !a.profissionais?.nome);
        console.log(`\n❌ Agendamentos sem nome do profissional: ${semProfissional.length}`);
        
      } else {
        console.log('⚠️ NENHUM agendamento para hoje encontrado!');
      }
    }
  } catch (e) {
    console.log('❌ Erro inesperado ao buscar agendamentos:', e.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // RESUMO FINAL
  console.log('📊 === RESUMO DO DIAGNÓSTICO ===');
  console.log('1. ⏰ Função de 30 minutos: Verificada acima');
  console.log('2. 👨‍⚕️ Nomes dos profissionais: Verificados acima');
  console.log('3. 🎯 Especialidades: Verificadas acima');
  console.log('4. 📅 Agendamentos: Verificados acima');
  console.log('\n🔧 Execute este script para identificar os problemas específicos!');
}

// Executar o teste
testarAlocacaoSalas().catch(error => {
  console.error('❌ Erro fatal no teste:', error);
  process.exit(1);
});
