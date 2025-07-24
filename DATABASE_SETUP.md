# Configuração do Banco de Dados - Foncare System

## 🚀 Setup Inicial

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings** > **API** e copie:
   - `Project URL`
   - `anon public key`

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Executar Migrações

Execute os scripts SQL na seguinte ordem no **SQL Editor** do Supabase:

1. **Estrutura Básica:**
   ```bash
   migration_pacientes.sql
   ```

2. **Estrutura Completa:**
   ```bash
   migration_completa_especificacoes.sql
   ```

3. **Dados de Exemplo:**
   ```bash
   dados_exemplo_sistema.sql
   ```

## 🎯 Testando o Sistema

Após executar todas as migrações:

1. **Acesse a página:** `http://localhost:3003/nac/agendamentos`
2. **Clique em "Novo Agendamento"** para testar o formulário
3. **Selecione os dados:**
   - Paciente: Ana Silva Santos, Pedro Costa Lima, etc.
   - Especialidade: Fonoaudiologia, Psicologia, Neuropsicologia, etc.
   - Configure datas e horários
4. **Teste as modalidades especiais:**
   - **Neuropsicologia:** Cria 6 sessões automaticamente
   - **Anamnese:** Sessão única
   - **Outras especialidades:** Opção de 12 sessões (3 meses)

## 📊 Estrutura do Banco

### Tabelas Principais:

- `pacientes` - Cadastro de pacientes
- `unidades` - Unidades da clínica
- `convenios` - Convênios médicos
- `especialidades` - Especialidades médicas
- `salas` - Salas de atendimento
- `profissionais` - Profissionais da clínica
- `agendamentos` - Sistema de agendamentos

### Views:

- `vw_agendamentos_completo` - View completa com joins
- `vw_pacientes_completo` - Pacientes com informações completas

## 🔧 Funcionalidades Implementadas

### ✅ Página NAC Agendamentos

- **Visualização Calendário:** Vista semanal interativa
- **Visualização Lista:** Tabela detalhada
- **Estatísticas:** Dashboard em tempo real
- **Cores por Especialidade:** Sistema visual intuitivo
- **Ações Rápidas:** Marcar presença/falta
- **Dados Reais:** Integração completa com Supabase

### 🎨 Especialidades e Cores:

- 🔵 **Fonoaudiologia:** #0052CC
- 🔵 **Terapia Ocupacional:** #00E6F6  
- 🟢 **Psicologia:** #38712F
- 🔴 **Psicopedagogia:** #D20000
- 🟤 **Educador Físico:** #B45A00
- 🟠 **Psicomotricidade:** #F58B00
- 🟡 **Musicoterapia/Ludoterapia/Arterapia:** #F5C344
- 🟣 **Fisioterapia:** #C47B9C
- ⚫ **Neuropsicologia:** #000000
- ⚪ **Anamnese:** #808080

## 🚀 Como Testar

1. Execute as migrações no Supabase
2. Inicie o servidor: `npm run dev`
3. Acesse: `http://localhost:3003/nac/agendamentos`
4. Navegue entre visualizações (Calendário/Lista)
5. Teste ações de presença/falta

## 📱 Próximas Implementações

- [ ] Dashboard com mapas de calor
- [ ] Recepção - Sala de Espera
- [ ] Cronograma do Paciente (PDF)
- [ ] Sistema de notificações
- [ ] Relatórios avançados

## 🔍 Troubleshooting

### Problema: Dados não aparecem
**Solução:** Verifique se as migrações foram executadas e dados de exemplo inseridos

### Problema: Erro de conexão
**Solução:** Verifique as variáveis de ambiente no `.env.local`

### Problema: Cores não aparecem
**Solução:** Verifique se as especialidades foram inseridas com as cores corretas
