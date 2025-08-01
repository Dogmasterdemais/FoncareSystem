# Nova Regra de Duração de Sessões - Implementada ✅

## Regra Implementada

O NAC agenda o paciente, com exceção de anamnese e neuropsicologia, as demais salas de terapia são com horário travado de 90 minutos, porque assim conseguiremos fazer com que as terapias fiquem de 30 em 30 minutos com os profissionais da sala.

## Detalhamento Técnico

### Salas com Duração Flexível
- **Anamnese**: Duração baseada no tipo_sessao (30/60/90 min)
- **Neuropsicologia**: Duração baseada no tipo_sessao (30/60/90 min)

### Salas com Duração Fixa
- **Todas as outras salas de terapia**: 90 minutos fixos
  - Fonoaudiologia: 90 min
  - Fisioterapia: 90 min
  - Terapia Ocupacional: 90 min
  - Psicologia: 90 min
  - Psicopedagogia: 90 min
  - Psicomotricidade: 90 min
  - Musicoterapia: 90 min
  - Educação Física: 90 min

## Benefícios da Regra

### Rotação de Profissionais
- Com 90 minutos por sessão, permite rotação de 30 em 30 minutos
- Profissional 1: 0-30 min
- Profissional 2: 30-60 min  
- Profissional 3: 60-90 min

### Flexibilidade para Anamnese e Neuropsicologia
- Anamnese mantém flexibilidade conforme necessidade
- Neuropsicologia mantém duração variável por ser avaliação específica

## Arquivos Modificados

### 1. Banco de Dados (SQL)
- **Arquivo**: `implementar_regra_duracao_90_minutos.sql`
- **View**: `vw_agendamentos_completo` - Atualizada com nova lógica de duração
- **Função**: `obter_duracao_sessao()` - Criada para determinar duração baseada na sala

### 2. Frontend (React)
- **Arquivo**: `src/components/AgendaSalasProfissionais.tsx`
- **Linha**: 1169 - Atualizada lógica de `duracao_planejada`
- **Lógica**: Implementada função inline que verifica nome da sala

### 3. Componentes que Usam a View
- **ControleSalasProfissional.tsx**: ✅ Usa `vw_agendamentos_completo` (atualizada automaticamente)
- **AgendaTempoReal.tsx**: ✅ Usa campo `duracao_planejada` da view
- **AgendaSalasProfissionaisModerna.tsx**: ✅ Usa campo `duracao_planejada` da view

## Lógica Implementada

### No SQL (View)
```sql
-- NOVA REGRA DE DURAÇÃO: 90 min para terapias, flexível para anamnese/neuropsicologia
CASE 
    -- Para Anamnese: duração flexível baseada no tipo_sessao
    WHEN LOWER(s.nome) LIKE '%anamnese%' THEN
        CASE 
            WHEN a.tipo_sessao = 'individual' THEN 30
            WHEN a.tipo_sessao = 'compartilhada' THEN 60  
            WHEN a.tipo_sessao = 'tripla' THEN 90
            ELSE 60
        END
    -- Para Neuropsicologia: duração flexível baseada no tipo_sessao
    WHEN LOWER(s.nome) LIKE '%neuropsicolog%' THEN
        CASE 
            WHEN a.tipo_sessao = 'individual' THEN 30
            WHEN a.tipo_sessao = 'compartilhada' THEN 60  
            WHEN a.tipo_sessao = 'tripla' THEN 90
            ELSE 60
        END
    -- Para todas as outras salas de terapia: duração fixa de 90 minutos
    ELSE 90
END as duracao_planejada
```

### No React (Componente)
```typescript
duracao_planejada: (() => {
  const salaNome = agendamento.salas?.nome || '';
  // Para Anamnese e Neuropsicologia: duração flexível
  if (salaNome.toLowerCase().includes('anamnese') || 
      salaNome.toLowerCase().includes('neuropsicolog')) {
    return agendamento.tipo_sessao === 'tripla' ? 90 : 
           agendamento.tipo_sessao === 'compartilhada' ? 60 : 30;
  }
  // Para todas as outras salas de terapia: 90 minutos fixo
  return 90;
})()
```

## Testes Recomendados

1. **Testar agendamento em sala de Anamnese**: Verificar duração flexível
2. **Testar agendamento em sala de Neuropsicologia**: Verificar duração flexível  
3. **Testar agendamento em salas de terapia**: Verificar duração fixa de 90 min
4. **Testar rotação de profissionais**: Verificar intervalos de 30 min

## Status da Implementação

- ✅ Regra implementada no banco de dados
- ✅ View atualizada com nova lógica
- ✅ Função SQL criada para facilitar uso
- ✅ Componente React atualizado
- ✅ Testes de verificação incluídos no SQL
- ✅ Documentação criada

## Data de Implementação
31 de julho de 2025
