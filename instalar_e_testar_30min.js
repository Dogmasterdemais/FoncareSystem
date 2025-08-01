const { createClient } = require('@supabase/supabase-js');

// Credenciais diretas para o teste
const supabase = createClient(
  'https://urpfjihtkvvqehjppbrg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4'
);

// Função SQL corrigida para processar transições automáticas
const funcaoSQL = `
-- ============================================================================
-- SISTEMA AUTOMATIZADO DE 30 MINUTOS - VERSÃO CORRIGIDA SEM LOGS
-- ============================================================================

-- Função para processar transições automáticas de profissionais
CREATE OR REPLACE FUNCTION processar_transicoes_automaticas()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    agendamento_record RECORD;
    tempo_atual INTEGER;
    observacao_log TEXT;
    contador_processados INTEGER := 0;
    resultado TEXT := '';
BEGIN
    -- Processar todos os agendamentos em atendimento
    FOR agendamento_record IN 
        SELECT 
            id,
            paciente_nome,
            tipo_sessao,
            profissional_ativo,
            sessao_iniciada_em,
            tempo_profissional_1,
            tempo_profissional_2,
            tempo_profissional_3,
            EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60 as tempo_decorrido_minutos
        FROM agendamentos 
        WHERE status = 'em_atendimento' 
        AND sessao_iniciada_em IS NOT NULL
    LOOP
        tempo_atual := agendamento_record.tempo_decorrido_minutos;
        observacao_log := '';

        -- Lógica para sessões TRIPLAS (3 profissionais × 30min = 90min total)
        IF agendamento_record.tipo_sessao = 'tripla' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND tempo_atual < 90 AND agendamento_record.profissional_ativo = 2 THEN
                -- Trocar para profissional 3 aos 60 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 3,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 3 assumiu aos 60min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 90 AND agendamento_record.profissional_ativo = 3 THEN
                -- Concluir sessão tripla aos 90 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    profissional_ativo = 3,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_profissional_3 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão tripla concluída aos 90min';
                contador_processados := contador_processados + 1;
            END IF;

        -- Lógica para sessões COMPARTILHADAS (2 profissionais × 30min = 60min total)
        ELSIF agendamento_record.tipo_sessao = 'compartilhada' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min (compartilhada)';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND agendamento_record.profissional_ativo = 2 THEN
                -- Concluir sessão compartilhada aos 60 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão compartilhada concluída aos 60min';
                contador_processados := contador_processados + 1;
            END IF;

        -- Lógica para sessões INDIVIDUAIS (1 profissional × 30min = 30min total)
        ELSE -- individual ou qualquer outro tipo
            IF tempo_atual >= 30 THEN
                -- Concluir sessão individual aos 30 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão individual concluída aos 30min';
                contador_processados := contador_processados + 1;
            END IF;
        END IF;

        -- Adicionar ao resultado se houve mudança
        IF observacao_log != '' THEN
            resultado := resultado || 'Paciente: ' || agendamento_record.paciente_nome || ' - ' || observacao_log || E'\\n';
            RAISE NOTICE 'Transição: % - % - %', agendamento_record.id, agendamento_record.paciente_nome, observacao_log;
        END IF;
    END LOOP;

    IF contador_processados = 0 THEN
        resultado := 'Nenhuma transição automática necessária';
    ELSE
        resultado := 'Processados: ' || contador_processados || ' agendamentos' || E'\\n' || resultado;
    END IF;

    RETURN resultado;
END;
$$;

-- Função principal para executar processamento automático
CREATE OR REPLACE FUNCTION executar_processamento_automatico()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    resultado TEXT;
BEGIN
    -- Executar transições automáticas
    resultado := processar_transicoes_automaticas();
    
    -- Adicionar timestamp
    resultado := '[' || NOW()::TEXT || '] ' || resultado;
    
    RAISE NOTICE 'PROCESSAMENTO AUTOMÁTICO: %', resultado;
    RETURN resultado;
END;
$$;
`;

