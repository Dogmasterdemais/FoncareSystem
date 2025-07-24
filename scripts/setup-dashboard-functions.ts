import { supabase } from '../src/lib/supabaseClient';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDashboardFunctions() {
  console.log('🚀 Executando funções SQL do dashboard...');
  
  try {
    // Ler o arquivo SQL
    const sqlContent = readFileSync(join(process.cwd(), 'dashboard-functions.sql'), 'utf-8');
    
    // Dividir o arquivo em comandos separados
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (!command) continue;
      
      console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      
      if (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error);
        // Tentar executar diretamente
        const { error: directError } = await supabase
          .from('_functions')
          .insert({ sql: command });
        
        if (directError) {
          console.warn(`⚠️ Pulando comando que falhou: ${command.substring(0, 50)}...`);
        }
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    }
    
    console.log('🎉 Setup das funções do dashboard concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante setup:', error);
  }
}

// Testar conexão e dados existentes
async function verificarDados() {
  console.log('\n🔍 Verificando dados existentes...');
  
  try {
    // Verificar pacientes
    const { data: pacientes, error: errorPacientes } = await supabase
      .from('pacientes')
      .select('id, nome_completo, endereco_cep, endereco_cidade, endereco_estado')
      .limit(10);
    
    if (errorPacientes) {
      console.error('❌ Erro ao buscar pacientes:', errorPacientes);
    } else {
      console.log(`👥 Pacientes encontrados: ${pacientes?.length || 0}`);
      pacientes?.forEach(p => {
        console.log(`  - ${p.nome_completo} (${p.endereco_cep || 'sem CEP'})`);
      });
    }
    
    // Verificar atendimentos
    const { data: atendimentos, error: errorAtendimentos } = await supabase
      .from('atendimentos')
      .select('id, data_atendimento, status')
      .limit(5);
    
    if (errorAtendimentos) {
      console.error('❌ Erro ao buscar atendimentos:', errorAtendimentos);
    } else {
      console.log(`🏥 Atendimentos encontrados: ${atendimentos?.length || 0}`);
    }
    
    // Verificar guias
    const { data: guias, error: errorGuias } = await supabase
      .from('guias')
      .select('id, data_emissao, status, valor_total')
      .limit(5);
    
    if (errorGuias) {
      console.error('❌ Erro ao buscar guias:', errorGuias);
    } else {
      console.log(`📋 Guias encontradas: ${guias?.length || 0}`);
    }
    
    // Verificar colaboradores
    const { data: colaboradores, error: errorColaboradores } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, cargo, status')
      .limit(5);
    
    if (errorColaboradores) {
      console.error('❌ Erro ao buscar colaboradores:', errorColaboradores);
    } else {
      console.log(`👨‍⚕️ Colaboradores encontrados: ${colaboradores?.length || 0}`);
      colaboradores?.forEach(c => {
        console.log(`  - ${c.nome_completo} (${c.cargo || 'sem cargo'}) - ${c.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

async function main() {
  await verificarDados();
  // await setupDashboardFunctions(); // Comentado por enquanto
}

if (require.main === module) {
  main();
}

export { setupDashboardFunctions, verificarDados };
