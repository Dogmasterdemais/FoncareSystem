# 📊 SISTEMA DE SEGMENTOS DE 30 MINUTOS - IMPLEMENTADO

## 🎯 OBJETIVO
Implementar sistema de tabulação onde cada atendimento terapêutico de 90 minutos é dividido em 3 registros separados de 30 minutos no banco de dados, permitindo controle granular de presença, valores e qualidade por segmento.

## 🔄 REGRAS DE NEGÓCIO

### ✅ Salas Afetadas
- **Terapia**: Salas terapêuticas → **3 segmentos de 30 minutos**
- **Exceções**: Anamnese e Neuropsicologia → **1 registro único** (sem segmentação)

### 📊 Divisão dos Segmentos
```
Sessão de 90 minutos:
├── Segmento 1: 00:00 - 00:30 (30 min)
├── Segmento 2: 00:30 - 01:00 (30 min)
└── Segmento 3: 01:00 - 01:30 (30 min)

Valor da sessão: R$ 300,00
├── Segmento 1: R$ 100,00
├── Segmento 2: R$ 100,00
└── Segmento 3: R$ 100,00
```

## 🗄️ ESTRUTURA DE BANCO DE DADOS

### Nova Tabela: `agendamentos_segmentos`
```sql
CREATE TABLE agendamentos_segmentos (
    id UUID PRIMARY KEY,
    agendamento_principal_id UUID REFERENCES agendamentos(id),
    numero_segmento INTEGER (1, 2, ou 3),
    horario_inicio_segmento TIME,
    horario_fim_segmento TIME,
    duracao_segmento_minutos INTEGER DEFAULT 30,
    valor_segmento DECIMAL(10,2),
    status_segmento VARCHAR(30),
    profissional_presente BOOLEAN,
    paciente_presente BOOLEAN,
    segmento_realizado BOOLEAN,
    observacoes_segmento TEXT
);
```

### Campos de Status do Segmento
- `agendado` - Segmento criado e agendado
- `em_andamento` - Segmento em execução
- `concluido` - Segmento finalizado com sucesso
- `cancelado` - Segmento cancelado
- `nao_compareceu` - Paciente não compareceu
- `interrompido` - Segmento interrompido antes do final

## 🔧 FUNCIONALIDADES IMPLEMENTADAS

### 1. **Criação Automática de Segmentos**
```sql
-- Trigger que cria automaticamente 3 segmentos ao inserir agendamento em sala terapêutica
CREATE TRIGGER trigger_criar_segmentos_30min
    AFTER INSERT ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION criar_segmentos_30_minutos();
```

### 2. **Atualização Automática**
```sql
-- Trigger que atualiza segmentos quando agendamento principal é modificado
CREATE TRIGGER trigger_atualizar_segmentos_30min
    AFTER UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_segmentos_30_minutos();
```

### 3. **Verificação de Tipo de Sala**
```sql
-- Função que identifica se sala precisa de segmentação
CREATE FUNCTION eh_sala_terapia_90min(nome_sala TEXT) RETURNS BOOLEAN
```

### 4. **View Consolidada**
```sql
-- View que une dados dos segmentos com informações completas
CREATE VIEW vw_segmentos_agendamentos AS
SELECT 
    s.numero_segmento,
    s.horario_inicio_segmento,
    s.status_segmento,
    s.valor_segmento,
    p.nome as paciente_nome,
    prof.nome_completo as profissional_nome,
    sl.nome as sala_nome
FROM agendamentos_segmentos s
-- ... joins completos
```

## 📈 RELATÓRIOS E CONSULTAS

### 1. **Relatório por Dia**
```sql
SELECT * FROM relatorio_segmentos_dia('2025-01-07');
```
**Retorna:**
- Total de segmentos por sala
- Segmentos realizados vs pendentes
- Número de profissionais diferentes
- Valor total do dia

### 2. **Consulta de Segmentos por Agendamento**
```sql
SELECT * FROM vw_segmentos_agendamentos 
WHERE agendamento_principal_id = 'uuid-do-agendamento'
ORDER BY numero_segmento;
```

### 3. **Status de Segmentos em Andamento**
```sql
SELECT 
    sala_nome,
    COUNT(*) as segmentos_andamento
FROM vw_segmentos_agendamentos 
WHERE status_segmento = 'em_andamento'
GROUP BY sala_nome;
```

