# 💰 Módulo Financeiro - FoncareSystem

Sistema completo de gestão financeira para clínicas médicas com dashboard executivo, análise de glosas, controle de contas e relatórios Python automatizados.

## 🎯 Funcionalidades Principais

### 📊 Dashboard Financeiro
- **Visão Executiva**: Receitas, despesas e saldo atual
- **Indicadores KPI**: Glosas, ticket médio, conversão
- **Gráficos Interativos**: Evolução temporal e comparativos
- **Alertas Automáticos**: Contas em atraso e metas não atingidas

### 💸 Contas a Pagar
- **Categorização Inteligente**: Diferenciação automática entre Consumo, Fixas e Variáveis
- **Gestão de Fornecedores**: Cadastro completo com histórico
- **Controle de Vencimentos**: Alertas e notificações automáticas
- **Status de Pagamento**: Pendente, Pago, Em Atraso, Cancelado

### 💰 Contas a Receber
- **Rastreamento por Origem**: Particular, Guias Tabuladas, Convênios
- **Análise de Glosas**: Tracking detalhado de perdas por convênio
- **Previsão vs Realizado**: Comparativo com alertas de desvios
- **Relatórios de Inadimplência**: Acompanhamento de cobranças

### 👥 Folha de Pagamento
- **CLT Completa**: Salários, encargos (34%), benefícios
- **Profissionais PJ**: Honorários, retenções, impostos
- **Cálculos Automáticos**: INSS, IRRF, FGTS integrados
- **Relatórios Mensais**: Demonstrativos e comprovantes

### 📈 Relatórios e Analytics
- **Python Automatizado**: Análises avançadas com pandas/matplotlib
- **Dashboards Executivos**: Sumários para tomada de decisão
- **Projeções Financeiras**: Fluxo de caixa e cenários
- **Alertas Inteligentes**: Desvios e oportunidades identificadas

### 🧾 Notas Fiscais
- **Emissão Automática**: Integração com APIs de NFe
- **Controle Fiscal**: Numeração sequencial e arquivamento
- **Relatórios Fiscais**: Livros e demonstrativos obrigatórios

## 🛠️ Instalação e Configuração

### Pré-requisitos
- **Node.js 18+** com npm/yarn
- **Python 3.8+** com pip
- **PostgreSQL** (Supabase)
- **VS Code** (recomendado)

### 1️⃣ Instalação Automática (Windows)

```powershell
# Clonar e navegar para o projeto
cd FoncareSystem

# Instalar dependências Python
.\install_python_deps.ps1

# Configurar e inicializar módulo
.\init_financeiro.ps1
```

### 2️⃣ Instalação Manual

```bash
# Instalar dependências Node.js
npm install

# Instalar dependências Python
pip install -r requirements.txt

# Configurar banco de dados
python scripts/init_modulo_financeiro.py

# Verificar integridade
python scripts/verificar_integridade_financeiro.py
```

### 3️⃣ Configuração do Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
# Banco de Dados Supabase
SUPABASE_DB_HOST=db.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=sua_senha_aqui
SUPABASE_DB_PORT=5432

# URLs e Chaves Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_servico_aqui

# Configurações do Sistema
ENVIRONMENT=development
DEBUG=true
```

## 📁 Estrutura do Projeto

```
FoncareSystem/
├── app/financeiro/
│   └── page.tsx                 # Página principal do módulo
├── components/financeiro/
│   ├── ContasPagarManager.tsx   # Gestão de contas a pagar
│   └── ContasReceberManager.tsx # Gestão de contas a receber
├── scripts/
│   ├── init_modulo_financeiro.py        # Inicialização do módulo
│   ├── analise_financeira.py           # Analytics Python
│   └── verificar_integridade_financeiro.py # Verificação de integridade
├── sql/
│   └── modulo_financeiro_estrutura.sql # Schema do banco
├── docs/
│   └── MODULO_FINANCEIRO_DOCUMENTACAO.md # Documentação completa
└── requirements.txt             # Dependências Python
```

## 🚀 Como Usar

### Acessar o Módulo
1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/financeiro`
3. Faça login com suas credenciais

