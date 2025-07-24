// Script para executar migração do campo documento
import { supabase } from '../lib/supabaseClient';

export async function executarMigracaoDocumento() {
  console.log('Executando migração do campo documento...');
  
  try {
    // Tentar adicionar o campo documento
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE pacientes 
        ADD COLUMN IF NOT EXISTS documento VARCHAR(20);
        
        CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
        
        COMMENT ON COLUMN pacientes.documento IS 'Documento geral (pode ser usado para outros tipos de documento)';
      `
    });

    if (error) {
      console.error('Erro na migração:', error);
      return false;
    }

    console.log('Migração executada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    return false;
  }
}

// Função para verificar se o campo existe
export async function verificarCampoDocumento() {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('documento')
      .limit(1);
    
    if (error) {
      console.error('Campo documento não existe:', error);
      return false;
    }
    
    console.log('Campo documento existe!');
    return true;
  } catch (error) {
    console.error('Erro ao verificar campo documento:', error);
    return false;
  }
}
