# 🔧 DEBUG: Erro 502 Bad Gateway no Proxy Focus NFe

## ❌ **Problema Atual:**
- ✅ **Teste direto**: Falha por CORS (esperado)
- ✅ **Conectividade API**: Status 200 (funcionando)
- ❌ **Proxy POST**: 502 Bad Gateway + resposta não-JSON

## 🔍 **Análise do Erro:**

### **Sintomas:**
```
502 Bad Gateway
API Focus NFe retornou texto em vez de JSON
```

### **Possíveis Causas:**
1. **Estrutura do request**: Dados malformados
2. **Headers incorretos**: Content-Type ou Authorization
3. **Timeout do servidor**: Requisição muito lenta
4. **Proxy configuration**: Problema no Next.js API Route

## 🛠️ **Solução Implementada:**

### **1. API Route Debug**
Criada `/api/focus-nfe-debug` para testar:
- ✅ Conectividade básica
- ✅ Headers corretos  
- ✅ Token válido
- ✅ Resposta da API

### **2. Novo Botão "Debug Proxy"**
- 🔘 **Cinza**: Testa conectividade via proxy debug
- 📊 Mostra status e resposta detalhada
- 🔍 Identifica problema específico

## 🧪 **Como Testar:**

### **Passo 1: Debug Básico**
👆 **Clique no botão CINZA "Debug Proxy"**

**Resultados esperados:**
- ✅ **Sucesso**: "Proxy Debug OK! Status: 200"
- ❌ **Falha**: Detalhes específicos do erro

### **Passo 2: Análise dos Logs**
Abra **F12 → Console** e procure por:
```
🔧 PROXY DEBUG: Recebendo requisição
🔑 Token encontrado: pJgBFl...
📡 Status teste GET: 200
📄 Resposta teste: {...}
```

## 🎯 **Diagnósticos Possíveis:**

### **Caso 1: Token Inválido**
```
Status teste GET: 401
Resposta: {"erro": "Token inválido"}
```
**Solução**: Verificar token no `.env.local`

### **Caso 2: Conectividade OK**
```
Status teste GET: 200
Resposta: {"nfes": []}
```
**Status**: ✅ Tudo funcionando, problema na estrutura do POST

### **Caso 3: Proxy Bloqueado**
```
Erro: Failed to fetch
```
**Solução**: Problema de rede/firewall local

### **Caso 4: API Focus NFe Offline**
```
Status teste GET: 500
Resposta: "Internal Server Error"
```
**Solução**: Aguardar API voltar ao ar

## 📋 **Próximos Passos:**

1. **Teste o Debug Proxy** (botão cinza)
2. **Veja logs no console** (F12)
3. **Informe o resultado** para ajuste específico

### **Se Debug OK:**
- ✅ Corrigir estrutura do POST na emissão
- ✅ Ajustar headers da requisição NFe
- ✅ Validar formato dos dados enviados

### **Se Debug Falha:**
- 🔧 Verificar token no ambiente
- 🌐 Testar conectividade de rede
- 📞 Contactar suporte Focus NFe

## 🔧 **Arquivos Modificados:**

- `src/app/api/focus-nfe-debug/route.ts` - Proxy debug simplificado
- `src/components/financeiro/GestaoNFe.tsx` - Botão de teste debug

---

**Status**: 🔍 Aguardando teste do proxy debug  
**Próximo**: Clicar botão CINZA "Debug Proxy"  
**Objetivo**: Identificar causa exata do erro 502