### Dashboard Principal
- **Visão Geral**: Cards com totais e indicadores
- **Navegação por Abas**: Dashboard, Pagar, Receber, Folha, Relatórios, NFe
- **Filtros Dinâmicos**: Por unidade, período, status

### Gestão de Contas a Pagar
1. **Criar Nova Conta**:
   - Clique em "Nova Conta a Pagar"
   - Preencha dados: descrição, fornecedor, valor, vencimento
   - Selecione categoria (Consumo/Fixa/Variável)
   - Salve

2. **Gerenciar Contas**:
   - Visualize lista com filtros
   - Edite clicando no ícone de edição
   - Marque como paga atualizando status
   - Exporte relatórios

### Gestão de Contas a Receber
1. **Registrar Receita**:
   - Nova conta a receber
   - Informar origem (Particular/Guia/Convênio)
   - Valor bruto, líquido e glosas
   - Data de vencimento

2. **Análise de Glosas**:
   - Visualize percentuais por convênio
   - Identifique padrões de perdas
   - Gere relatórios de negociação

### Relatórios Python
Execute análises avançadas:

```bash
# Análise financeira completa
python scripts/analise_financeira.py

# Verificação de integridade
python scripts/verificar_integridade_financeiro.py
```

## 📊 Database Schema

### Tabelas Principais

#### `contas_pagar`
- Gestão completa de contas a pagar
- Categorização por tipo de despesa
- Controle de status e vencimentos

#### `contas_receber`
- Rastreamento de receitas por origem
- Análise de glosas e perdas
- Projeções de recebimento

#### `folha_clt` / `folha_pj`
- Folha de pagamento CLT e PJ
- Cálculos automáticos de encargos
- Histórico mensal de pagamentos

#### `notas_fiscais`
- Controle de emissão de NFe
- Numeração sequencial
- Dados fiscais obrigatórios

### Views Especializadas
- `vw_dashboard_financeiro`: Dados do dashboard
- `vw_analise_glosas`: Análises de glosas
- `vw_receitas_origem`: Receitas por origem

## 🔧 Manutenção e Monitoramento

### Verificação de Integridade
Execute regularmente:
```bash
python scripts/verificar_integridade_financeiro.py
```

### Backup de Dados
Configure backups automáticos no Supabase:
1. Acesse o painel do Supabase
2. Vá em Database > Backups
3. Configure backup diário

### Logs e Auditoria
- Todas as operações são logadas
- Triggers de auditoria automáticos
- Rastreabilidade completa de alterações

## 🎨 Personalização

### Temas e Cores
Edite `tailwind.config.js` para customizar:
```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-secondary'
    }
  }
}
```

### Categorias de Despesas
Adicione categorias em `modulo_financeiro_estrutura.sql`:
```sql
ALTER TYPE categoria_despesa ADD VALUE 'NovaCategoria';
```

### Relatórios Customizados
Crie novos relatórios em `scripts/analise_financeira.py`:
```python
def meu_relatorio_customizado():
    # Sua lógica aqui
    pass
```

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco
1. Verifique credenciais no `.env`
2. Teste conectividade: `python scripts/init_modulo_financeiro.py`
3. Verifique firewall e VPN

#### Dependências Python
```bash
# Reinstalar dependências
pip install -r requirements.txt --force-reinstall

# Verificar instalações
python -c "import psycopg2; print('OK')"
```

#### Performance Lenta
1. Execute verificação: `python scripts/verificar_integridade_financeiro.py`
2. Analise logs de performance
3. Considere índices adicionais

### Logs de Debug
Ative debug no `.env`:
```env
DEBUG=true
```

### Contato e Suporte
- **Issues**: GitHub Issues
- **Documentação**: `/docs`
- **Email**: suporte@foncaresystem.com

## 📚 Documentação Adicional

- [Documentação Completa](./MODULO_FINANCEIRO_DOCUMENTACAO.md)
- [Schema do Banco](./modulo_financeiro_estrutura.sql)
- [Análises Python](./scripts/analise_financeira.py)
- [Guia de Deploy](./DEPLOY.md)

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

**FoncareSystem** © 2025 - Sistema de Gestão de Clínicas
🏥 *Desenvolvido com ❤️ para profissionais de saúde*
