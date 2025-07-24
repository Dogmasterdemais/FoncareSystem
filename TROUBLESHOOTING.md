# 🚨 Guia de Solução de Problemas - FoncareSystem

## 🔍 **PROBLEMAS MAIS COMUNS E SOLUÇÕES**

### **1. "Não funcionou" - Diagnosticando o Problema**

#### **🔧 PASSO 1: Execute o Diagnóstico**
Acesse: `https://seu-site.vercel.app/diagnostico`

#### **🔧 PASSO 2: Identifique o Erro Específico**

---

## ❌ **PROBLEMA: Variáveis de Ambiente não Carregam**

### **Sintomas:**
- Página em branco
- Erro 500
- "Cannot read properties of undefined"
- Supabase não conecta

### **✅ SOLUÇÃO RÁPIDA:**

#### **Na Vercel:**
1. **Acesse:** https://vercel.com/dashboard
2. **Clique:** No projeto FoncareSystem
3. **Vá para:** Settings → Environment Variables
4. **Verifique se existem 3 variáveis:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

#### **Se NÃO existem variáveis:**
```bash
# No seu computador:
1. Abra PowerShell como Administrador
2. Navegue até a pasta do projeto:
cd "c:\Users\Douglas Araújo\Desktop\FoncareSystem"

3. Execute:
vercel env pull .env.vercel
```

#### **Se as variáveis existem mas não funcionam:**
1. **Na Vercel:** Deployments → Último deploy → ⋯ → **Redeploy**
2. **Aguarde:** 2-3 minutos para rebuild completo

---

## ❌ **PROBLEMA: Erro de CORS do Supabase**

### **Sintomas:**
- Erro 400/401/403
- "Access to fetch blocked by CORS policy"
- "Invalid API key"

### **✅ SOLUÇÃO:**

#### **1. Verificar URL do Supabase:**
- **Acesse:** https://supabase.com/dashboard
- **Seu projeto:** https://urpfjihtkvvqehjppbrg.supabase.co
- **Verifique:** Se o projeto está ativo (não pausado)

#### **2. Verificar Chave Anônima:**
- **Na Vercel:** Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correta
- **Valor correto:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **3. Políticas RLS (Row Level Security):**
```sql
-- Execute no Supabase SQL Editor:
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (temporárias para testes):
CREATE POLICY "Allow all for testing" ON pacientes FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON agendamentos FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON colaboradores FOR ALL USING (true);
```

---

## ❌ **PROBLEMA: Site não carrega / Erro 500**

### **Sintomas:**
- Página completamente em branco
- "Application error: a client-side exception has occurred"
- Site fica carregando infinitamente

### **✅ SOLUÇÃO:**

#### **1. Verificar Logs da Vercel:**
1. **Acesse:** https://vercel.com/dashboard
2. **Clique:** FoncareSystem → Functions
3. **Veja:** Os logs de erro em tempo real

#### **2. Forçar Rebuild Completo:**
```bash
# No PowerShell:
cd "c:\Users\Douglas Araújo\Desktop\FoncareSystem"
git add .
git commit -m "🔧 Fix: Força rebuild completo"
git push origin main
```

#### **3. Limpar Cache da Vercel:**
1. **Na Vercel:** Settings → General
2. **Clique:** "Clear Build Cache"
3. **Confirme** e faça novo deploy

---

## ❌ **PROBLEMA: Google Maps não carrega**

### **Sintomas:**
- Mapa em branco/cinza
- "This page can't load Google Maps correctly"
- Erro de billing/quota

### **✅ SOLUÇÃO:**

#### **1. Verificar API Key:**
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Key atual:** `AIzaSyBsEYe05izIGga0Brfdg3RdHuyzxOd-gUo`
- **Verificar:** Se está ativa e com cotas disponíveis

#### **2. Verificar Domínios Autorizados:**
- **Adicionar:** `*.vercel.app` nas restrições HTTP
- **Adicionar:** Seu domínio personalizado (se tiver)

---

## 🔧 **COMANDOS DE EMERGÊNCIA**

### **Reset Completo (quando nada funciona):**
```bash
# 1. Reset local
cd "c:\Users\Douglas Araújo\Desktop\FoncareSystem"
npm cache clean --force
rm -rf node_modules
rm -rf .next
npm install

# 2. Build local para testar
npm run build
npm run start

# 3. Se funciona local, faça push
git add .
git commit -m "🚑 Emergency fix: Reset completo"
git push origin main
```

### **Verificação Rápida Local:**
```bash
npm run dev
```
Acesse: http://localhost:3000/diagnostico

---

## 📞 **CONTATOS DE EMERGÊNCIA**

### **Se NADA funcionar:**

#### **1. Logs Detalhados:**
```bash
# Execute e envie o resultado:
npm run build 2>&1 | tee build-log.txt
```

#### **2. Verificação de Conectividade:**
```bash
# Teste conexão direta:
curl -X GET "https://urpfjihtkvvqehjppbrg.supabase.co/rest/v1/" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4"
```

#### **3. Backup de Segurança:**
- **GitHub:** https://github.com/Dogmasterdemais/FoncareSystem
- **Vercel:** https://vercel.com/dogmasterdemais/foncare-system

---

## ⏰ **CRONOGRAMA DE TESTES - 01/08/2025**

### **Checklist Final:**
- [ ] ✅ Diagnóstico: `/diagnostico` sem erros
- [ ] ✅ Login: `/login` funcionando
- [ ] ✅ Dashboard: `/dashboard` carregando
- [ ] ✅ Pacientes: `/pacientes` com dados
- [ ] ✅ Agendamentos: `/agendamentos` funcionando
- [ ] ✅ Mapas: Google Maps carregando

### **Se algum item falhar:**
1. Execute o diagnóstico: `/diagnostico`
2. Consulte este guia na seção específica
3. Implemente a correção
4. Teste novamente

---
**Última atualização:** 24/07/2025
**Versão:** 2.0 - Troubleshooting Completo
