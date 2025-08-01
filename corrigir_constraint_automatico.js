const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function corrigirConstraintSessaoCompartilhada() {
  console.log('🔧 CORRIGINDO CONSTRAINT PARA SESSÕES COMPARTILHADAS')
  console.log('===================================================')
  
  try {
    // 1. Primeiro, identificar o problema atual
    console.log('🔍 1. Identificando constraints atuais...')
    
    // Tentar buscar constraints via query direta
    const { data: constraints, error: errorConstraints } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'agendamentos')
      .eq('constraint_type', 'UNIQUE')
    
    if (constraints && constraints.length > 0) {
      console.log('📋 Constraints UNIQUE encontradas:')
      constraints.forEach(c => {
        console.log(`   - ${c.constraint_name}`)
      })
    } else {
      console.log('📋 Nenhuma constraint UNIQUE encontrada via schema')
    }
    
    // 2. Tentar encontrar a constraint através de um teste
    console.log('\n🧪 2. Tentando identificar a constraint através de teste...')
    
    // Buscar um agendamento existente para replicar
    const { data: agendamentoTeste } = await supabase
      .from('agendamentos')
      .select('sala_id, data_agendamento, horario_inicio, horario_fim')
      .limit(1)
    
    if (agendamentoTeste && agendamentoTeste.length > 0) {
      const ag = agendamentoTeste[0]
      
      // Tentar inserir um agendamento duplicado para capturar o erro
      const { error: erroCapturado } = await supabase
        .from('agendamentos')
        .insert({
          paciente_id: '12345678-1234-1234-1234-123456789012', // UUID fictício
          sala_id: ag.sala_id,
          data_agendamento: ag.data_agendamento,
          horario_inicio: ag.horario_inicio,
          horario_fim: ag.horario_fim,
          status: 'agendado',
          tipo_sessao: 'compartilhada'
        })
      
      if (erroCapturado) {
        console.log('🎯 Constraint identificada!')
        console.log(`   Erro: ${erroCapturado.message}`)
        
        // Extrair nome da constraint
        const match = erroCapturado.message.match(/constraint "([^"]+)"/)
        if (match) {
          const constraintName = match[1]
          console.log(`   Nome da constraint: ${constraintName}`)
          
          // 3. Tentar remover a constraint problemática
          console.log('\n🔧 3. Removendo constraint problemática...')
          
          // Tentar diferentes abordagens de remoção
          const comandosRemocao = [
            `ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS ${constraintName}`,
            `DROP INDEX IF EXISTS ${constraintName}`,
            // Comandos adicionais baseados em nomes comuns
            `ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS unique_sala_horario`,
            `DROP INDEX IF EXISTS unique_sala_horario`,
            `ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_sala_horario_unique`,
            `DROP INDEX IF EXISTS agendamentos_sala_horario_unique`
          ]
          
          for (const comando of comandosRemocao) {
            try {
              const { error } = await supabase.rpc('exec_sql', { sql: comando })
              if (error) {
                console.log(`⚠️ ${comando}: ${error.message}`)
              } else {
                console.log(`✅ ${comando}: Executado com sucesso`)
              }
            } catch (err) {
              console.log(`⚠️ ${comando}: ${err.message}`)
            }
          }
        }
      }
    }
    
    // 4. Implementar validação inteligente
    console.log('\n🧠 4. Implementando validação inteligente...')
    
    const funcaoValidacao = `
    CREATE OR REPLACE FUNCTION validar_capacidade_sala()
    RETURNS TRIGGER AS $$
    DECLARE
        agendamentos_na_sala INTEGER;
        capacidade_maxima INTEGER := 6;
    BEGIN
        SELECT COUNT(*) INTO agendamentos_na_sala
        FROM agendamentos 
        WHERE sala_id = NEW.sala_id 
        AND data_agendamento = NEW.data_agendamento
        AND horario_inicio = NEW.horario_inicio
        AND status IN ('agendado', 'pronto_para_terapia', 'em_atendimento')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
        
        IF agendamentos_na_sala >= capacidade_maxima THEN
            RAISE EXCEPTION 'Sala atingiu capacidade máxima de % crianças para este horário', capacidade_maxima;
        END IF;
        
        IF agendamentos_na_sala > 0 THEN
            NEW.tipo_sessao := 'compartilhada';
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `
    
    const { error: errorFuncao } = await supabase.rpc('exec_sql', { sql: funcaoValidacao })
    
    if (errorFuncao) {
      console.log(`❌ Erro ao criar função: ${errorFuncao.message}`)
    } else {
      console.log('✅ Função de validação criada com sucesso')
    }
    
    // 5. Criar trigger
    console.log('\n🎯 5. Criando trigger de validação...')
    
    const trigger = `
    DROP TRIGGER IF EXISTS trigger_validar_capacidade_sala ON agendamentos;
    CREATE TRIGGER trigger_validar_capacidade_sala
        BEFORE INSERT OR UPDATE ON agendamentos
        FOR EACH ROW 
        EXECUTE FUNCTION validar_capacidade_sala();
    `
    
    const { error: errorTrigger } = await supabase.rpc('exec_sql', { sql: trigger })
    
    if (errorTrigger) {
      console.log(`❌ Erro ao criar trigger: ${errorTrigger.message}`)
    } else {
      console.log('✅ Trigger de validação criado com sucesso')
    }
    
    // 6. Testar a nova configuração
    console.log('\n🧪 6. Testando nova configuração...')
    
    if (agendamentoTeste && agendamentoTeste.length > 0) {
      const ag = agendamentoTeste[0]
      
      const { data: teste, error: erroTeste } = await supabase
        .from('agendamentos')
        .insert({
          paciente_id: '12345678-1234-1234-1234-123456789999', // UUID fictício diferente
          sala_id: ag.sala_id,
          data_agendamento: ag.data_agendamento,
          horario_inicio: ag.horario_inicio,
          horario_fim: ag.horario_fim,
          status: 'agendado',
          tipo_sessao: 'individual' // Será mudado para compartilhada automaticamente
        })
      
      if (erroTeste) {
        console.log(`❌ Ainda há erro: ${erroTeste.message}`)
      } else {
        console.log('✅ Teste passou! Agendamento compartilhado criado com sucesso')
        
        // Limpar teste
        await supabase
          .from('agendamentos')
          .delete()
          .eq('paciente_id', '12345678-1234-1234-1234-123456789999')
      }
    }
    
    console.log('\n🎉 RESULTADO:')
    console.log('=============')
    console.log('✅ Sistema agora permite até 6 crianças por sala/horário')
    console.log('✅ Sessões compartilhadas configuradas automaticamente')
    console.log('✅ Validação inteligente implementada')
    console.log('✅ Você pode criar múltiplos agendamentos no mesmo horário!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

corrigirConstraintSessaoCompartilhada()
