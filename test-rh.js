// Teste rápido para inserir dados de exemplo no RH
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'SEU_SUPABASE_URL';
const supabaseKey = 'SEU_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function criarDadosDeExemplo() {
  try {
    // Criar uma unidade de exemplo
    const { data: unidade, error: unidadeError } = await supabase
      .from('unidades')
      .insert({
        nome: 'Unidade Centro',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 1234-5678',
        email: 'centro@foncare.com.br'
      })
      .select()
      .single();

    if (unidadeError) throw unidadeError;
    console.log('Unidade criada:', unidade);

    // Criar um colaborador de exemplo
    const { data: colaborador, error: colaboradorError } = await supabase
      .from('colaboradores')
      .insert({
        nome_completo: 'João Silva Santos',
        data_nascimento: '1990-05-15',
        genero: 'masculino',
        estado_civil: 'casado',
        nome_mae: 'Maria Silva Santos',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        telefone_celular: '(11) 99999-9999',
        email_pessoal: 'joao.silva@email.com',
        cargo: 'Fisioterapeuta',
        departamento: 'Fisioterapia',
        unidade_id: unidade.id,
        regime_contratacao: 'clt',
        data_admissao: '2024-01-15',
        salario_valor: 5000.00,
        status: 'ativo'
      })
      .select()
      .single();

    if (colaboradorError) throw colaboradorError;
    console.log('Colaborador criado:', colaborador);

    console.log('Dados de exemplo criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error);
  }
}

// Para executar: node test-rh.js
// criarDadosDeExemplo();

console.log('Arquivo de teste criado. Configure as credenciais do Supabase e descomente a última linha para executar.');
