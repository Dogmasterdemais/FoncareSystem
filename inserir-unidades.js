import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urpfjihtkvvqehjppbrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inserirUnidades() {
  console.log('🔄 Inserindo unidades no banco...');
  
  const unidades = [
    {
      id: '15ef46f7-3cf7-4c26-af91-92405834cad6',
      empresa_id: null,
      nome: 'Foncare - Santos',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'foncare@foncare.com.br',
      cep: '11060-001',
      logradouro: 'Avenida Ana Costa',
      numero: '101',
      complemento: '',
      bairro: 'Gonzaga',
      cidade: 'Santos',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '08007712915',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    },
    {
      id: '18bca994-1c17-47f0-b650-10ef3690a481',
      empresa_id: null,
      nome: 'Escritório',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'foncare@foncare.com.br',
      cep: '03516000',
      logradouro: 'Rua Eugênia de Carvalho',
      numero: '698',
      complemento: '',
      bairro: 'Vila Matilde',
      cidade: 'São Paulo',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '08007712915',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    },
    {
      id: '4dc0ca5c-7049-40f8-9461-19afb39935ef',
      empresa_id: null,
      nome: 'Foncare - Suzano',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'foncare@foncare.com.br',
      cep: '02169-180',
      logradouro: 'Rua Tiradentes',
      numero: '236',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Suzano',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '08007712915',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    },
    {
      id: '85889e10-bdbb-402f-a06b-7930e4fe0b33',
      empresa_id: null,
      nome: 'Foncare - Osasco 1',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'foncare@foncare.com.br',
      cep: '06010-140',
      logradouro: 'Rua Thomas Spitaletti',
      numero: '108',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Osasco',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '08007712915',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    },
    {
      id: 'a4429bd3-1737-43bc-920e-dae4749e20dd',
      empresa_id: null,
      nome: 'Foncare - Osasco 2',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'foncare@foncare.com.br',
      cep: '06010-140',
      logradouro: 'Rua Eloy Candido Lopes',
      numero: '264',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Osasco',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '08007712915',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    },
    {
      id: 'ba2a4f33-4cfa-4530-96ee-523db17772c5',
      empresa_id: null,
      nome: 'Foncare - São Miguel Paulista',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'foncare@foncare.com.br',
      cep: '08010150',
      logradouro: 'Rua João Augusto de Moraes',
      numero: '144',
      complemento: '',
      bairro: 'São Miguel Paulista',
      cidade: 'São Paulo',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '08007712915',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    },
    {
      id: 'ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30',
      empresa_id: '342d7f61-72b5-4131-bba6-7315a94ab82b',
      nome: 'Unidade Principal',
      cnpj: null,
      telefone: '(11) 1234-5678',
      email: 'unidade1@foncare.com.br',
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: null,
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      responsavel_nome: null,
      responsavel_telefone: null,
      horario_funcionamento: null,
      ativo: true,
      ativa: true,
      tipo: null
    },
    {
      id: 'f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9',
      empresa_id: null,
      nome: 'Penha - Matriz',
      cnpj: '33865837000152',
      telefone: '08007712915',
      email: 'cloud.penha1@foncare.com.br',
      cep: '03607-020',
      logradouro: 'Rua ',
      numero: '60',
      complemento: '',
      bairro: 'Penha',
      cidade: 'São Paulo',
      uf: 'SP',
      responsavel_nome: 'Erica Cavalcante de Lucena',
      responsavel_telefone: '11998776788',
      horario_funcionamento: 'Seg a Sex 08:00 às 18:00',
      ativo: true,
      ativa: true,
      tipo: 'filial'
    }
  ];

  try {
    // Primeiro, verificar quantas unidades existem
    const { data: existingUnidades, error: selectError } = await supabase
      .from('unidades')
      .select('*');
    
    if (selectError) {
      console.error('❌ Erro ao consultar unidades:', selectError);
      return;
    }
    
    console.log(`📊 Unidades existentes no banco: ${existingUnidades.length}`);
    console.log('Unidades:', existingUnidades.map(u => u.nome));
    
    // Inserir unidades com upsert
    const { data, error } = await supabase
      .from('unidades')
      .upsert(unidades, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Erro ao inserir unidades:', error);
      return;
    }

    console.log(`✅ ${data.length} unidades inseridas/atualizadas com sucesso!`);
    console.log('Unidades inseridas:');
    data.forEach(unidade => {
      console.log(`  - ${unidade.nome} (ID: ${unidade.id})`);
    });
    
    // Verificar novamente após inserção
    const { data: finalUnidades, error: finalError } = await supabase
      .from('unidades')
      .select('*');
    
    if (finalError) {
      console.error('❌ Erro ao consultar unidades finais:', finalError);
      return;
    }
    
    console.log(`🎉 Total de unidades no banco após inserção: ${finalUnidades.length}`);
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

inserirUnidades();
