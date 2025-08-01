# 🚀 Guia de Configuração Vercel - Variáveis de Ambiente

## ❌ Problema: Banco de dados não conecta na Vercel

### 🔍 **Causa Mais Comum:**
As variáveis de ambiente não foram configuradas no painel da Vercel.

## ✅ **Solução: Configurar Variáveis na Vercel**

### **Passo 1: Acessar o Painel**
1. Vá para: https://vercel.com/dashboard
2. Clique no seu projeto **FoncareSystem**

### **Passo 2: Configurar Variáveis**

#### **Opção A: Importar arquivo .env.local (MAIS FÁCIL) 🚀**
1. Clique em **"Settings"** (aba superior)
2. No menu lateral, clique em **"Environment Variables"**
3. Clique no botão **"Import .env File"**
4. Selecione o arquivo: `c:\Users\Douglas Araújo\Desktop\FoncareSystem\.env.local`
5. Confirme e clique **"Import"**

#### **Opção B: Adicionar manualmente (uma por vez)**
1. Clique em **"Settings"** (aba superior)
2. No menu lateral, clique em **"Environment Variables"**
3. Adicione estas variáveis uma por uma:

#### **Variável 1: URL do Supabase**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://urpfjihtkvvqehjppbrg.supabase.co`
- **Environment:** `Production`, `Preview`, `Development` (selecione todas)

#### **Variável 2: Chave Anônima do Supabase**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4`
- **Environment:** `Production`, `Preview`, `Development` (selecione todas)

#### **Variável 3: Google Maps API**
- **Name:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Value:** `AIzaSyBsEYe05izIGga0Brfdg3RdHuyzxOd-gUo`
- **Environment:** `Production`, `Preview`, `Development` (selecione todas)

### **Passo 3: Forçar Redeploy**
1. Vá para a aba **"Deployments"**
2. No último deployment, clique nos **3 pontinhos** (...)
3. Clique em **"Redeploy"**
4. Aguarde o rebuild terminar

## 🧪 **Teste de Diagnóstico**

Acesse esta página no seu site para verificar se as variáveis estão configuradas:
```
https://seu-site.vercel.app/debug-env
```

## 🔧 **Comandos para Atualização Local:**

Sempre após configurar na Vercel, você pode fazer um push para garantir:

```bash
git add .
git commit -m "🔧 Configurações de ambiente para Vercel"
git push origin main
```

## ⚠️ **Problemas Comuns:**

### **1. Variáveis não aparecem:**
- Verifique se selecionou TODOS os ambientes (Production, Preview, Development)
- Faça um redeploy completo

### **2. Erro de CORS:**
- Verifique se a URL do Supabase está correta
- Confirme se o projeto Supabase está ativo

### **3. Erro 401/403:**
- Verifique se a chave anônima está correta
- Confirme se as políticas RLS estão configuradas no Supabase

## 📞 **Em caso de problemas:**
1. Acesse `/debug-env` no seu site
2. Verifique quais variáveis estão faltando
3. Configure na Vercel
4. Faça redeploy

---
**Data:** 24/07/2025
**Projeto:** FoncareSystem
**Deploy:** Vercel + Supabase + Google Maps
