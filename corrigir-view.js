import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://ctibgcazmxgegzkncptz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aWJnY2F6bXhnZWd6a25jcHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ5ODA5NCwiZXhwIjoyMDUxMDc0MDk0fQ.R0dFUo9ROc3hqyVtm4WbCjPLHW9QMC3QJfzKSAaIBKk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function corrigirView() {
  console.log('🔧 Iniciando correção da view vw_agendamentos_completo...')
  
  try {
    // Ler o arquivo SQL
    const sqlContent = readFileSync('./corrigir_view_sala_espera.sql', 'utf8')
    
    // Executar a query
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Erro ao executar correção:', error)
      return
    }
    
    console.log('✅ View corrigida com sucesso!')
    console.log('✅ Campos adicionados: data_chegada, codigo_autorizacao, numero_guia, data_autorizacao, validade_autorizacao, numero_agendamento')
    
    // Verificar se a view foi criada
    const { data, error: checkError } = await supabase
      .from('information_schema.views')
      .select('*')
      .eq('table_name', 'vw_agendamentos_completo')
    
    if (checkError) {
      console.error('❌ Erro ao verificar view:', checkError)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ View vw_agendamentos_completo está ativa!')
    } else {
      console.log('⚠️ View não foi encontrada')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

corrigirView().then(() => {
  console.log('🏁 Processo finalizado!')
  process.exit(0)
})
