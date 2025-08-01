# 🔧 Diagnóstico: Erro "Failed to fetch" - Focus NFe

## ❌ Problema Identificado
Erro "Failed to fetch" ao tentar transmitir NFe para a API Focus NFe.

## 🔍 Possíveis Causas

### 1. **CORS (Cross-Origin Resource Sharing)**
- **Causa**: A API Focus NFe pode estar bloqueando requisições do frontend Next.js
- **Solução**: Usar um proxy ou fazer requisições pelo backend

### 2. **Conectividade de Rede**
- **Causa**: Problemas de internet ou firewall
- **Solução**: Verificar conexão e configurações de proxy

### 3. **Token Inválido**
- **Causa**: Token Focus NFe incorreto ou expirado
- **Solução**: Verificar token nas variáveis de ambiente

### 4. **URL Incorreta**
- **Causa**: Endpoint da API incorreto
- **Solução**: Verificar URLs de homologação vs produção

## 🛠️ Ferramentas de Diagnóstico

### 1. **Botão "Testar API"**
- Clique no botão roxo "Testar API" no cabeçalho da Gestão NFe
- Verifica conectividade básica com Focus NFe
- Mostra mensagens detalhadas de erro

### 2. **Console do Navegador**
- Abra F12 → Console
- Procure por logs detalhados:
  ```
  🔥 INICIANDO EMISSÃO NFE
  📊 Configuração: {...}
  🌐 Fazendo requisição para: {...}
  📡 Status da resposta: {...}
  ```

### 3. **Network Tab (F12)**
- Vá em F12 → Network
- Tente transmitir uma NFe
- Verifique se a requisição aparece
- Se não aparecer: problema CORS
- Se aparecer com erro: verificar detalhes

## 🚀 Soluções Recomendadas

### **Solução 1: Implementar Proxy API Route**
```typescript
// pages/api/focus-nfe/emitir.ts
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://homologacao.focusnfe.com.br/v2/nfse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${process.env.FOCUS_NFE_TOKEN}`
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno' });
    }
  }
}
```

### **Solução 2: Verificar Token**
```bash
# Teste manual do token via curl
curl -H "Authorization: Token pJgBFl5J8taKrbaUmVRfxgAf3S1QhYjT" \
     https://homologacao.focusnfe.com.br/v2/nfse
```

### **Solução 3: Configurar CORS (se necessário)**
- Verificar se Focus NFe aceita requisições de localhost
- Configurar domínio autorizado no painel Focus NFe

## 📋 Checklist de Verificação

- [ ] Token Focus NFe está no .env.local
- [ ] Variáveis têm prefixo NEXT_PUBLIC_
- [ ] Servidor Next.js foi reiniciado após alterar .env.local
- [ ] Botão "Testar API" funciona
- [ ] Console mostra logs detalhados
- [ ] Network tab mostra requisições sendo feitas
- [ ] Internet funcionando normalmente

## 🔄 Próximos Passos

1. **Clique em "Testar API"** para verificar conectividade básica
2. **Verifique console** para logs detalhados do erro
3. **Se CORS for o problema**: Implementar API Route como proxy
4. **Se token for o problema**: Verificar credenciais Focus NFe
5. **Se rede for o problema**: Verificar firewall/proxy

## 📞 Suporte

Se o problema persistir:
1. Capture screenshot do console (F12)
2. Capture screenshot da aba Network
3. Anote mensagem exata do erro
4. Verifique documentação Focus NFe: https://focusnfe.com.br/doc/

---

**Atualizado**: 29/07/2025
**Status**: Aguardando teste de conectividade
