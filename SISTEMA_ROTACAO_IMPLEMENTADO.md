# 🎯 Sistema de Rotação Automática - 3 Profissionais por Sala

## 📋 Resumo da Implementação

Implementação completa do sistema de rotação obrigatória onde cada paciente deve passar **30 minutos com cada um dos 3 profissionais** da sala, com alocação automática e capacidade máxima de 2 pacientes por profissional.

## ✅ Funcionalidades Implementadas

### 1. **Cards Fixos com Divisão Visual** 🖼️
- ✅ Layout de 3 profissionais com divisão azul (conforme solicitado)
- ✅ Indicadores de capacidade (2 pacientes máx por profissional)
- ✅ Status visual: Verde (ocupado) / Cinza (livre)
- ✅ Contadores em tempo real de pacientes por profissional

### 2. **Alocação Automática** 🎯
- ✅ Sistema inteligente: "se profissional 1 estiver com dois pacientes, automaticamente cai com o profissional 2"
- ✅ Lógica de overflow automático (Prof1 → Prof2 → Prof3)
- ✅ Máximo 2 pacientes simultâneos por profissional
- ✅ Máximo 6 pacientes total por sala (3 profissionais × 2 cada)

### 3. **Rotação Obrigatória de 30 Minutos** ⏰
- ✅ Timer automático de 30 minutos por profissional
- ✅ Rotação automática: Prof1 (30min) → Prof2 (30min) → Prof3 (30min)
- ✅ Total de 90 minutos por paciente (3 profissionais × 30min)
- ✅ Indicadores visuais de progresso da rotação

### 4. **Interface Aprimorada** 🎨
- ✅ Cards com progresso visual da rotação (1/3, 2/3, 3/3)
- ✅ Barra de progresso para os 30 minutos
- ✅ Alertas de rotação: "⚠️ Próximo da rotação (30min)"
- ✅ Status dinâmicos: "🔄 Transferindo para Prof. 2"
- ✅ Botões contextuais: "🎯 Iniciar Rotação", "🔄 Próximo", "✅ Finalizar"

### 5. **Extensões de Horário** 📅
- ✅ Grade estendida até 20:00 (antes era 18:00)
- ✅ Campo horário_fim editável manualmente
- ✅ Remoção do cálculo automático do horário fim

### 6. **Sistema de Monitoramento** 📊
- ✅ Verificação automática a cada 10 segundos
- ✅ Recarregamento de dados a cada 30 segundos
- ✅ Logs detalhados de rotações e alocações
- ✅ Auditoria completa de todas as ações

## 🗃️ Estrutura do Banco de Dados

### Campos Adicionados na Tabela `agendamentos`:
```sql
tempo_profissional_3          INTEGER      -- Tempo com profissional 3
profissional_inicio_timestamps JSONB       -- Timestamps de início com cada prof
historico_rotacoes            JSONB        -- Histórico detalhado das rotações
rotacao_completa              BOOLEAN      -- Flag: passou pelos 3 profissionais
```

### Funções SQL Criadas:
1. **`alocar_paciente_profissional()`** - Alocação automática
2. **`rotacionar_paciente_profissional()`** - Rotação entre profissionais
3. **`verificar_rotacoes_automaticas()`** - Verificação automática de rotações
4. **`obter_estatisticas_sala()`** - Estatísticas em tempo real

### View Atualizada:
- **`vw_agendamentos_completo`** - Inclui todos os campos de rotação e status dinâmicos

## 🚀 Arquivos Modificados/Criados

### Frontend (React/TypeScript):
1. **`src/app/nac/agendamentos/page.tsx`**
   - ✅ Horários estendidos até 20:00
   - ✅ Campo horário_fim editável

2. **`src/components/AgendaSalasProfissionais.tsx`**
   - ✅ Sistema completo de rotação
   - ✅ Cards fixos com divisão visual
   - ✅ Alocação automática
   - ✅ Interface aprimorada

### Backend (SQL):
3. **`rotacao_estrutura_banco.sql`**
   - ✅ Modificações na estrutura do banco
   - ✅ Novas colunas e view atualizada

4. **`rotacao_automatica_funcoes.sql`**
   - ✅ Funções para alocação e rotação
   - ✅ Sistema de auditoria

## 📱 Como Usar o Sistema

### 1. **Chegada do Paciente:**
1. Paciente chega e status muda para "chegou"
2. Clique em "📋 Pronto" → status: "pronto_para_terapia"
3. Clique em "🎯 Iniciar Rotação" → **Alocação automática**

