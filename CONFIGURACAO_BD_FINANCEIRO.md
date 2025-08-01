# Guia de Configuração do Módulo Financeiro - Banco de Dados

## 📋 Pré-requisitos

1. **Conta no Supabase**: Tenha uma conta ativa no Supabase
2. **Projeto Criado**: Tenha um projeto Supabase configurado
3. **Variáveis de Ambiente**: Configure as variáveis no arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```

## 🚀 Passo a Passo da Configuração

### 1. Executar Scripts no Supabase

1. **Acesse o Supabase Dashboard**:
   - Vá para [supabase.com](https://supabase.com)
   - Entre no seu projeto
   - Clique em "SQL Editor" no menu lateral

2. **Executar Script Principal**:
   - Copie todo o conteúdo de `setup_modulo_financeiro.sql`
   - Cole no SQL Editor
   - Clique em "Run" para executar

3. **Executar Script de Segurança**:
   - Copie todo o conteúdo de `setup_rls_financeiro.sql`
   - Cole no SQL Editor
   - Clique em "Run" para executar

### 2. Verificar Configuração

Execute esta query no SQL Editor para verificar se tudo foi criado:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
    'contas_pagar', 
    'contas_receber', 
    'atendimentos_guias_tabuladas', 
    'anexos_notas_fiscais'
);

-- Verificar dados de exemplo
SELECT 'contas_pagar' as tabela, COUNT(*) as registros FROM contas_pagar
UNION ALL
SELECT 'contas_receber', COUNT(*) FROM contas_receber
UNION ALL
SELECT 'atendimentos_guias_tabuladas', COUNT(*) FROM atendimentos_guias_tabuladas;

-- Testar função do dashboard
SELECT get_dashboard_financeiro();
```

### 3. Configurar Storage (Notas Fiscais)

1. **Verificar Bucket**:
   - Vá para "Storage" no Supabase Dashboard
   - Deve aparecer um bucket chamado "notas-fiscais"

2. **Configurar Policies**:
   - As policies já foram criadas pelo script
   - Verifique em "Storage" > "Policies"

## 📊 Estrutura das Tabelas

### contas_pagar
- **Propósito**: Gerenciar contas a pagar da clínica
- **Campos principais**: descrição, fornecedor, valor, data_vencimento, categoria, status
- **Categorias**: Consumo, Fixa, Variavel, Investimento
- **Status**: Pendente, Pago, Atrasado, Cancelado

### contas_receber
- **Propósito**: Gerenciar contas a receber (receitas)
- **Campos principais**: descrição, valor_bruto, valor_liquido, valor_glosa, origem, status
- **Origens**: Guia_Tabulada, Particular, Procedimento, Exame, Consulta
- **Status**: Pendente, Recebido, Atrasado, Glosa_Total, Glosa_Parcial

### atendimentos_guias_tabuladas
- **Propósito**: Controlar atendimentos por guias de convênio
- **Campos principais**: numero_guia, paciente_nome, convenio, procedimento, valor_guia

### anexos_notas_fiscais
- **Propósito**: Armazenar anexos de notas fiscais
- **Campos principais**: nome_arquivo, url_arquivo, tamanho_arquivo, tipo_arquivo

## 🔧 Testando a Integração

### 1. Testar Dashboard
Execute no frontend para verificar se os dados estão sendo carregados:

```typescript
import { FinanceiroService } from '../services/financeiroService';

const financeiroService = new FinanceiroService(supabase);
const data = await financeiroService.getDashboardData();
console.log(data);
```

### 2. Testar CRUD
```typescript
// Criar conta a pagar
const novaConta = await financeiroService.createContaPagar({
  descricao: "Teste de conta",
  fornecedor: "Fornecedor Teste",
  valor: 100.00,
  data_vencimento: "2025-02-15",
  categoria: "Consumo"
});

// Listar contas
const contas = await financeiroService.getContasPagar();
console.log(contas);
```

## 🔐 Segurança Configurada

### Row Level Security (RLS)
- ✅ Habilitado em todas as tabelas financeiras
- ✅ Policies criadas para usuários autenticados
- ✅ Controle de acesso por usuário logado

### Storage Security
- ✅ Bucket privado com policies configuradas
- ✅ Upload apenas para usuários autenticados
- ✅ Acesso controlado aos arquivos

## 📈 Views Analíticas

### vw_analise_superavit_unidades
- **Propósito**: Análise de superávit por unidade
- **Dados**: Receitas, despesas, resultado, margem percentual
- **Uso**: Relatórios executivos e dashboard

## 🚨 Troubleshooting

### Problema: Tabelas não foram criadas
**Solução**: 
1. Verifique se você tem permissões de administrador no projeto
2. Execute os scripts um por vez
3. Verifique mensagens de erro no SQL Editor

### Problema: Dados não aparecem no frontend
**Solução**:
1. Verifique as variáveis de ambiente
2. Confirme que o RLS está configurado
3. Teste as queries no SQL Editor primeiro

### Problema: Upload de arquivos não funciona
**Solução**:
1. Verifique se o bucket foi criado
2. Confirme que as policies de storage estão ativas
3. Teste upload direto no Supabase Dashboard

## 📝 Próximos Passos

1. **Integração Completa**: Substituir dados mock por dados reais nos componentes
2. **Relatórios**: Implementar relatórios avançados usando as views criadas
3. **Dashboard Avançado**: Adicionar gráficos e métricas detalhadas
4. **Backup**: Configurar backup automático dos dados financeiros

## 📞 Suporte

- Documentação Supabase: https://supabase.com/docs
- SQL Editor: Use para testar queries e debug
- Logs: Verifique logs de erro no Dashboard do Supabase

---

**✅ Com esta configuração, o módulo financeiro está pronto para produção com dados reais!**
