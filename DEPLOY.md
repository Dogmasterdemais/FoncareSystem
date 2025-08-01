# 🚀 Guia de Deploy e Atualizações - FoncareSystem

## 📋 Processo de Atualização

### 🔄 **Fluxo Automático:**
```
💻 Código Local → 📤 GitHub → 🚀 Deploy Automático (Vercel/Netlify)
```

## 🛠️ **Métodos de Deploy**

### **Método 1: Script Automático (Recomendado)**

Execute um dos scripts criados:

```bash
# Windows (Prompt de Comando)
.\deploy.bat

# Windows (PowerShell)
.\deploy.ps1
```

### **Método 2: Comandos Manuais**

```bash
# 1. Verificar arquivos modificados
git status

# 2. Adicionar arquivos
git add .

# 3. Fazer commit
git commit -m "🔄 Descrição da atualização"

# 4. Enviar para GitHub
git push origin main
```

## ⚡ **Deploy Automático**

### **Vercel (Recomendado para Next.js)**

1. **Configuração Inicial:**
   - Acesse: https://vercel.com
   - Conecte com GitHub
   - Importe o repositório `FoncareSystem`
   - Configure as variáveis de ambiente

2. **Deploy Automático:**
   - ✅ **Automático** a cada push para `main`
   - ⏱️ **Tempo**: 2-5 minutos
   - 🔗 **URL**: Gerada automaticamente

### **Netlify (Alternativa)**

1. **Configuração Inicial:**
   - Acesse: https://netlify.com
   - Conecte com GitHub
   - Selecione o repositório
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

2. **Deploy Automático:**
   - ✅ **Automático** a cada push
   - ⏱️ **Tempo**: 3-7 minutos

## 🔧 **Variáveis de Ambiente**

Configure no painel da Vercel/Netlify:

```env
NEXT_PUBLIC_SUPABASE_URL=https://urpfjihtkvvqehjppbrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-do-supabase
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-do-google-maps
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

## 📱 **Verificação do Deploy**

Após cada atualização:

1. ✅ Verifique o GitHub: https://github.com/Dogmasterdemais/FoncareSystem
2. ✅ Aguarde o deploy automático (2-5 min)
3. ✅ Teste o site em produção
4. ✅ Verifique logs se houver erro

## 🐛 **Solução de Problemas**

### **Deploy Falhou:**
```bash
# Verificar logs no terminal
git log --oneline -5

# Reverter último commit se necessário
git reset --soft HEAD~1
```

### **Conflitos de Merge:**
```bash
# Puxar atualizações do GitHub
git pull origin main

# Resolver conflitos e fazer novo commit
git add .
git commit -m "🔧 Resolve conflicts"
git push origin main
```

## 📊 **Monitoramento**

- **GitHub**: Commits e histórico
- **Vercel/Netlify**: Logs de build e deploy
- **Site**: Funcionamento em produção

## 🎯 **Dicas Importantes**

1. 📝 **Commits descritivos**: Use mensagens claras
2. 🧪 **Teste local**: `npm run build` antes do deploy
3. 🔄 **Pequenas atualizações**: Commits frequentes
4. 📱 **Teste mobile**: Verifique responsividade
5. 🔒 **Backup**: GitHub mantém histórico completo

---

## 🆘 **Suporte**

Em caso de dúvidas:
1. Verificar logs do build
2. Consultar documentação Vercel/Netlify
3. Verificar variáveis de ambiente
4. Testar build local
