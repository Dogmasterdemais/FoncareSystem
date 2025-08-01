import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctibgcazmxgegzkncptz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aWJnY2F6bXhnZWd6a25jcHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ5ODA5NCwiZXhwIjoyMDUxMDc0MDk0fQ.R0dFUo9ROc3hqyVtm4WbCjPLHW9QMC3QJfzKSAaIBKk'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
})

async function corrigirView() {
  console.log('🔧 Iniciando correção da view vw_agendamentos_completo...')
  
  try {
    // Primeiro, dropar a view existente
    console.log('🗑️ Removendo view existente...')
    const { error: dropError } = await supabase.rpc('drop_view_agendamentos_completo')
    
    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Erro ao dropar view:', dropError)
    } else {
      console.log('✅ View removida com sucesso!')
    }
    
    // Criar a nova view com todos os campos
    console.log('🔨 Criando nova view com campos corrigidos...')
    const { error: createError } = await supabase.rpc('create_view_agendamentos_completo')
    
    if (createError) {
      console.error('❌ Erro ao criar view:', createError)
      return
    }
    
    console.log('✅ View criada com sucesso!')
    console.log('✅ Campos incluídos: data_chegada, codigo_autorizacao, numero_guia, data_autorizacao, validade_autorizacao, numero_agendamento')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

corrigirView().then(() => {
  console.log('🏁 Processo finalizado!')
  process.exit(0)
})
