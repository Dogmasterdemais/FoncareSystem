# 🎨 Guia de Cores do Sistema Foncare

## 🔧 Problema Resolvido

As cores não apareciam devido a configurações incompletas. Foram feitas as seguintes correções:

### ✅ Correções Realizadas

1. **Configuração do Tailwind CSS**
   - Adicionadas paletas completas de cores personalizadas
   - Configuradas variáveis CSS para temas claro/escuro

2. **Arquivo de Cores Centralizado**
   - Criado `src/lib/colors.ts` com todas as cores do sistema
   - Classes CSS predefinidas para uso rápido

3. **Componentes Atualizados**
   - Button component agora usa as novas cores
   - Suporte a variantes e tamanhos

## 🎨 Paleta de Cores

### Cores Primárias (Azul/Cyan)
```
primary-50  = #f0f9ff (muito claro)
primary-500 = #0ea5e9 (principal)
primary-900 = #0c4a6e (muito escuro)
```

### Cores Secundárias (Verde)
```
secondary-50  = #ecfdf5 (muito claro)
secondary-500 = #10b981 (principal)
secondary-900 = #064e3b (muito escuro)
```

### Cores de Destaque (Âmbar)
```
accent-50  = #fffbeb (muito claro)
accent-500 = #f59e0b (principal)
accent-900 = #78350f (muito escuro)
```

## 📝 Como Usar

### 1. Classes Tailwind Diretas
```tsx
<div className="bg-primary-500 text-white">
  Fundo azul primário
</div>

<div className="bg-secondary-100 text-secondary-800">
  Fundo verde claro com texto escuro
</div>
```

### 2. Classes Predefinidas
```tsx
import { colorClasses } from '@/lib/colors';

<button className={colorClasses.buttonPrimary}>
  Botão Primário
</button>

<div className={colorClasses.card}>
  Cartão com estilo padrão
</div>
```

### 3. Componente Button Atualizado
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Botão Primário
</Button>

<Button variant="secondary" size="lg">
  Botão Secundário
</Button>

<Button variant="outline">
  Botão Outline
</Button>
```

## 🔄 Próximos Passos

### 1. Para ver as mudanças:
```powershell
npm run dev
```

### 2. Se as cores ainda não aparecem:
- Reinicie o servidor de desenvolvimento
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se o CSS foi compilado corretamente

### 3. Verifique se Tailwind está funcionando:
```tsx
// Teste simples - adicione em qualquer componente
<div className="bg-red-500 text-white p-4">
  Teste de cor vermelha
</div>
```

## 🎯 Status de Agendamentos

As cores dos status foram padronizadas:
- **Agendado**: Azul (`bg-primary-100 text-primary-800`)
- **Confirmado**: Verde (`bg-secondary-100 text-secondary-800`)
- **Cancelado**: Vermelho (`bg-red-100 text-red-800`)
- **Realizado**: Cinza (`bg-neutral-100 text-neutral-800`)

## 🌙 Modo Escuro

Todas as cores têm variantes para modo escuro automaticamente aplicadas quando a classe `dark` está presente no HTML.

---

**💡 Dica**: Use sempre as classes predefinidas em `colorClasses` para manter consistência visual em todo o sistema.
