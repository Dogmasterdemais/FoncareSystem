# 🧪 COMO TESTAR EMISSÃO DE NFe COM FOCUS NFe

## ✅ Pré-requisitos

1. **SQL executado no Supabase** (tabelas NFe criadas)
2. **Token Focus NFe configurado** no `.env.local`
3. **Aplicação rodando** (`npm run dev`)

## 🚀 Testando a Emissão de NFe

### 1. Acesse o Módulo Financeiro
```
http://localhost:3000/financeiro
```

### 2. Clique na aba "Notas Fiscais"
- Você verá o dashboard de NFe
- Estatísticas de emissão
- Lista de NFes (vazia inicialmente)

### 3. Criar NFe de Teste

#### Opção A: Botão "Teste Focus NFe" (Recomendado)
```
1. Clique no botão laranja "Teste Focus NFe"
2. O formulário será preenchido automaticamente com dados de teste
3. Revise os dados se necessário
4. Clique em "Salvar"
5. A NFe será criada com status "rascunho"
```

#### Opção B: Criar manualmente
```
1. Clique em "Nova NFe"
2. Preencha os dados:
   - Nome: Cliente Teste
   - CPF/CNPJ: 12345678901
   - Email: seu-email@teste.com
   - Endereço: Rua Teste, 123, Centro, 80000-000, Curitiba, PR
   - Valor: 100.00
   - Descrição: Consulta médica de teste
3. Clique em "Salvar"
```

### 4. Transmitir para Focus NFe

```
1. Na lista de NFes, encontre a NFe com status "rascunho"
2. Clique no ícone de "Enviar" (seta verde)
3. O sistema irá:
   ✅ Validar os dados
   ✅ Enviar para a API Focus NFe
   ✅ Processar a resposta
   ✅ Atualizar o status da NFe
   ✅ Mostrar resultado na tela
```

## 📋 O que esperar:

### ✅ **Sucesso:**
```
- Status muda para "autorizada"
- Aparece número da NFe
- Protocolo de autorização
- Links para DANFE e XML (se disponíveis)
- Opção para enviar por email
```

### ⚠️ **Erro:**
```
- Status muda para "erro"
- Mensagem de erro detalhada
- Log salvo na tabela nfe_transmissoes
```

## 🔍 Monitoramento

### No Supabase (SQL Editor):
```sql
-- Ver todas as NFes
SELECT * FROM vw_nfe_consolidado;

-- Ver logs de transmissão
SELECT * FROM nfe_transmissoes ORDER BY data_transmissao DESC;

-- Ver última NFe criada
SELECT * FROM nfe_emissoes ORDER BY created_at DESC LIMIT 1;
```

### No Console do Browser (F12):
```
- Logs detalhados da transmissão
- Dados enviados para Focus NFe
- Resposta da API
```

## 🌐 Focus NFe - Ambiente de Homologação

### Token Configurado:
```
Token: pJgBFl5J8taKrbaUmVRfxgAf3S1QhYjT
Ambiente: Homologação
URL: https://homologacao.focusnfe.com.br/v2
```

### Funcionalidades Implementadas:
- ✅ Emissão de NFSe
- ✅ Consulta de status
- ✅ Cancelamento
- ✅ Download de DANFE (PDF)
- ✅ Download de XML
- ✅ Envio por email
- ✅ Log de transmissões

## 📞 Dados de Teste Válidos

### Pessoa Física:
```
Nome: João da Silva Teste
CPF: 12345678901
Email: teste@email.com
Endereço: Rua das Flores, 123, Centro, 80000-000, Curitiba, PR
```

### Pessoa Jurídica:
```
Razão Social: Empresa Teste LTDA
CNPJ: 12345678000199
Email: fiscal@empresateste.com.br
Endereço: Av. Paulista, 1000, Bela Vista, 01310-100, São Paulo, SP
```

### Serviços:
```
Código: 04.01 (Análises clínicas e patologia clínica)
Descrição: Consulta médica especializada
Valor: R$ 100,00
Alíquota ISS: 5%
```

## 🚨 Troubleshooting

### Erro de Token:
```
❌ "Serviço Focus NFe não está configurado"
✅ Verifique se FOCUS_NFE_TOKEN está no .env.local
```

### Erro de Dados:
```
❌ "Erro ao transmitir NFe: [mensagem]"
✅ Verifique os dados obrigatórios
✅ Veja o log detalhado no console
```

### Erro de Rede:
```
❌ "Network error" ou timeout
✅ Verifique sua conexão com internet
✅ API Focus NFe pode estar indisponível
```

## 📈 Próximos Passos

Após o teste bem-sucedido:

1. **Configurar dados reais da clínica** no `focusNFeService.ts`
2. **Ativar ambiente de produção** quando estiver pronto
3. **Integrar com sistema de faturamento** existente
4. **Configurar certificados digitais** se necessário
5. **Treinar usuários** no processo de emissão

## 🎯 Resultado Final

Ao final do teste, você terá:
- ✅ NFe emitida em ambiente de homologação
- ✅ Integração funcionando com Focus NFe
- ✅ Processo completo de emissão validado
- ✅ Sistema pronto para produção