### 2. **Alocação Automática:**
- Sistema verifica capacidade dos profissionais
- Se Prof1 tem < 2 pacientes → aloca para Prof1
- Se Prof1 lotado mas Prof2 livre → aloca para Prof2
- Se Prof1 e Prof2 lotados → aloca para Prof3

### 3. **Rotação de 30 Minutos:**
- **0-30min**: Paciente com Profissional 1
- **30-60min**: Rotação automática para Profissional 2  
- **60-90min**: Rotação automática para Profissional 3
- **90min+**: Sessão completa, pode finalizar

### 4. **Controles Manuais:**
- **"🔄 Próximo"**: Forçar rotação antes dos 30min
- **"⏹️ Parar"**: Finalizar sessão prematuramente
- **"✅ Finalizar"**: Concluir após rotação completa

## 🎯 Indicadores Visuais

### Cards dos Profissionais:
```
🩺 Profissional 1    🧑‍⚕️ Profissional 2    👩‍⚕️ Profissional 3
Dr. João Silva      |  Dra. Maria Santos   |  Dr. Pedro Costa
Pacientes: 2/2      |  Pacientes: 1/2      |  Pacientes: 0/2  
30min cada          |  30min cada          |  30min cada
```

### Progresso da Rotação:
```
Rotação Obrigatória              Prof. 2/3
████████████████░░░░░░░░░░░░     (Verde: completo, Cinza: pendente)
🧑‍⚕️ Agora com Prof. 2

Timer: 15min / 30min
██████████████████░░░░░░░░░░     (Barra de progresso azul)
```

## 🔧 Configurações do Sistema

### Capacidades:
- **2 pacientes máximo** por profissional simultaneamente
- **6 pacientes máximo** por sala (3 × 2)
- **30 minutos obrigatórios** com cada profissional
- **90 minutos total** por paciente

### Timers:
- **10 segundos**: Verificação de rotações automáticas
- **30 segundos**: Recarregamento completo dos dados
- **30 minutos**: Tempo por profissional

### Horários:
- **Início**: 06:00 (configurável)
- **Fim**: 20:00 (antes era 18:00)
- **Intervalos**: 30 minutos (padrão)

## 🧪 Para Testar o Sistema

### 1. **Executar Scripts SQL:**
```bash
# No Supabase SQL Editor:
1. Executar: rotacao_estrutura_banco.sql
2. Executar: rotacao_automatica_funcoes.sql
```

### 2. **Acessar Interface:**
```bash
npm run dev
# Acesse: http://localhost:3001/nac/agendamentos
```

### 3. **Fluxo de Teste:**
1. Criar agendamento para hoje
2. Marcar paciente como "chegou"
3. Clicar "📋 Pronto" → "🎯 Iniciar Rotação"
4. Observar alocação automática para Prof1
5. Aguardar ou forçar rotação para Prof2
6. Aguardar ou forçar rotação para Prof3
7. Finalizar sessão completa

## 📊 Monitoramento e Logs

### Logs no Console:
```
🎯 Iniciando alocação automática - Agendamento: abc123, Sala: def456
📊 Pacientes por profissional: {1: 1, 2: 0, 3: 0}
✅ Paciente alocado para Profissional 1
⏰ Paciente João Silva completou 30min com profissional 1
🔄 Rotacionando paciente João Silva do profissional 1 para 2
✅ Rotação concluída - Paciente agora com profissional 2
```

### Auditoria no Banco:
- Todas as ações ficam registradas na tabela `agendamentos_auditoria`
- Histórico detalhado em `historico_rotacoes` (JSONB)
- Timestamps precisos de cada rotação

## 🎉 Resultado Final

O sistema agora implementa **exatamente** o que foi solicitado:

1. ✅ **"Cards fixos com divisão azul"** - Layout visual implementado
2. ✅ **"Automaticamente cai com profissional 1, se estiver com dois pacientes, automaticamente cai com profissional 2"** - Lógica de alocação
3. ✅ **"Obrigatoriamente o paciente deve ser atendido pelos 3 profissionais, cada um realiza 30 minutos"** - Sistema de rotação
4. ✅ **"Aumentar grade até 20:00"** - Horários estendidos
5. ✅ **"Liberar campo horário fim para edição"** - Campo editável

O sistema é **totalmente automático** mas permite **controle manual** quando necessário, com **interface visual clara** e **monitoramento em tempo real**! 🚀