## 🚀 IMPLEMENTAÇÃO

### Passo 1: Executar Script Principal
```sql
-- Execute no Supabase SQL Editor
\i IMPLEMENTAR_SEGMENTOS_30_MINUTOS_SUPABASE.sql
```

### Passo 2: Popular Agendamentos Existentes
```sql
-- Criar segmentos para agendamentos já existentes
SELECT popular_segmentos_agendamentos_existentes();
```

### Passo 3: Validar Implementação
```sql
-- Verificar se segmentos foram criados corretamente
SELECT * FROM vw_segmentos_agendamentos 
WHERE data_agendamento >= CURRENT_DATE
ORDER BY data_agendamento, horario_inicio_segmento;
```

## 🔍 EXEMPLOS DE USO

### Exemplo 1: Agendamento Terapêutico
```
Agendamento Principal:
- Sala: "Terapia Ocupacional 1"
- Horário: 14:00 - 15:30
- Duração: 90 minutos
- Valor: R$ 300,00

Segmentos Criados Automaticamente:
├── Segmento 1: 14:00-14:30 (R$ 100,00)
├── Segmento 2: 14:30-15:00 (R$ 100,00)
└── Segmento 3: 15:00-15:30 (R$ 100,00)
```

### Exemplo 2: Agendamento Anamnese
```
Agendamento Principal:
- Sala: "Anamnese 1"
- Horário: 14:00 - 15:00
- Duração: 60 minutos
- Valor: R$ 200,00

Segmentos: NENHUM (não é segmentado)
```

## 📊 IMPACTOS NO SISTEMA

### ✅ Benefícios
1. **Controle Granular**: Presença por segmento de 30 min
2. **Qualidade**: Avaliação detalhada de cada período
3. **Flexibilidade**: Permite interrupções e retomadas
4. **Relatórios**: Análises detalhadas de produtividade
5. **Pagamentos**: Valores proporcionais por segmento

### ⚙️ Automação
- **Criação**: Automática ao inserir agendamento
- **Atualização**: Automática ao modificar agendamento
- **Exclusão**: Cascata ao excluir agendamento principal
- **Valores**: Cálculo automático (valor_total ÷ 3)

### 🔄 Compatibilidade
- **Views Existentes**: Mantidas e funcionais
- **Triggers Atuais**: Não interferem
- **APIs**: Requerem adaptação para usar segmentos
- **Relatórios**: Podem usar nova view consolidada

## 🎯 STATUS DA IMPLEMENTAÇÃO

### ✅ Concluído
- [x] Estrutura de banco de dados
- [x] Triggers automáticos
- [x] Funções de controle
- [x] View consolidada
- [x] Função de relatórios
- [x] Documentação completa
- [x] Scripts de validação
- [x] Testes de integração

### 🔄 Próximos Passos
1. **Integração Frontend**: Adaptar componentes React para exibir segmentos
2. **APIs**: Criar endpoints para gestão de segmentos
3. **Relatórios**: Desenvolver dashboards específicos
4. **Mobile**: Adaptar PWA para controle por segmento

## 📋 COMANDOS ÚTEIS

### Verificar Segmentos de um Agendamento
```sql
SELECT numero_segmento, horario_inicio_segmento, status_segmento
FROM agendamentos_segmentos 
WHERE agendamento_principal_id = 'uuid-agendamento';
```

### Marcar Segmento como Realizado
```sql
UPDATE agendamentos_segmentos 
SET segmento_realizado = true,
    status_segmento = 'concluido',
    profissional_presente = true,
    paciente_presente = true
WHERE id = 'uuid-segmento';
```

### Relatório de Produtividade Diária
```sql
SELECT * FROM relatorio_segmentos_dia(CURRENT_DATE);
```

---

## 🏆 RESULTADO FINAL

O sistema agora possui **controle granular de 30 minutos** para todas as sessões terapêuticas, mantendo **compatibilidade total** com o sistema existente e adicionando **funcionalidades avançadas** de controle e relatórios.

**Data de Implementação:** 07/01/2025  
**Status:** ✅ IMPLEMENTADO E TESTADO
