# 🎯 SISTEMA DE 3 PROFISSIONAIS POR SALA - DOCUMENTAÇÃO COMPLETA

## 📋 **VISÃO GERAL**

O sistema foi expandido para suportar **até 3 profissionais por sala**, oferecendo três tipos de sessão:

### **🔵 Sessão Individual (60 minutos)**
- **1 criança + 1 profissional**
- Duração: 60 minutos contínuos
- Timer: Início automático até 60 minutos

### **🟡 Sessão Compartilhada (30min + 30min)**
- **1 criança + 2 profissionais**
- **Profissional 1**: 0-30 minutos
- **Profissional 2**: 30-60 minutos
- Timer: Troca automática aos 30 minutos

### **🟠 Sessão Tripla (30min + 30min + 30min)** ⭐ **NOVA!**
- **1 criança + 3 profissionais**
- **Profissional 1**: 0-30 minutos
- **Profissional 2**: 30-60 minutos  
- **Profissional 3**: 60-90 minutos
- **Duração total**: 90 minutos
- Timer: Trocas automáticas aos 30min e 60min

---

## 🔧 **ESTRUTURA DE BANCO DE DADOS**

### **Campos Adicionados:**
```sql
agendamentos {
  profissional_3_id       -- NOVO: Terceiro profissional
  tempo_profissional_3    -- NOVO: Tempo trabalhado pelo 3º profissional
  tipo_sessao            -- EXPANDIDO: 'individual' | 'compartilhada' | 'tripla'
}
```

### **Capacidade por Sala:**
```sql
- Máximo 6 crianças
- Máximo 3 profissionais simultaneamente
- Validação automática de capacidade
```

---

## ⏱️ **LÓGICA DO TIMER AUTOMÁTICO**

### **Sessão Tripla (Nova Funcionalidade):**
```sql
-- Profissional 1: 0-30 minutos
IF tempo_atual <= 30 THEN 
    profissional_ativo = 1
    
-- Profissional 2: 30-60 minutos  
ELSIF tempo_atual <= 60 THEN
    profissional_ativo = 2
    proxima_acao = 'Trocar para 2º profissional'
    
-- Profissional 3: 60-90 minutos
ELSE 
    profissional_ativo = 3
    proxima_acao = 'Trocar para 3º profissional'
```

### **Status Dinâmico Expandido:**
```sql
'troca_para_profissional_2'  -- Aos 20min em sessão tripla
'troca_para_profissional_3'  -- Aos 40min em sessão tripla
'em_andamento'               -- Sessão normal
'sessao_completa'            -- Aos 60min
```

---

## 🎨 **INTERFACE DO USUÁRIO**

### **Cards da Agenda com 3 Profissionais:**
```tsx
// Exibição no card
{tipo_sessao === 'tripla' && (
  <div className="flex space-x-2">
    <Badge variant={profissional_ativo === 1 ? 'default' : 'secondary'}>
      {profissional_1_nome} (0-20min)
    </Badge>
    <Badge variant={profissional_ativo === 2 ? 'default' : 'secondary'}>
      {profissional_2_nome} (20-40min)
    </Badge>
    <Badge variant={profissional_ativo === 3 ? 'default' : 'secondary'}>
      {profissional_3_nome} (40-60min)
    </Badge>
  </div>
)}
```

### **Alertas de Troca:**
- **⏰ Aos 30 minutos**: "Trocar para 2º profissional"
- **⏰ Aos 60 minutos**: "Trocar para 3º profissional"  
- **⏰ Aos 90 minutos**: "Finalizar atendimento"

---

## 📊 **VALIDAÇÃO DE CAPACIDADE**

### **Verificação Automática:**
```sql
-- View: vw_ocupacao_salas_3_profissionais
SELECT 
    criancas_ocupadas,              -- Máximo 6
    profissionais_ocupados,         -- Máximo 3 (contando todos os campos)
    status_sala                     -- 'disponivel' | 'ocupada' | 'lotada'
FROM vw_ocupacao_salas_3_profissionais;
```

### **Contagem de Profissionais:**
```sql
-- Conta profissionais únicos de todos os campos
COUNT(DISTINCT profissional_id) +
COUNT(DISTINCT profissional_1_id) +
COUNT(DISTINCT profissional_2_id) +
COUNT(DISTINCT profissional_3_id)
```

---

## 🔄 **CASOS DE USO**

### **1. Terapia Multidisciplinar**
- **30min**: Fonoaudióloga
- **30min**: Terapeuta Ocupacional
- **30min**: Psicóloga
- **Criança**: Permanece na sala durante toda sessão (90min)

### **2. Supervisão + Treinamento**
- **30min**: Profissional Senior
- **30min**: Profissional Pleno  
- **30min**: Estagiário (com supervisão)

### **3. Especialidades Complementares**
- **30min**: Fisioterapeuta (mobilidade)
- **30min**: Fonoaudióloga (comunicação)
- **30min**: Psicóloga (comportamental)

---

## 💰 **IMPACTO NOS PAGAMENTOS**

### **Sessão Tripla:**
```sql
-- Cada profissional recebe proporcional ao tempo
tempo_profissional_1 = 30 minutos = 33.33% da sessão
tempo_profissional_2 = 30 minutos = 33.33% da sessão  
tempo_profissional_3 = 30 minutos = 33.33% da sessão

-- Pagamento baseado em evolução:
valor_profissional = (valor_sessao / 3) * (evolucao_feita ? 1.0 : 0.5)
```

---

## 🚨 **ALERTAS E MONITORAMENTO**

### **Alertas Automáticos:**
- **⚠️ Capacidade**: "Sala atingiu 3 profissionais"
- **⏰ Troca**: "Hora de trocar profissional"
- **🔔 Finalização**: "Sessão deve ser finalizada"

### **Dashboard de Supervisão:**
```sql
-- Monitoramento em tempo real
SELECT 
    sala_nome,
    criancas_ocupadas,
    profissionais_ocupados,
    sessoes_triplas_ativas,
    proximas_trocas
FROM vw_supervisao_3_profissionais;
```

---

## 📈 **PRÓXIMOS PASSOS**

### **Para Implementar:**
1. **Interface React** atualizada para 3 profissionais
2. **Botões de troca** automática de profissional
3. **Notificações push** para alertas de tempo
4. **Relatórios** de produtividade por profissional
5. **Agenda visual** com timeline de 20 minutos

### **Benefícios:**
✅ **Maior flexibilidade** terapêutica  
✅ **Otimização** do uso das salas  
✅ **Atendimento multidisciplinar** eficiente  
✅ **Controle preciso** de tempo e pagamentos  
✅ **Supervisão** em tempo real  

---

## 🎯 **RESUMO EXECUTIVO**

O sistema agora suporta **3 modalidades de sessão**:

| Tipo | Duração | Profissionais | Divisão | Timer |
|------|---------|---------------|---------|-------|
| **Individual** | 60min | 1 | 60min | Contínuo |
| **Compartilhada** | 60min | 2 | 30min + 30min | Troca aos 30min |
| **Tripla** ⭐ | 90min | 3 | 30min + 30min + 30min | Trocas aos 30min e 60min |

**Timer automático** funciona para todos os tipos, com transições precisas e alertas visuais! 🚀
