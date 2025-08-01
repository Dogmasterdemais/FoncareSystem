# 🔍 Busca Automática de Endereço por CEP

## ✨ Nova Funcionalidade Implementada

O sistema agora possui **busca automática de endereço** utilizando a API do ViaCEP! 

### 🎯 Como Funciona

1. **Digite o CEP** no campo correspondente
2. O sistema **formata automaticamente** o CEP (adiciona hífen)
3. Quando o CEP estiver **completo** (8 dígitos), a busca é **automática**
4. Os campos são **preenchidos automaticamente**:
   - 📍 Logradouro
   - 🏘️ Bairro
   - 🏙️ Cidade
   - 📍 UF (Estado)

### 🎨 Indicadores Visuais

- **🔍 Ícone de busca** aparece enquanto procura o endereço
- **"Buscando endereço..."** é mostrado no label
- **Mensagem de sucesso** confirma quando o endereço é encontrado
- **Labels informativos** indicam campos preenchidos automaticamente

### 🔧 Arquivos Criados/Modificados

#### 📁 `src/lib/viacep.ts`
- ✅ **Funções utilitárias para CEP**:
  - `formatarCEP()` - Formata o CEP com hífen
  - `validarCEP()` - Valida se o CEP é válido
  - `buscarEnderecoPorCEP()` - Busca na API do ViaCEP
  - `converterEnderecoViaCEP()` - Converte dados para o formulário

#### 📁 `src/components/PacienteCadastroStepper.tsx`
- ✅ **Funcionalidade de busca automática**:
  - Estado `buscandoCEP` para indicar quando está buscando
  - Estado `enderecoEncontrado` para mostrar mensagem de sucesso
  - Função `buscarEndereco()` que faz a busca
  - Campo CEP com formatação automática
  - Indicadores visuais e mensagens informativas

### 🚀 Benefícios

1. **⚡ Agilidade**: Preenchimento automático dos campos
2. **🎯 Precisão**: Dados corretos direto da API oficial
3. **💡 Experiência**: Interface intuitiva e responsiva
4. **📱 Responsivo**: Funciona em desktop e mobile
5. **🌙 Dark Mode**: Suporte completo ao tema escuro

### 📋 Exemplo de Uso

```typescript
// Usuário digita: "01310100"
// Sistema formata: "01310-100"
// Busca automática retorna:
// - Logradouro: "Avenida Paulista"
// - Bairro: "Bela Vista"
// - Cidade: "São Paulo"
// - UF: "SP"
```

### 🔄 Fluxo de Funcionamento

1. **Input CEP** → Formatação automática
2. **CEP válido** → Busca na API ViaCEP
3. **Dados encontrados** → Preenchimento automático
4. **Feedback visual** → Confirmação para o usuário
5. **Campos editáveis** → Usuário pode ajustar se necessário

### 🛡️ Tratamento de Erros

- ❌ **CEP inválido**: Validação local
- ❌ **CEP não encontrado**: Erro da API tratado
- ❌ **Conexão**: Falha de rede tratada
- ❌ **Timeout**: Requisição com timeout

### 📱 Compatibilidade

- ✅ **Desktop**: Experiência completa
- ✅ **Mobile**: Interface adaptada
- ✅ **Tablets**: Layout responsivo
- ✅ **Acessibilidade**: Labels e indicadores
- ✅ **Dark Mode**: Tema escuro suportado

### 🎉 Resultado

A funcionalidade torna o **cadastro de pacientes muito mais rápido e preciso**, melhorando significativamente a experiência do usuário ao eliminar a necessidade de digitar manualmente os dados de endereço!