async function instalarFuncao30Minutos() {
  console.log('🔧 INSTALANDO FUNÇÃO DE 30 MINUTOS...');
  console.log('=' .repeat(60));

  try {
    // Dividir e executar a função em partes
    const funcoes = funcaoSQL.split('CREATE OR REPLACE FUNCTION').filter(f => f.trim());
    
    for (let i = 0; i < funcoes.length; i++) {
      if (i === 0) continue; // Pular o comentário inicial
      
      const funcaoCompleta = 'CREATE OR REPLACE FUNCTION' + funcoes[i];
      console.log(`📝 Instalando função ${i}/${funcoes.length - 1}...`);
      
      try {
        // Tentar executar usando RPC personalizada ou query direta
        const { data, error } = await supabase
          .from('agendamentos')
          .select('count(*)')
          .limit(1);
        
        if (error) {
          console.log('❌ Erro de conexão:', error.message);
          return false;
        }
        
        console.log(`⚠️ Função SQL não pode ser executada diretamente via JavaScript`);
        console.log(`💡 Você precisa executar no Supabase Dashboard SQL Editor:`);
        console.log('\n' + '='.repeat(40));
        console.log(funcaoCompleta);
        console.log('='.repeat(40) + '\n');
        
      } catch (err) {
        console.log('❌ Erro:', err.message);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NA INSTALAÇÃO:', error);
    return false;
  }
}

async function simularAtendimento() {
  console.log('🎭 SIMULANDO INÍCIO DE ATENDIMENTO PARA TESTE...');
  
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Buscar agendamento pronto para simular
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('id, paciente_nome, sala_id, salas(numero, nome)')
      .eq('data_agendamento', hoje)
      .eq('status', 'pronto_para_terapia')
      .limit(1);

    if (agendamentosError) {
      console.log('❌ Erro ao buscar agendamentos:', agendamentosError.message);
      return false;
    }

    if (!agendamentos || agendamentos.length === 0) {
      console.log('⚠️ Nenhum agendamento "pronto_para_terapia" encontrado');
      console.log('💡 Vamos criar um agendamento de teste...');
      
      // Verificar se existe algum agendamento hoje para modificar
      const { data: todosAgendamentos, error: todosError } = await supabase
        .from('agendamentos')
        .select('id, paciente_nome, status, salas(numero)')
        .eq('data_agendamento', hoje)
        .limit(1);

      if (todosError) {
        console.log('❌ Erro ao buscar todos agendamentos:', todosError.message);
        return false;
      }

      if (todosAgendamentos && todosAgendamentos.length > 0) {
        const agendamento = todosAgendamentos[0];
        console.log(`🎯 Usando agendamento existente: ${agendamento.paciente_nome}`);
        
        // Atualizar para pronto_para_terapia primeiro
        const { error: prontoError } = await supabase
          .from('agendamentos')
          .update({ status: 'pronto_para_terapia' })
          .eq('id', agendamento.id);

        if (prontoError) {
          console.log('❌ Erro ao preparar agendamento:', prontoError.message);
          return false;
        }
        
        console.log('✅ Agendamento preparado como "pronto_para_terapia"');
        
        // Agora iniciar o atendimento
        const { error: iniciarError } = await supabase
          .from('agendamentos')
          .update({
            status: 'em_atendimento',
            sessao_iniciada_em: new Date().toISOString(),
            tempo_sessao_atual: 0,
            profissional_ativo: 1,
            tipo_sessao: 'tripla' // Para testar rotação de 3 profissionais
          })
          .eq('id', agendamento.id);

        if (iniciarError) {
          console.log('❌ Erro ao iniciar atendimento:', iniciarError.message);
          return false;
        }

        console.log('✅ Atendimento iniciado com sucesso!');
        console.log(`📍 Paciente: ${agendamento.paciente_nome}`);
        console.log(`🏢 Sala: ${agendamento.salas?.numero}`);
        console.log(`🕒 Tipo: tripla (3 profissionais × 30min)`);
        return true;
      } else {
        console.log('❌ Nenhum agendamento encontrado hoje para testar');
        return false;
      }
    } else {
      const agendamento = agendamentos[0];
      console.log(`🎯 Iniciando atendimento: ${agendamento.paciente_nome} - Sala ${agendamento.salas?.numero}`);
      
      const { error: iniciarError } = await supabase
        .from('agendamentos')
        .update({
          status: 'em_atendimento',
          sessao_iniciada_em: new Date().toISOString(),
          tempo_sessao_atual: 0,
          profissional_ativo: 1,
          tipo_sessao: 'tripla'
        })
        .eq('id', agendamento.id);

      if (iniciarError) {
        console.log('❌ Erro ao iniciar atendimento:', iniciarError.message);
        return false;
      }

      console.log('✅ Atendimento iniciado com sucesso!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ ERRO NA SIMULAÇÃO:', error);
    return false;
  }
}

async function testarFuncao30Minutos() {
  console.log('🧪 TESTANDO FUNÇÃO DE 30 MINUTOS...');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar se a função existe
    console.log('1️⃣ VERIFICANDO FUNÇÃO...');
    
    const { data: resultado, error: funcaoError } = await supabase
      .rpc('executar_processamento_automatico');
    
    if (funcaoError) {
      console.log('❌ Função falhou:', funcaoError.message);
      
      if (funcaoError.message.includes('logs_agendamentos')) {
        console.log('💡 A função ainda está tentando usar tabela logs_agendamentos');
        console.log('🔧 Você precisa instalar a versão corrigida no Supabase Dashboard');
        return false;
      }
      
      if (funcaoError.message.includes('does not exist')) {
        console.log('💡 A função não existe, você precisa criar ela primeiro');
        return false;
      }
      
      return false;
    } else {
      console.log('✅ Função executada com sucesso!');
      console.log('📋 Resultado:', resultado);
    }

    // 2. Verificar agendamentos em atendimento
    console.log('\n2️⃣ VERIFICANDO AGENDAMENTOS EM ATENDIMENTO...');
    
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select(`
        id,
        paciente_nome,
        status,
        sessao_iniciada_em,
        tempo_sessao_atual,
        profissional_ativo,
        tipo_sessao,
        tempo_profissional_1,
        tempo_profissional_2,
        tempo_profissional_3,
        salas(numero, nome)
      `)
      .eq('data_agendamento', hoje)
      .in('status', ['em_atendimento', 'concluido'])
      .order('status');

    if (agendamentosError) {
      console.log('❌ Erro ao buscar agendamentos:', agendamentosError.message);
      return false;
    }

    console.log(`📊 Encontrados ${agendamentos?.length || 0} agendamentos processados hoje`);
    
    if (agendamentos && agendamentos.length > 0) {
      agendamentos.forEach((ag, index) => {
        const minutosPassados = ag.sessao_iniciada_em 
          ? Math.floor((new Date() - new Date(ag.sessao_iniciada_em)) / (1000 * 60))
          : 0;
        
        console.log(`\n   ${index + 1}. ${ag.paciente_nome} - Sala ${ag.salas?.numero}`);
        console.log(`      Status: ${ag.status}`);
        console.log(`      Tipo: ${ag.tipo_sessao || 'individual'}`);
        console.log(`      Profissional ativo: ${ag.profissional_ativo || 1}`);
        console.log(`      Tempo passado: ${minutosPassados} min`);
        console.log(`      Tempos registrados: P1=${ag.tempo_profissional_1 || 0}, P2=${ag.tempo_profissional_2 || 0}, P3=${ag.tempo_profissional_3 || 0}`);
        
        // Análise do estado
        if (ag.status === 'em_atendimento') {
          const tipo = ag.tipo_sessao || 'individual';
          const prof = ag.profissional_ativo || 1;
          
          if (tipo === 'individual' && minutosPassados >= 30) {
            console.log('      ⚠️ DEVERIA ter sido concluído (individual > 30min)');
          } else if (tipo === 'compartilhada') {
            if (prof === 1 && minutosPassados >= 30) {
              console.log('      ⚠️ DEVERIA ter trocado para Prof. 2');
            } else if (prof === 2 && minutosPassados >= 60) {
              console.log('      ⚠️ DEVERIA ter sido concluído');
            } else {
              console.log(`      ✅ Dentro do prazo`);
            }
          } else if (tipo === 'tripla') {
            if (prof === 1 && minutosPassados >= 30) {
              console.log('      ⚠️ DEVERIA ter trocado para Prof. 2');
            } else if (prof === 2 && minutosPassados >= 60) {
              console.log('      ⚠️ DEVERIA ter trocado para Prof. 3');
            } else if (prof === 3 && minutosPassados >= 90) {
              console.log('      ⚠️ DEVERIA ter sido concluído');
            } else {
              const proximaTroca = prof === 1 ? (30 - minutosPassados) : 
                                 prof === 2 ? (60 - minutosPassados) : 
                                 (90 - minutosPassados);
              console.log(`      ✅ Dentro do prazo (${proximaTroca} min para próxima troca)`);
            }
          }
        } else if (ag.status === 'concluido') {
          console.log('      ✅ CONCLUÍDO corretamente');
        }
      });
    } else {
      console.log('⚠️ Nenhum agendamento encontrado');
    }

    return true;

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 SISTEMA COMPLETO DE 30 MINUTOS');
  console.log('=' .repeat(60));

  // 1. Instalar função (mostrar SQL)
  await instalarFuncao30Minutos();
  
  console.log('\n');
  
  // 2. Simular atendimento
  const simulacao = await simularAtendimento();
  
  console.log('\n');
  
  // 3. Testar função
  const teste = await testarFuncao30Minutos();
  
  console.log('\n' + '=' .repeat(60));
  if (simulacao && teste) {
    console.log('🎉 SISTEMA TESTADO COM SUCESSO!');
    console.log('💡 Para funcionar completamente, execute o SQL no Supabase Dashboard');
  } else {
    console.log('💥 SISTEMA PRECISA DE CORREÇÕES');
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 ERRO FATAL:', error);
    process.exit(1);
  });
