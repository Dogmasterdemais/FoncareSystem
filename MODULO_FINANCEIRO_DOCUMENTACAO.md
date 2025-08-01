# Módulo Financeiro - FoncareSystem

## 📋 Visão Geral

O Módulo Financeiro é um sistema completo de gestão financeira para clínicas médicas, oferecendo controle total sobre receitas, despesas, glosas, folhas de pagamento e emissão de notas fiscais.

## ✨ Funcionalidades Principais

### 1. 💳 Contas a Pagar
- **Cadastro diferenciado**: Separação entre contas de consumo e outras categorias
- **Categorias**: Fixa, Variável, Consumo, Investimento
- **Status**: Pendente, Pago, Atrasado, Cancelado
- **Controles**: Vencimento, fornecedor, método de pagamento
- **Alertas**: Notificações de vencimento

#### Funcionalidades:
- ✅ Cadastro completo de contas
- ✅ Filtros por status, categoria e fornecedor
- ✅ Resumo financeiro por categoria
- ✅ Controle de vencimentos
- ✅ Histórico de pagamentos

### 2. 💰 Contas a Receber
- **Origens de receita**: Guias tabuladas, particulares, procedimentos, exames, consultas
- **Rastreamento**: Identificação detalhada da origem de cada receita
- **Glosas**: Controle de valores glosados com percentuais
- **Convênios**: Integração com sistema de convênios

#### Funcionalidades:
- ✅ Visualização por origem de receita
- ✅ Análise detalhada de glosas
- ✅ Relatórios Python automáticos
- ✅ Dashboard de receitas
- ✅ Status de recebimento

### 3. 👥 Folha de Pagamento

#### CLT (Consolidação das Leis do Trabalho):
- **Dados**: Salário base, horas extras, benefícios
- **Cálculos automáticos**: INSS, IRRF, FGTS, encargos patronais
- **Custo total**: Salário + encargos (34% automaticamente calculado)

#### PJ (Pessoa Jurídica):
- **Repasses**: Percentual configurável (padrão 80%)
- **Honorários**: Controle de valores por profissional
- **Flexibilidade**: Diferentes percentuais por profissional

### 4. 📊 Relatórios Financeiros
- **Receitas por origem**: Análise detalhada das fontes de receita
- **Análise de glosas**: Provisão vs pagamento real
- **Fluxo de caixa**: Integração completa de receitas e despesas
- **Scripts Python**: Análises automáticas e relatórios descritivos

### 5. 📄 Emissão de Notas Fiscais
- **NFe automática**: Integração com sistema fiscal
- **Controle de status**: Emitida, pendente, cancelada
- **Valores**: Serviços, ISS, total
- **Integração**: Ligação com agendamentos e pacientes

## 🗄️ Estrutura de Banco de Dados

### Tabelas Principais:

#### `contas_pagar`
```sql
- id (UUID)
- descricao (VARCHAR)
- fornecedor (VARCHAR)
- valor (DECIMAL)
- data_vencimento (DATE)
- categoria (ENUM: Consumo, Fixa, Variavel, Investimento)
- status (ENUM: Pendente, Pago, Atrasado, Cancelado)
- observacoes (TEXT)
```

#### `contas_receber`
```sql
- id (UUID)
- paciente_id (UUID FK)
- descricao (VARCHAR)
- valor_bruto (DECIMAL)
- valor_liquido (DECIMAL)
- valor_glosa (DECIMAL)
- percentual_glosa (COMPUTED)
- origem (ENUM: Guia_Tabulada, Particular, Procedimento, Exame, Consulta)
- status (ENUM: Pendente, Recebido, Atrasado, Glosa_Total, Glosa_Parcial)
```

#### `folha_clt`
```sql
- id (UUID)
- colaborador_id (UUID FK)
- salario_base (DECIMAL)
- encargos_patronais (DECIMAL COMPUTED)
- custo_total (DECIMAL COMPUTED)
```

#### `folha_pj`
```sql
- id (UUID)
- profissional_id (UUID FK)
- valor_bruto (DECIMAL)
- percentual_repasse (DECIMAL DEFAULT 80.00)
- valor_repasse (DECIMAL COMPUTED)
- valor_clinica (DECIMAL COMPUTED)
```

### Views Especializadas:

#### `vw_dashboard_financeiro`
Resumo consolidado por unidade com:
- Receitas confirmadas e pendentes
- Despesas pagas e pendentes
- Totais de folha CLT e PJ
- Indicadores de glosas

