# 📋 Plano de Implementação - Foncare System

## 🎯 Análise do Documento de Especificações

### ✅ **Status Atual vs Especificações:**

#### **Tabela Pacientes - Comparação:**
| Campo Especificado | Status | Campo Atual |
|-------------------|--------|-------------|
| id (uuid) | ✅ Implementado | ✅ |
| nome (varchar) | ✅ Implementado | ✅ |
| cpf (varchar) | ✅ Implementado | ✅ |
| rg (varchar) | ✅ Implementado | ✅ |
| data_nascimento (date) | ✅ Implementado | ✅ |
| sexo (varchar) | ✅ Implementado | ✅ |
| telefone (varchar) | ✅ Implementado | ✅ |
| email (varchar) | ✅ Implementado | ✅ |
| convenio_id (uuid) | ✅ Implementado | ✅ |
| numero_carteirinha (varchar) | ✅ Implementado | ✅ |
| cep (varchar) | ✅ Implementado | ✅ |
| logradouro (varchar) | ✅ Implementado | ✅ |
| numero (varchar) | ✅ Implementado | ✅ |
| complemento (varchar) | ✅ Implementado | ✅ |
| bairro (varchar) | ✅ Implementado | ✅ |
| cidade (varchar) | ✅ Implementado | ✅ |
| uf (varchar) | ✅ Implementado | ✅ |
| responsavel_nome (varchar) | ✅ Implementado | ✅ |
| responsavel_telefone (varchar) | ✅ Implementado | ✅ |
| responsavel_parentesco (varchar) | ✅ Implementado | ✅ |
| responsavel_cpf (varchar) | ✅ Implementado | ✅ |
| profissao (varchar) | ✅ Implementado | ✅ |
| estado_civil (varchar) | ✅ Implementado | ✅ |
| observacoes (text) | ✅ Implementado | ✅ |
| ativo (bool) | ✅ Implementado | ✅ |
| created_at (timestamptz) | ✅ Implementado | ✅ |
| unidade_id (uuid) | ✅ Implementado | ✅ |
| validade_carteira (date) | ✅ Implementado | ✅ |
| updated_at (timestamptz) | ❌ Faltando | - |

## 🚀 **Fases de Implementação Sugeridas:**

### **FASE 1 - Completar Estrutura Base (Atual)**
1. ✅ Adicionar campo `updated_at` na tabela pacientes
2. ✅ Criar tabela `salas` (10 salas por unidade)
3. ✅ Criar tabela `profissionais`
4. ✅ Criar tabela `agendamentos`
5. ✅ Criar tabela `procedimentos_tuss`

### **FASE 2 - Módulo Agendamentos**
1. Sistema de agenda (visão semanal + lista)
2. Criação de novos agendamentos
3. Sistema de cores por especialidade
4. Agendamentos recorrentes (até 3 meses)
5. Estatísticas de comparecimento

### **FASE 3 - Módulo Recepção**
1. Sala de espera (agendamentos do dia)
2. Confirmação de chegada
3. Sistema de tabulação de guias
4. Modal para preenchimento de dados da guia
5. Cronograma do paciente (geração PDF)

### **FASE 4 - Dashboard/Relatórios**
1. Mapa de calor por bairros (top 5)
2. Gráficos de comparecimento
3. Taxa de conversão
4. Filtros por unidade, convênio, data
5. Integração com Python para análises

### **FASE 5 - Melhorias e Otimizações**
1. Sistema de upload de documentos
2. Notificações automáticas
3. Relatórios avançados
4. Backup automático
5. Performance e otimizações

## 🎨 **Cores das Especialidades:**
```
#0052CC - FONOAUDIOLOGIA (Sala Azul)
#00E6F6 - TERAPIA OCUPACIONAL (Sala Azul Claro)
#38712F - PSICOLOGIA (Sala Verde)
#D20000 - PSICOPEDAGOGIA/NEUROPSICOPEDAGOGIA (Sala Vermelha)
#B45A00 - EDUCADOR FÍSICO (Sala Laranja Escuro)
#F58B00 - PSICOMOTRICIDADE (Sala Amarela)
#F5C344 - MUSICOTERAPIA/LUDOTERAPIA/ARTERAPIA (Sala Amarelo Claro)
#C47B9C - FISIOTERAPIA (Sala Lilás)
#808080 - ANAMNESE (Sala Cinza)
#000000 - NEUROPSICOLOGIA (Sala Preta)
```

## 📊 **Estruturas de Tabelas Necessárias:**

### **1. Salas**
```sql
CREATE TABLE salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) NOT NULL, -- Código hex da cor
  especialidade VARCHAR(100),
  capacidade_maxima INTEGER DEFAULT 6,
  unidade_id UUID REFERENCES unidades(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Profissionais**
```sql
CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  crf VARCHAR(50),
  especialidade_id UUID,
  telefone VARCHAR(20),
  email VARCHAR(100),
  cep VARCHAR(9),
  logradouro VARCHAR(255),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  tipo_contrato VARCHAR(50),
  valor_hora DECIMAL(10,2),
  carga_horaria_semanal INTEGER,
  data_admissao DATE,
  data_demissao DATE,
  sala_id UUID,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Agendamentos**
```sql
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  convenio_id UUID REFERENCES convenios(id),
  data_agendamento DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'agendado',
  observacoes TEXT,
  numero_agendamento VARCHAR(50),
  profissional_id UUID REFERENCES profissionais(id),
  unidade_id UUID REFERENCES unidades(id),
  sala_id UUID REFERENCES salas(id),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_minutos INTEGER,
  tipo_sessao VARCHAR(50),
  modalidade VARCHAR(50),
  status_confirmacao VARCHAR(50),
  valor_sessao DECIMAL(10,2),
  codigo_autorizacao VARCHAR(100),
  numero_guia VARCHAR(100),
  data_autorizacao DATE,
  validade_autorizacao DATE,
  is_neuropsicologia BOOLEAN DEFAULT false,
  sessao_sequencia INTEGER,
  total_sessoes INTEGER,
  agendamento_pai_id UUID REFERENCES agendamentos(id),
  lembrete_enviado BOOLEAN DEFAULT false,
  confirmacao_enviada BOOLEAN DEFAULT false,
  data_lembrete TIMESTAMP,
  data_confirmacao TIMESTAMP,
  whatsapp_paciente VARCHAR(20),
  whatsapp_responsavel VARCHAR(20),
  observacoes_internas TEXT,
  motivo_cancelamento TEXT,
  data_chegada TIMESTAMP,
  data_inicio_atendimento TIMESTAMP,
  data_fim_atendimento TIMESTAMP,
  documentos_necessarios JSONB,
  documentos_entregues JSONB,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 **Próximos Passos Recomendados:**

1. **Implementar FASE 1** - Completar estruturas base
2. **Criar sistema de agendamentos** básico
3. **Implementar módulo de recepção** 
4. **Desenvolver dashboard** com relatórios
5. **Adicionar funcionalidades avançadas**

## 💡 **Observações Técnicas:**

- ✅ **Estrutura atual está bem alinhada** com as especificações
- ✅ **Sistema de convênios já funcional**
- ✅ **Base de dados bem estruturada**
- 🔄 **Faltam principalmente as funcionalidades de agendamento e recepção**
- 🎨 **Design system já adequado** para implementar as cores das especialidades

**Conclusão: É totalmente viável implementar todas as funcionalidades especificadas!** 🚀
