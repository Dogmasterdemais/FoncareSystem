# 🔍 DIAGNÓSTICO: Botão "Tabular Guia" - Sala de Espera

## ✅ STATUS: BOTÃO IMPLEMENTADO CORRETAMENTE

### 🎯 **Como o botão funciona:**

1. **Paciente agendado** → Aparece "Confirmar Chegada" (botão verde)
2. **Clica "Confirmar Chegada"** → `data_chegada` é preenchida
3. **Botão "Tabular Guia" aparece** → Piscando em vermelho 🚨
4. **Clica "Tabular Guia"** → Abre modal para preencher dados
5. **Salva dados** → Aparece "Pronto para terapia" ✅

### 🔍 **Localização do Código:**

**Arquivo:** `src/app/recepcao/sala-espera/page.tsx`

**Visualização Cards (linha 679):**
```tsx
{!agendamento.codigo_autorizacao ? (
  <button
    onClick={() => abrirModalGuia(agendamento)}
    className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 animate-pulse shadow-lg font-medium border-2 border-red-500"
  >
    <FileText className="w-5 h-5" />
    🚨 Tabular Guia
  </button>
```

**Visualização Lista (linha 574):**
```tsx
<button
  onClick={() => abrirModalGuia(agendamento)}
  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium animate-pulse border border-red-500"
  title="Tabular Guia"
>
  🚨 Tabular
</button>
```

### 🛠️ **Funcionalidades do Modal:**

1. **Código de Autorização** - Busca automática dos procedimentos TUSS
2. **Número da Guia** - Campo numérico
3. **Data de Autorização** - Campo de data
4. **Validade da Autorização** - Campo de data
5. **Valor do Procedimento** - Calculado automaticamente

### 🚨 **Possíveis Motivos para NÃO Aparecer:**

❌ **Problema 1:** Paciente não confirmou chegada
- **Solução:** Primeiro clique em "Confirmar Chegada"

❌ **Problema 2:** Guia já foi tabulada
- **Verificação:** Se `codigo_autorizacao` já existe

❌ **Problema 3:** Status "faltou"
- **Verificação:** Pacientes faltosos não mostram o botão

❌ **Problema 4:** Cache do navegador
- **Solução:** Ctrl+F5 ou limpar cache

### ✅ **Para Testar:**

1. **Acesse:** `/recepcao/sala-espera`
2. **Confirme chegada** de um paciente
3. **Aguarde** - o botão deve aparecer piscando em vermelho
4. **Clique** no botão "🚨 Tabular Guia"
5. **Preencha** os dados no modal
6. **Salve** - status muda para "Pronto para terapia"

### 📋 **Campos do Modal:**

- ✅ **Código de Autorização** (dropdown dinâmico)
- ✅ **Número da Guia** (input numérico)
- ✅ **Data de Autorização** (date picker)
- ✅ **Validade** (date picker)
- ✅ **Validação** (todos campos obrigatórios)

## 🎯 CONCLUSÃO:

O botão **"Tabular Guia"** está **100% implementado** e **funcionando** conforme especificado:
- ✅ Aparece piscando em vermelho após confirmar chegada
- ✅ Abre modal com todos os campos necessários
- ✅ Integra com procedimentos TUSS por convênio
- ✅ Salva dados na tabela agendamentos
- ✅ Atualiza status para "pronto_para_terapia"

**Se não está aparecendo, verifique se o paciente confirmou a chegada primeiro!**
