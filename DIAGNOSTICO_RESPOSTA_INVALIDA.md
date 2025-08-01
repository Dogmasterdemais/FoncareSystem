# 🔍 Diagnóstico: "Resposta inválida da API Focus NFe"

## ❌ Problema Atual
Erro "Resposta inválida da API Focus NFe" indica que a API está retornando algo que não conseguimos fazer parse como JSON.

## 🛠️ Melhorias Implementadas

### **1. Logs Detalhados**
- ✅ Adicionado logs completos no proxy
- ✅ Captura do Content-Type da resposta
- ✅ Análise do tamanho da resposta
- ✅ Detecção de HTML vs JSON vs texto

### **2. Novos Botões de Teste**
- 🔴 **"Teste Token"** - Teste direto do token (vermelho)
- 🟣 **"Testar API"** - Teste via proxy (roxo)
- 🟠 **"Teste Focus NFe"** - Teste completo de emissão (laranja)

### **3. Detecção de Problemas**
- 🌐 **HTML Response**: Detecta se retornou página web
- 📄 **Empty Response**: Detecta resposta vazia
- 📝 **Text Response**: Detecta texto não-JSON
- 🔍 **Content-Type**: Verifica tipo de conteúdo

## 🧪 Plano de Testes

### **Passo 1: Teste Token Direto**
```bash
# Clique no botão VERMELHO "Teste Token"
# Este faz requisição direta ao Focus NFe
# Ignora proxy e CORS
```

**Resultados Esperados:**
- ✅ Token válido: "Token válido! API Focus NFe respondeu corretamente"
- ❌ Token inválido: "Token inválido ou expirado"
- 🌐 CORS: "Failed to fetch" (esperado no navegador)

### **Passo 2: Teste via Proxy**
```bash
# Clique no botão ROXO "Testar API"
# Este usa nosso proxy interno
# Deve funcionar sem CORS
```

**Resultados Esperados:**
- ✅ Sucesso: "Conectividade com Focus NFe OK via Proxy"
- ❌ Erro: Logs detalhados no console

### **Passo 3: Análise de Logs**
```bash
# Abra F12 → Console
# Procure por logs específicos:
```

**Logs do Cliente:**
```
🔍 Testando token direto Focus NFe...
🔑 Token encontrado: true
📡 Status direto: 200
📄 Resposta direta: {...}
```

**Logs do Servidor:**
```
🔄 Proxy API Route: Recebendo requisição
🌐 Fazendo requisição para: https://api.focusnfe.com.br/v2/nfe
📡 Status da resposta Focus NFe: 200
🔍 Content-Type da resposta: application/json
📄 Resposta completa como texto: {...}
```

## 🔍 Possíveis Causas

### **1. Token Inválido (Mais Provável)**
- **Sintoma**: Status 401 nos logs
- **Solução**: Verificar token no .env.local
- **Teste**: Botão "Teste Token" vermelho

### **2. Estrutura NFe Incorreta**
- **Sintoma**: Status 400 com mensagem de erro
- **Solução**: Ajustar estrutura de dados
- **Teste**: Logs mostrarão detalhes do erro

### **3. Proxy/Firewall**
- **Sintoma**: HTML em vez de JSON
- **Solução**: Verificar configuração de rede
- **Teste**: Comparar teste direto vs proxy

### **4. API Focus NFe Offline**
- **Sintoma**: Status 5xx ou timeout
- **Solução**: Aguardar ou contactar suporte
- **Teste**: Ambos os testes falharão

## 📊 Debug Atual

### **Console do Navegador (F12)**
Procure por:
- 🔍 "Testando token direto..."
- 📡 "Status direto: XXX"
- 📄 "Resposta direta: ..."

### **Terminal do Servidor**
Procure por:
- 🔄 "Proxy API Route: Recebendo requisição"
- 📡 "Status da resposta Focus NFe: XXX"
- 🔍 "Content-Type da resposta: ..."

## 🎯 Próximos Passos

1. **Clique no botão VERMELHO "Teste Token"**
2. **Veja resultado e logs no console**
3. **Se token OK**: Clique botão ROXO "Testar API"
4. **Se proxy OK**: Tente emissão de teste
5. **Se ainda falhar**: Analisar logs detalhados

## 🔧 Arquivos com Melhorias

- `src/app/api/focus-nfe/route.ts` - Logs detalhados do proxy
- `src/services/focusNFeService.ts` - Melhor tratamento de erros
- `src/components/financeiro/GestaoNFe.tsx` - Botão teste direto
- `teste_token_focus_nfe.js` - Script manual de teste

---

**Status**: 🔍 Aguardando teste do token direto  
**Próximo**: Clicar botão VERMELHO "Teste Token"  
**Objetivo**: Identificar se problema é token, estrutura ou rede
