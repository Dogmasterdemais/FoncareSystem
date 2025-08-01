# Integração de Views para Agendamentos e Recepção

## 🎯 Objetivo

Implementar uma solução completa de integração entre salas, profissionais e agendamentos, permitindo que as telas de agendamento e recepção mostrem nomes completos ao invés de IDs, com visualização rica dos dados.

## 📋 O que foi implementado

### 1. Hook personalizado (`useAgendamentoView.ts`)

**Localização:** `src/hooks/useAgendamentoView.ts`

**Funcionalidades:**
- Carregamento inteligente de agendamentos (tenta usar views, fallback para queries manuais)
- Busca de salas disponíveis com profissionais alocados
- Listagem de profissionais disponíveis por unidade
- Tratamento automático de erros e estados de loading
- Formatação de dados para interface

**Principais métodos:**
```typescript
const {
  agendamentos,                    // Lista de agendamentos com dados completos
  salasDisponiveis,               // Salas com informações de ocupação
  profissionaisDisponiveis,       // Profissionais ativos e suas salas
  loading,                        // Estado de carregamento
  error,                         // Mensagens de erro
  carregarAgendamentos,          // Função para buscar agendamentos
  carregarSalasDisponiveis,      // Função para buscar salas
  carregarProfissionaisDisponiveis // Função para buscar profissionais
} = useAgendamentoView();
```

### 2. Componente de seleção de salas (`SeletorSalasAgendamento.tsx`)

**Localização:** `src/components/agendamento/SeletorSalasAgendamento.tsx`

**Características:**
- ✅ Busca em tempo real por nome, número ou especialidade
- ✅ Filtros por tipo de sala e disponibilidade
- ✅ Indicadores visuais de ocupação (cores)
- ✅ Lista de profissionais alocados por sala
- ✅ Informações de capacidade e vagas disponíveis
- ✅ Interface responsiva e acessível

**Estados visuais das salas:**
- 🟢 **Verde:** Disponível (2+ vagas livres)
- 🟡 **Amarelo:** Quase cheia (1 vaga livre)
- 🔴 **Vermelho:** Lotada (0 vagas livres)

### 3. Componente de agenda da recepção (`AgendaRecepcao.tsx`)

**Localização:** `src/components/recepcao/AgendaRecepcao.tsx`

**Funcionalidades:**
- ✅ Visualização de agendamentos por período
- ✅ Busca por paciente, profissional, sala ou número da guia
- ✅ Filtros por status do agendamento
- ✅ Agrupamento por data com formatação inteligente
- ✅ Expansão de detalhes com informações completas
- ✅ Estatísticas rápidas por status
- ✅ Cores das salas e status visuais

**Informações exibidas:**
- **Paciente:** Nome completo e telefone
- **Profissional:** Nome completo e especialidade/cargo
- **Sala:** Nome, número, cor e tipo
- **Convênio:** Nome do convênio
- **Equipe:** Lista de profissionais alocados na sala
- **Observações:** Notas sobre o agendamento

### 4. Página de exemplo (`exemplo-integracao/page.tsx`)

**Localização:** `src/app/exemplo-integracao/page.tsx`

**Demonstra:**
- Integração completa entre os componentes
- Fluxo de criação de agendamento com seleção de sala
- Visualização de agenda da recepção
- Interface com abas para diferentes funcionalidades

## 🛠️ Estrutura técnica

### Scripts SQL criados

**Arquivo:** `criar_views_salas_profissionais.sql`

**Views implementadas:**

1. **`vw_salas_profissionais`** - Salas com profissionais alocados
2. **`vw_agendamentos_completo`** - Agendamentos com dados relacionados
3. **`vw_salas_para_agendamento`** - Salas otimizadas para seleção

### Fallback inteligente

Se as views não existirem no banco, o sistema automaticamente usa queries manuais com JOINs, garantindo compatibilidade total.

## 🚀 Como usar

### 1. No componente de agendamento:

```tsx
import { SeletorSalasAgendamento } from '@/components/agendamento/SeletorSalasAgendamento';

<SeletorSalasAgendamento
  unidadeId={unidadeSelecionada}
  onSalaSelecionada={(sala) => {
    console.log('Sala selecionada:', sala);
    // Usar dados da sala no agendamento
  }}
  salaAtual={salaAtualId}
/>
```

### 2. Na tela da recepção:

```tsx
import { AgendaRecepcao } from '@/components/recepcao/AgendaRecepcao';

<AgendaRecepcao />
```

### 3. Hook direto (para customizações):

```tsx
import { useAgendamentoView } from '@/hooks/useAgendamentoView';

const { agendamentos, carregarAgendamentos } = useAgendamentoView();

useEffect(() => {
  carregarAgendamentos(unidadeId, dataInicio, dataFim);
}, [unidadeId, dataInicio, dataFim]);
```

## 📊 Dados disponíveis

### Agendamento completo:
```typescript
interface AgendamentoCompleto {
  // Dados básicos
  id: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  
  // Dados do paciente
  paciente_nome: string;
  paciente_telefone: string;
  
  // Dados do profissional
  profissional_nome: string;
  profissional_especialidade: string;
  
  // Dados da sala
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  
  // Profissionais da sala
  profissionais_sala: string;
  
  // Outros dados
  convenio_nome: string;
  unidade_nome: string;
  observacoes: string;
}
```

### Sala para agendamento:
```typescript
interface SalaParaAgendamento {
  sala_id: string;
  sala_nome: string;
  sala_tipo: string;
  sala_cor: string;
  capacidade_maxima: number;
  profissionais_alocados: number;
  vagas_disponiveis: number;
  profissionais_disponiveis: string; // Lista formatada
  especialidade_nome: string;
  unidade_nome: string;
}
```

## 🔧 Manutenção

### Para adicionar novos campos:

1. **Atualizar interface TypeScript** no hook
2. **Modificar queries** no `useAgendamentoView`
3. **Ajustar componentes** para exibir os novos dados
4. **Atualizar views SQL** se necessário

### Para novos filtros:

1. **Adicionar estado** no componente
2. **Implementar lógica de filtro** 
3. **Criar inputs** na interface
4. **Testar compatibilidade**

## ✅ Status da implementação

- ✅ Hook de integração funcionando
- ✅ Componente de seleção de salas
- ✅ Agenda da recepção completa
- ✅ Página de exemplo
- ✅ Fallback para queries manuais
- ✅ Tratamento de erros
- ✅ Interface responsiva
- ✅ Acessibilidade básica

## 🔄 Próximos passos sugeridos

1. **Integrar nas telas existentes** de agendamento
2. **Adicionar paginação** para grandes volumes
3. **Implementar cache** de dados
4. **Adicionar notificações** em tempo real
5. **Criar relatórios** baseados nas views
6. **Otimizar performance** das queries

---

**Nota:** Esta implementação está pronta para produção e pode ser integrada imediatamente nas telas de agendamento e recepção existentes do sistema.
