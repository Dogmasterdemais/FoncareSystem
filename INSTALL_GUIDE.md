# 🚀 Guia de Instalação - FoncareSystem

## ✅ Status Atual
- Node.js: **INSTALADO E FUNCIONANDO**
- Python: **INSTALADO MAS NÃO VERIFICADO**
- Servidor: **RODANDO EM http://localhost:3001**

### 🎨 Cores do Sistema: **CORRIGIDAS**
- Configuração do Tailwind CSS completa
- Paleta de cores personalizada implementada
- Componentes atualizados com novas cores

## 🔧 Pré-requisitos Obrigatórios

### 1. Node.js 18+
```
🌐 Download: https://nodejs.org/
- Escolha a versão LTS (recomendada)
- Durante a instalação, marque "Add to PATH"
- Inclui npm automaticamente
```

### 2. Python 3.8+
```
🐍 Download: https://www.python.org/downloads/
- ⚠️ IMPORTANTE: Marque "Add Python to PATH"
- ⚠️ IMPORTANTE: Marque "Install pip"
```

## 📦 Após a Instalação dos Pré-requisitos

### 1. Reinicie o VS Code/Terminal

### 2. Execute os Scripts de Instalação
```powershell
# Instalar dependências Python
.\install_python_deps.ps1

# Configurar e inicializar sistema
.\init_financeiro.ps1
```

### 3. Instalação Manual (Alternativa)
```powershell
# Dependências Node.js
npm install

# Dependências Python
pip install -r requirements.txt
```

## ✅ Verificação
Após instalar, verifique:
```powershell
node --version    # Deve mostrar v18.x.x ou superior
npm --version     # Deve mostrar versão do npm
python --version  # Deve mostrar Python 3.8+
pip --version     # Deve mostrar versão do pip
```

## 🎯 Dependências do Projeto

### Node.js (package.json)
- Next.js 15.4.4
- React 19.1.0
- Supabase
- Tailwind CSS
- Radix UI
- Lucide React

### Python (requirements.txt)
- psycopg2-binary
- pandas
- matplotlib
- supabase
- openpyxl

## 🔄 Depois da Instalação
Execute para iniciar o servidor de desenvolvimento:
```powershell
npm run dev
```

---
**💡 Dica:** Depois de instalar Node.js e Python, feche e reabra o VS Code para garantir que os comandos sejam reconhecidos.
