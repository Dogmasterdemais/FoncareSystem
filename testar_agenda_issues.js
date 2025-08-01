const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testarAgendaIssues() {
  console.log('🔍 TESTANDO OS 3 PROBLEMAS DA AGENDA DE SALAS');
  console.log('=' .repeat(60));
  
  // 1. TESTAR REGRA DOS 30 MINUTOS
  console.log('\n1️⃣ TESTANDO REGRA DOS 30 MINUTOS');
  console.log('-'.repeat(40));
  
  try {
    console.log('🔄 Tentando executar função executar_processamento_automatico...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('executar_processamento_automatico');
    
    if (rpcError) {
      console.log('❌ PROBLEMA 1: Função executar_processamento_automatico não existe ou falhou');
      console.log('   Erro:', rpcError.message);
      console.log('   Código:', rpcError.code);
      console.log('   💡 SOLUÇÃO: Função de 30 minutos precisa ser criada no banco');
    } else {
      console.log('✅ Função executar_processamento_automatico funcionou');
      console.log('   Resultado:', rpcData);
    }
  } catch (error) {
    console.log('❌ PROBLEMA 1: Erro inesperado na função de 30 minutos');
    console.log('   Erro:', error.message);
  }
  
  // 2. TESTAR NOMES DOS PROFISSIONAIS NAS SALAS
  console.log('\n2️⃣ TESTANDO NOMES DOS PROFISSIONAIS NAS SALAS');
  console.log('-'.repeat(40));
  
  const dataHoje = new Date().toISOString().split('T')[0];
  console.log(`📅 Data de teste: ${dataHoje}`);
  
  try {
    // Buscar profissionais alocados nas salas
    console.log('🔄 Buscando profissionais_salas...');
    const { data: profissionaisSalas, error: errorProfSalas } = await supabase
      .from('profissionais_salas')
      .select(`
        sala_id,
        profissional_id,
        turno,
        profissionais(
          id,
          nome
        ),
        salas(
          id,
          numero,
          nome
        )
      `)
      .eq('ativo', true)
      .lte('data_inicio', dataHoje)
      .or(`data_fim.is.null,data_fim.gte.${dataHoje}`)
      .limit(10);
    
    if (errorProfSalas) {
      console.log('❌ PROBLEMA 2A: Erro ao buscar profissionais_salas');
      console.log('   Erro:', errorProfSalas.message);
    } else {
      console.log(`✅ Encontrados ${profissionaisSalas?.length || 0} registros de profissionais_salas`);
      
      if (profissionaisSalas && profissionaisSalas.length > 0) {
        console.log('\n📋 AMOSTRA DOS DADOS:');
        profissionaisSalas.slice(0, 3).forEach((ps, index) => {
          console.log(`   ${index + 1}. Sala ${ps.salas?.numero}: ${ps.profissionais?.nome || 'NOME VAZIO'}`);
          console.log(`      Estrutura completa:`, JSON.stringify(ps, null, 6));
        });
        
        // Verificar se há nomes vazios
        const nomesVazios = profissionaisSalas.filter(ps => !ps.profissionais?.nome);
        if (nomesVazios.length > 0) {
          console.log(`⚠️ PROBLEMA 2B: ${nomesVazios.length} profissionais sem nome encontrados`);
        } else {
          console.log('✅ Todos os profissionais têm nomes válidos');
        }
      } else {
        console.log('⚠️ PROBLEMA 2C: Nenhum profissional alocado encontrado');
        console.log('   💡 SOLUÇÃO: Verifique se há dados na tabela profissionais_salas');
      }
    }
  } catch (error) {
    console.log('❌ PROBLEMA 2D: Erro inesperado ao buscar profissionais');
    console.log('   Erro:', error.message);
  }
  
  // 3. TESTAR ESPECIALIDADES DOS PROFISSIONAIS
  console.log('\n3️⃣ TESTANDO ESPECIALIDADES DOS PROFISSIONAIS');
  console.log('-'.repeat(40));
  
  try {
    // Buscar alguns profissionais para testar especialidades
    console.log('🔄 Buscando profissionais para testar especialidades...');
    const { data: profissionais, error: errorProf } = await supabase
      .from('profissionais')
      .select('id, nome')
      .limit(5);
    
    if (errorProf) {
      console.log('❌ PROBLEMA 3A: Erro ao buscar profissionais');
      console.log('   Erro:', errorProf.message);
    } else if (!profissionais || profissionais.length === 0) {
      console.log('⚠️ PROBLEMA 3B: Nenhum profissional encontrado na tabela');
    } else {
      console.log(`✅ Encontrados ${profissionais.length} profissionais para teste`);
      
      // Testar busca de especialidades via colaboradores
      const nomesProfissionais = profissionais.map(p => p.nome).filter(nome => nome);
      console.log('🔄 Nomes para buscar especialidades:', nomesProfissionais);
      
      if (nomesProfissionais.length > 0) {
        const { data: colaboradores, error: errorColab } = await supabase
          .from('colaboradores')
          .select('id, nome_completo, cargo')
          .in('nome_completo', nomesProfissionais)
          .eq('status', 'ativo');
        
        if (errorColab) {
          console.log('❌ PROBLEMA 3C: Erro ao buscar colaboradores');
          console.log('   Erro:', errorColab.message);
        } else {
          console.log(`✅ Encontrados ${colaboradores?.length || 0} colaboradores ativos`);
          
          if (colaboradores && colaboradores.length > 0) {
            console.log('\n📋 ESPECIALIDADES ENCONTRADAS:');
            colaboradores.forEach((colab, index) => {
              const cargo = colab.cargo || 'SEM CARGO';
              console.log(`   ${index + 1}. ${colab.nome_completo}: ${cargo}`);
            });
            
            // Verificar se há cargos vazios
            const cargoVazio = colaboradores.filter(c => !c.cargo || c.cargo.trim() === '');
            if (cargoVazio.length > 0) {
              console.log(`⚠️ PROBLEMA 3D: ${cargoVazio.length} colaboradores sem cargo/especialidade`);
              console.log('   💡 SOLUÇÃO: Preencher campo cargo na tabela colaboradores');
            } else {
              console.log('✅ Todos os colaboradores têm cargo/especialidade definidos');
            }
          } else {
            console.log('⚠️ PROBLEMA 3E: Nenhum colaborador ativo encontrado com esses nomes');
            console.log('   💡 SOLUÇÃO: Verificar se nomes em profissionais coincidem com colaboradores');
            
            // Listar todos os colaboradores ativos para comparação
            const { data: todosColab } = await supabase
              .from('colaboradores')
              .select('nome_completo, cargo')
              .eq('status', 'ativo')
              .limit(10);
            
            console.log('\n📋 COLABORADORES ATIVOS DISPONÍVEIS:');
            todosColab?.forEach((c, i) => {
              console.log(`   ${i + 1}. ${c.nome_completo} (${c.cargo || 'SEM CARGO'})`);
            });
          }
        }
      } else {
        console.log('⚠️ PROBLEMA 3F: Nenhum nome válido de profissional para buscar');
      }
    }
  } catch (error) {
    console.log('❌ PROBLEMA 3G: Erro inesperado ao buscar especialidades');
    console.log('   Erro:', error.message);
  }
  
  // 4. TESTAR AGENDAMENTOS DO DIA
  console.log('\n4️⃣ TESTANDO AGENDAMENTOS DO DIA (CONTEXTO)');
  console.log('-'.repeat(40));
  
  try {
    console.log('🔄 Buscando agendamentos de hoje...');
    
    // Tentar primeiro com a view
    let agendamentosData = null;
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('data_agendamento', dataHoje)
        .limit(3);
      
      if (viewError) {
        throw new Error(viewError.message);
      }
      agendamentosData = viewData;
      console.log('✅ Dados obtidos da view vw_agendamentos_completo');
    } catch (viewError) {
      console.log('⚠️ View vw_agendamentos_completo falhou, tentando query direta...');
      
      const { data: directData, error: directError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          paciente_nome,
          horario_inicio,
          profissional_id,
          salas(numero, nome),
          profissionais(nome)
        `)
        .eq('data_agendamento', dataHoje)
        .limit(3);
      
      if (directError) {
        throw new Error(directError.message);
      }
      agendamentosData = directData;
      console.log('✅ Dados obtidos da query direta de agendamentos');
    }
    
    if (agendamentosData && agendamentosData.length > 0) {
      console.log(`✅ Encontrados ${agendamentosData.length} agendamentos para hoje`);
      console.log('\n📋 AMOSTRA DOS AGENDAMENTOS:');
      agendamentosData.forEach((ag, index) => {
        const profNome = ag.profissional_nome || ag.profissionais?.nome || 'SEM PROFISSIONAL';
        const salaNome = ag.sala_numero || ag.salas?.numero || 'SEM SALA';
        console.log(`   ${index + 1}. ${ag.paciente_nome} - Sala ${salaNome} - Prof: ${profNome}`);
      });
    } else {
      console.log('⚠️ Nenhum agendamento encontrado para hoje');
      console.log('   💡 SOLUÇÃO: Adicionar agendamentos de teste para hoje');
    }
  } catch (error) {
    console.log('❌ PROBLEMA 4: Erro ao buscar agendamentos');
    console.log('   Erro:', error.message);
  }
  
  // RESUMO FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS PROBLEMAS IDENTIFICADOS:');
  console.log('='.repeat(60));
  console.log('1️⃣ Regra 30 minutos: Verificar se função executar_processamento_automatico existe');
  console.log('2️⃣ Nomes profissionais: Verificar se profissionais_salas tem nomes válidos');
  console.log('3️⃣ Especialidades: Verificar se colaboradores tem campo cargo preenchido');
  console.log('4️⃣ Agendamentos: Verificar se há dados para hoje');
  console.log('='.repeat(60));
}

// Executar o teste
testarAgendaIssues().catch(console.error);