#### `vw_analise_glosas`
Análise detalhada de glosas com:
- Comparativo provisão vs recebimento
- Percentuais por convênio
- Evolução temporal
- Identificação de padrões

#### `vw_receitas_origem`
Detalhamento das origens de receita:
- Quantidade por origem
- Valores médios (ticket médio)
- Performance por período
- Status de recebimento

## 🐍 Scripts Python de Análise

### `analise_financeira.py`

#### Funcionalidades:
1. **Análise de Receitas por Origem**
   - Soma de valores por fonte
   - Identificação de tendências
   - Cálculo de tickets médios

2. **Análise Detalhada de Glosas**
   - Provisão vs pagamento real
   - Percentuais por convênio
   - Alertas de performance

3. **Projeção de Fluxo de Caixa**
   - Baseada em dados históricos
   - Projeções para 6 meses
   - Alertas de resultados negativos

4. **Resumo Executivo**
   - Indicadores principais
   - Alertas automáticos
   - Recomendações de ação

#### Como usar:
```bash
cd scripts/
python analise_financeira.py
```

#### Saída:
- Arquivo JSON com análise completa
- Relatórios em PDF (opcional)
- Dashboard executivo

## 📈 Principais Indicadores

### KPIs Automáticos:
1. **Taxa de Glosa Geral**: (Total Glosado / Total Provisionado) × 100
2. **Ticket Médio por Origem**: Valor Total / Quantidade de Guias
3. **Crescimento Mensal**: Tendência linear de receitas
4. **Percentual de Recebimento**: Recebido / (Recebido + Pendente)
5. **Custo da Folha**: (CLT + PJ) / Receita Total × 100

### Alertas Automáticos:
- 🚨 Taxa de glosa > 10%
- 📉 Crescimento mensal negativo
- 💰 Projeção negativa 6 meses
- ⏰ Contas próximas ao vencimento
- 📊 Despesas > 90% da receita

## 🔧 Configuração e Instalação

### 1. Banco de Dados
Execute o script SQL de estrutura:
```bash
psql -f modulo_financeiro_estrutura.sql
```

### 2. Dependências Python
```bash
pip install pandas psycopg2 matplotlib seaborn numpy
```

### 3. Variáveis de Ambiente
```env
SUPABASE_DB_HOST=seu_host
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=seu_usuario
SUPABASE_DB_PASSWORD=sua_senha
SUPABASE_DB_PORT=5432
```

## 🎯 Casos de Uso

### Gestão Diária:
1. **Conferência de Recebimentos**
   - Verificar guias processadas
   - Identificar glosas
   - Confirmar recebimentos

2. **Controle de Pagamentos**
   - Contas próximas ao vencimento
   - Aprovação de pagamentos
   - Classificação por categoria

3. **Acompanhamento de Performance**
   - Dashboard em tempo real
   - Indicadores do dia/semana/mês
   - Comparativos históricos

### Gestão Estratégica:
1. **Análise de Rentabilidade**
   - ROI por origem de receita
   - Eficiência por convênio
   - Otimização de custos

2. **Planejamento Financeiro**
   - Projeções de fluxo de caixa
   - Orçamento anual
   - Metas de crescimento

3. **Auditoria e Compliance**
   - Relatórios fiscais
   - Controle de NFes
   - Histórico de transações

## 🔒 Segurança e Controles

### Row Level Security (RLS):
- Acesso por unidade
- Segregação de dados
- Auditoria de alterações

### Controles de Integridade:
- Validação de valores
- Consistência de status
- Histórico de alterações

### Backup e Recovery:
- Views materializadas
- Logs de transações
- Procedures de recuperação

## 📞 Suporte e Manutenção

### Monitoramento:
- Performance de queries
- Uso de índices
- Crescimento de tabelas

### Otimizações:
- Particionamento por data
- Índices compostos
- Procedures otimizadas

### Atualizações:
- Novos relatórios
- Funcionalidades adicionais
- Integrações externas

---

## 🚀 Próximas Funcionalidades

### Em Desenvolvimento:
- [ ] Integração com bancos (API bancária)
- [ ] Conciliação automática
- [ ] Dashboard em tempo real
- [ ] Relatórios gráficos avançados
- [ ] Integração com contabilidade
- [ ] App mobile para gestores

### Planejado:
- [ ] BI integrado
- [ ] Análise preditiva
- [ ] Automação de cobranças
- [ ] Central de custos
- [ ] Orçamentos por departamento

---

**Desenvolvido para FoncareSystem**  
*Sistema completo de gestão de clínicas médicas*
