# 🏥 Sistema de Supervisão Foncare - Documentação Completa

## 📋 Visão Geral

O Sistema de Supervisão Foncare é uma solução completa para monitoramento em tempo real dos atendimentos e agenda da clínica. Integra controle de status de pacientes, supervisão de salas e análise de produtividade.

## 🚀 Funcionalidades Implementadas

### 1. **Agenda Tempo Real** 📅
- **Controle de Status**: Transição automática entre status de pacientes
- **Timer de Sessão**: Cronometragem automática dos atendimentos
- **Suporte Dual**: Gerenciamento de profissional principal e apoio
- **Filtros Avançados**: Por unidade, profissional, sala e status
- **Atualização Automática**: Dados atualizados a cada 30 segundos

### 2. **Supervisão de Atendimentos** 📊
- **Dashboard Executivo**: Visão geral com KPIs principais
- **Monitoramento por Sala**: Acompanhamento detalhado de cada ambiente
- **Taxa de Ocupação**: Cálculo automático de produtividade
- **Estatísticas em Tempo Real**: Indicadores de performance
- **Filtros por Unidade**: Análise específica por localização

## 🔄 Fluxo de Status dos Pacientes

### Status Disponíveis:
1. **agendado** 📅 - Paciente agendado pelo NAC
2. **chegou** 🚶 - Paciente confirmou presença
3. **pronto_para_terapia** ✅ - Liberado para atendimento
4. **em_atendimento** ⚡ - Sessão em andamento
5. **concluido** ✅ - Atendimento finalizado

### Transições Automáticas:
```
agendado → chegou → pronto_para_terapia → em_atendimento → concluido
```

## 🏗️ Arquitetura do Sistema

### **Database Schema**
```sql
-- Campos adicionados à tabela agendamentos
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS status_atendimento VARCHAR(50) DEFAULT 'agendado';
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS hora_chegada TIMESTAMPTZ;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS hora_inicio_atendimento TIMESTAMPTZ;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS hora_fim_atendimento TIMESTAMPTZ;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS profissional_apoio_id UUID REFERENCES colaboradores(id);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS observacoes_sessao TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS duracao_sessao_minutos INTEGER;
```

### **Views Criadas**

#### 1. **vw_agenda_tempo_real**
```sql
-- View principal para agenda em tempo real
-- Inclui dados de paciente, profissional, sala e status
-- Calcula tempo decorrido e próximos agendamentos
```

#### 2. **vw_supervisao_atendimentos**
```sql
-- View para supervisão geral
-- Agrupa dados por sala e unidade
-- Calcula estatísticas de produtividade
```

### **Funções de Sistema**

#### 1. **atualizar_status_agendamento()**
```sql
-- Função para atualizar status com log automático
-- Registra timestamps e transições
-- Calcula duração de sessões
```

#### 2. **calcular_tempo_sessao()**
```sql
-- Calcula tempo decorrido da sessão
-- Suporte para diferentes formatos de retorno
```

## 🎯 Como Usar o Sistema

### **Para Recepcionistas:**
1. **Marcar Chegada**: Quando paciente chegar, alterar status para "chegou"
2. **Liberar para Terapia**: Quando paciente estiver pronto, status "pronto_para_terapia"
3. **Acompanhar Fila**: Visualizar próximos pacientes e tempos de espera

### **Para Terapeutas:**
1. **Iniciar Atendimento**: Alterar status para "em_atendimento"
2. **Adicionar Profissional de Apoio**: Se necessário, selecionar segundo profissional
3. **Finalizar Sessão**: Alterar status para "concluido" com observações

### **Para Supervisores:**
1. **Dashboard Geral**: Acompanhar KPIs e produtividade
2. **Monitoramento por Sala**: Verificar ocupação e eficiência
3. **Análise de Tendências**: Identificar gargalos e oportunidades

## 📱 Interface do Sistema

### **Página de Supervisão** (`/supervisao`)
- **Tab "Agenda Tempo Real"**: Controle operacional
- **Tab "Supervisão de Atendimentos"**: Análise gerencial
- **Filtros**: Por unidade, profissional, sala
- **Atualização Automática**: Dados sempre atualizados

### **Componentes Principais:**

#### **AgendaTempoReal.tsx**
```tsx
// Componente principal para controle operacional
// Features:
// - Listagem de agendamentos
// - Botões de ação por status
// - Timer em tempo real
// - Filtros dinâmicos
// - Suporte a dual profissional
```

#### **SupervisaoAtendimentos.tsx**
```tsx
// Componente para supervisão gerencial
// Features:
// - KPIs principais
// - Análise por sala
// - Taxa de ocupação
// - Estatísticas avançadas
// - Gráficos de produtividade
```

## 🔧 Configurações Técnicas

### **Dependências:**
- React 18+ com Hooks
- Supabase para database
- Lucide React para ícones
- Tailwind CSS para styling
- TypeScript para tipagem

### **Performance:**
- **Atualização Agenda**: 30 segundos
- **Atualização Supervisão**: 60 segundos
- **Índices de Performance**: Criados automaticamente
- **Paginação**: Implementada para grandes volumes

### **Segurança:**
- **RLS (Row Level Security)**: Ativo em todas as tabelas
- **Logs de Auditoria**: Todas as alterações são registradas
- **Validação de Dados**: Checks de integridade
- **Controle de Acesso**: Por nível de usuário

## 📊 KPIs Monitorados

### **Indicadores Principais:**
1. **Taxa de Ocupação**: (Concluídos / Agendados) × 100
2. **Tempo Médio de Sessão**: Duração média dos atendimentos
3. **Taxa de Presença**: (Chegaram / Agendados) × 100
4. **Produtividade por Sala**: Atendimentos por ambiente
5. **Eficiência por Profissional**: Performance individual

### **Métricas em Tempo Real:**
- Pacientes agendados hoje
- Pacientes que chegaram
- Atendimentos em andamento
- Sessões concluídas
- Próximos agendamentos

## 🚀 Próximas Melhorias

### **Em Desenvolvimento:**
1. **Notificações Push**: Alertas para supervisores
2. **Relatórios Automatizados**: Envio por email
3. **App Mobile**: Versão para tablets
4. **BI Dashboard**: Analytics avançados
5. **Integração WhatsApp**: Comunicação com pacientes

### **Planejado:**
1. **Machine Learning**: Previsão de demanda
2. **API REST**: Integração com outros sistemas
3. **Backup Automático**: Proteção de dados
4. **Multi-idioma**: Suporte internacional

## 📞 Suporte Técnico

### **Contatos:**
- **Desenvolvimento**: GitHub Copilot
- **Infraestrutura**: Supabase Cloud
- **Frontend**: Next.js 14
- **Styling**: Tailwind CSS

### **Documentação Adicional:**
- `EXECUTE_SISTEMA_AGENDA_FINAL.sql` - Script completo do banco
- `AgendaTempoReal.tsx` - Componente principal
- `SupervisaoAtendimentos.tsx` - Dashboard supervisão

---

## ✅ Status de Implementação

- [x] **Database Schema** - Implementado
- [x] **Views de Sistema** - Criadas
- [x] **Funções SQL** - Implementadas
- [x] **Componente Agenda** - Funcional
- [x] **Componente Supervisão** - Funcional
- [x] **Página Principal** - Integrada
- [x] **Testes Básicos** - Aprovados
- [x] **Documentação** - Completa

**Sistema 100% Operacional** 🎉

---

*Última atualização: $(date)*
*Versão: 1.0 - Produção*
