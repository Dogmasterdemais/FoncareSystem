require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function popularViewAgenda() {
  console.log('🔄 POPULANDO VIEW vw_agenda_tempo_real_automatica');
  console.log('==================================================');
  
  try {
    // Dados do arquivo SQL
    const agendamentosParaInserir = [
      {
        id: '69b518cd-a167-416b-a03e-8566357069b8',
        paciente_nome: 'Douglas Henrique Nogueira Araújo',
        sala_nome: 'Sala de Anamnese',
        sala_numero: '10',
        sala_cor: '#9333EA',
        especialidade_nome: 'Anamnese',
        especialidade_cor: '#808080',
        data_agendamento: '2025-07-29',
        horario_inicio: '20:00:00',
        horario_fim: '21:00:00',
        status: 'pronto_para_terapia',
        status_dinamico: 'pronto_para_terapia',
        tempo_sessao_atual: '0',
        tempo_restante_minutos: '60',
        duracao_planejada: '60',
        tipo_sessao: 'individual',
        profissional_nome: null,
        profissional_1_nome: null,
        profissional_2_nome: null,
        profissional_3_nome: null,
        profissional_ativo: '1',
        proxima_acao: 'Iniciar atendimento',
        hora_chegada: '2025-07-29 23:34:58.421972+00',
        sessao_iniciada_em: null,
        hora_fim_atendimento: '2025-07-29 23:34:58.421972+00',
        unidade_nome: 'Foncare - Osasco 2',
        unidade_id: 'a4429bd3-1737-43bc-920e-dae4749e20dd',
        observacoes_sessao: '',
        created_at: '2025-07-29 23:34:58.421972+00'
      },
      {
        id: 'f7558399-dde4-48ed-8965-c870269c8b0b',
        paciente_nome: 'Douglas Henrique Nogueira Araújo',
        sala_nome: 'Sala de Educação Física',
        sala_numero: '09',
        sala_cor: '#C90205',
        especialidade_nome: null,
        especialidade_cor: null,
        data_agendamento: '2025-07-29',
        horario_inicio: '21:23:00',
        horario_fim: '22:23:00',
        status: 'pronto_para_terapia',
        status_dinamico: 'pronto_para_terapia',
        tempo_sessao_atual: '0',
        tempo_restante_minutos: '60',
        duracao_planejada: '60',
        tipo_sessao: 'individual',
        profissional_nome: null,
        profissional_1_nome: null,
        profissional_2_nome: null,
        profissional_3_nome: null,
        profissional_ativo: '1',
        proxima_acao: 'Iniciar atendimento',
        hora_chegada: '2025-07-29 23:25:37.621351+00',
        sessao_iniciada_em: null,
        hora_fim_atendimento: '2025-07-29 23:25:37.621351+00',
        unidade_nome: 'Foncare - Osasco 2',
        unidade_id: 'a4429bd3-1737-43bc-920e-dae4749e20dd',
        observacoes_sessao: '',
        created_at: '2025-07-29 23:25:37.621351+00'
      }
    ];

    console.log('📝 Tentando inserir', agendamentosParaInserir.length, 'agendamentos...');

    // Tentar inserir na view
    const { data, error } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .insert(agendamentosParaInserir);

    if (error) {
      console.error('❌ Erro ao inserir na view:', error);
      console.log('⚠️ Isso é normal se a view for read-only');
      
      // Verificar se existe uma tabela correspondente
      console.log('🔍 Verificando se existe tabela vw_agenda_tempo_real...');
      const { data: testTable, error: errorTable } = await supabase
        .from('vw_agenda_tempo_real')
        .select('*')
        .limit(1);
      
      if (errorTable) {
        console.error('❌ Tabela vw_agenda_tempo_real também não existe:', errorTable);
      } else {
        console.log('✅ Tabela vw_agenda_tempo_real existe!');
        
        // Tentar inserir na tabela
        const { data: insertData, error: insertError } = await supabase
          .from('vw_agenda_tempo_real')
          .insert(agendamentosParaInserir);
        
        if (insertError) {
          console.error('❌ Erro ao inserir na tabela:', insertError);
        } else {
          console.log('✅ Dados inseridos na tabela com sucesso!');
        }
      }
    } else {
      console.log('✅ Dados inseridos na view com sucesso!');
    }

    // Verificar se os dados agora aparecem
    console.log('\n🔍 Verificando se os dados agora aparecem...');
    const { data: verificacao, error: errorVerificacao } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .eq('data_agendamento', '2025-07-29');

    if (errorVerificacao) {
      console.error('❌ Erro na verificação:', errorVerificacao);
    } else {
      console.log('✅ Agendamentos encontrados após inserção:', verificacao?.length || 0);
      if (verificacao && verificacao.length > 0) {
        verificacao.forEach(ag => {
          console.log(`  - ${ag.horario_inicio} | ${ag.paciente_nome} | ${ag.sala_nome} | ${ag.especialidade_nome || 'Sem especialidade'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

popularViewAgenda();
