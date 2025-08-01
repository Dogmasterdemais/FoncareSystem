const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir o schema em comandos individuais
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Encontrados ${commands.length} comandos SQL para executar...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      console.log(`\n⚡ Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`⚠️ Comando ${i + 1} falhou (pode ser normal se já existir):`, error.message);
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.log(`⚠️ Erro no comando ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎉 Configuração do banco concluída!');
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    await verifyTables();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function verifyTables() {
  const tables = ['unidades', 'especialidades', 'convenios', 'salas', 'pacientes', 'agendamentos'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact' });
      
      if (error) {
        console.log(`❌ Tabela '${table}': ${error.message}`);
      } else {
        console.log(`✅ Tabela '${table}': ${data?.length || 0} registros`);
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar tabela '${table}':`, err.message);
    }
  }
}

// Executar o setup
setupDatabase().catch(console.error);
