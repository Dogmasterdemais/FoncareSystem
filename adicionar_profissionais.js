const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://kxstymmihfthtkojhcam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c3R5bW1paGZ0aHRrb2poY2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODE4MjIsImV4cCI6MjA1MTg1NzgyMn0.v74qQNrGmP6sFwYLj0XqDgO-5xYevZUGjwQw4QJR0vs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function adicionarProfissionais() {
  const profissionais = [
    // Unidade NAC (id=1) - Mais profissionais
    { nome: 'Dra. Mariana Silva', especialidade_id: 1, unidade_id: 1, email: 'mariana.silva@foncare.com', telefone: '(11) 98765-4321', crp_crm: 'CRP 06/123456', ativo: true },
    { nome: 'Dr. Ricardo Oliveira', especialidade_id: 2, unidade_id: 1, email: 'ricardo.oliveira@foncare.com', telefone: '(11) 98765-4322', crp_crm: 'CRM 123456', ativo: true },
    { nome: 'Dra. Patricia Costa', especialidade_id: 3, unidade_id: 1, email: 'patricia.costa@foncare.com', telefone: '(11) 98765-4323', crp_crm: 'CREFITO 12345', ativo: true },
    { nome: 'Dra. Ana Paula Rocha', especialidade_id: 4, unidade_id: 1, email: 'ana.rocha@foncare.com', telefone: '(11) 98765-4324', crp_crm: 'CRP 06/789012', ativo: true },
    { nome: 'Dr. Fernando Alves', especialidade_id: 5, unidade_id: 1, email: 'fernando.alves@foncare.com', telefone: '(11) 98765-4325', crp_crm: 'CRM 789012', ativo: true },
    { nome: 'Dra. Juliana Santos', especialidade_id: 6, unidade_id: 1, email: 'juliana.santos@foncare.com', telefone: '(11) 98765-4326', crp_crm: 'CRP 06/345678', ativo: true },
    { nome: 'Dr. Lucas Pereira', especialidade_id: 7, unidade_id: 1, email: 'lucas.pereira@foncare.com', telefone: '(11) 98765-4327', crp_crm: 'CRM 345678', ativo: true },
    { nome: 'Dra. Carla Mendes', especialidade_id: 1, unidade_id: 1, email: 'carla.mendes@foncare.com', telefone: '(11) 98765-4328', crp_crm: 'CRP 06/901234', ativo: true },
    { nome: 'Dr. Gabriel Lima', especialidade_id: 2, unidade_id: 1, email: 'gabriel.lima@foncare.com', telefone: '(11) 98765-4329', crp_crm: 'CRM 901234', ativo: true },
    { nome: 'Dra. Renata Barbosa', especialidade_id: 3, unidade_id: 1, email: 'renata.barbosa@foncare.com', telefone: '(11) 98765-4330', crp_crm: 'CREFITO 56789', ativo: true },

    // Unidade Clínica Central (id=2)
    { nome: 'Dr. Eduardo Campos', especialidade_id: 1, unidade_id: 2, email: 'eduardo.campos@foncare.com', telefone: '(11) 97654-3210', crp_crm: 'CRP 06/567890', ativo: true },
    { nome: 'Dra. Camila Fernandes', especialidade_id: 2, unidade_id: 2, email: 'camila.fernandes@foncare.com', telefone: '(11) 97654-3211', crp_crm: 'CRM 567890', ativo: true },
    { nome: 'Dr. Rafael Martins', especialidade_id: 3, unidade_id: 2, email: 'rafael.martins@foncare.com', telefone: '(11) 97654-3212', crp_crm: 'CREFITO 90123', ativo: true },
    { nome: 'Dra. Sabrina Reis', especialidade_id: 4, unidade_id: 2, email: 'sabrina.reis@foncare.com', telefone: '(11) 97654-3213', crp_crm: 'CRP 06/234567', ativo: true },
    { nome: 'Dr. Thiago Nunes', especialidade_id: 5, unidade_id: 2, email: 'thiago.nunes@foncare.com', telefone: '(11) 97654-3214', crp_crm: 'CRM 234567', ativo: true },
    { nome: 'Dra. Vanessa Torres', especialidade_id: 6, unidade_id: 2, email: 'vanessa.torres@foncare.com', telefone: '(11) 97654-3215', crp_crm: 'CRP 06/678901', ativo: true },
    { nome: 'Dr. Daniel Sousa', especialidade_id: 7, unidade_id: 2, email: 'daniel.sousa@foncare.com', telefone: '(11) 97654-3216', crp_crm: 'CRM 678901', ativo: true },
    { nome: 'Dra. Fernanda Castro', especialidade_id: 1, unidade_id: 2, email: 'fernanda.castro@foncare.com', telefone: '(11) 97654-3217', crp_crm: 'CRP 06/123789', ativo: true },
    { nome: 'Dr. Henrique Dias', especialidade_id: 2, unidade_id: 2, email: 'henrique.dias@foncare.com', telefone: '(11) 97654-3218', crp_crm: 'CRM 123789', ativo: true },
    { nome: 'Dra. Isabella Gomes', especialidade_id: 3, unidade_id: 2, email: 'isabella.gomes@foncare.com', telefone: '(11) 97654-3219', crp_crm: 'CREFITO 45678', ativo: true },

    // Unidade Especializada (id=3)
    { nome: 'Dr. Joaquim Freitas', especialidade_id: 1, unidade_id: 3, email: 'joaquim.freitas@foncare.com', telefone: '(11) 96543-2109', crp_crm: 'CRP 06/456789', ativo: true },
    { nome: 'Dra. Larissa Moura', especialidade_id: 2, unidade_id: 3, email: 'larissa.moura@foncare.com', telefone: '(11) 96543-2108', crp_crm: 'CRM 456789', ativo: true },
    { nome: 'Dr. Mateus Cardoso', especialidade_id: 3, unidade_id: 3, email: 'mateus.cardoso@foncare.com', telefone: '(11) 96543-2107', crp_crm: 'CREFITO 78901', ativo: true },
    { nome: 'Dra. Nicole Ribeiro', especialidade_id: 4, unidade_id: 3, email: 'nicole.ribeiro@foncare.com', telefone: '(11) 96543-2106', crp_crm: 'CRP 06/890123', ativo: true },
    { nome: 'Dr. Otavio Machado', especialidade_id: 5, unidade_id: 3, email: 'otavio.machado@foncare.com', telefone: '(11) 96543-2105', crp_crm: 'CRM 890123', ativo: true },
    { nome: 'Dra. Priscila Araujo', especialidade_id: 6, unidade_id: 3, email: 'priscila.araujo@foncare.com', telefone: '(11) 96543-2104', crp_crm: 'CRP 06/012345', ativo: true },
    { nome: 'Dr. Rodrigo Vieira', especialidade_id: 7, unidade_id: 3, email: 'rodrigo.vieira@foncare.com', telefone: '(11) 96543-2103', crp_crm: 'CRM 012345', ativo: true },
    { nome: 'Dra. Simone Azevedo', especialidade_id: 1, unidade_id: 3, email: 'simone.azevedo@foncare.com', telefone: '(11) 96543-2102', crp_crm: 'CRP 06/234890', ativo: true },
    { nome: 'Dr. Tiago Monteiro', especialidade_id: 2, unidade_id: 3, email: 'tiago.monteiro@foncare.com', telefone: '(11) 96543-2101', crp_crm: 'CRM 234890', ativo: true },
    { nome: 'Dra. Ursula Barros', especialidade_id: 3, unidade_id: 3, email: 'ursula.barros@foncare.com', telefone: '(11) 96543-2100', crp_crm: 'CREFITO 67890', ativo: true }
  ];

  try {
    const { data, error } = await supabase
      .from('profissionais')
      .insert(profissionais);

    if (error) {
      console.error('Erro ao inserir profissionais:', error);
    } else {
      console.log('Profissionais adicionados com sucesso!');
      console.log(`Total de profissionais inseridos: ${profissionais.length}`);
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

adicionarProfissionais();
