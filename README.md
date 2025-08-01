# 🏥 FoncareSystem - Sistema de Gestão Clínica

## 📋 Descrição

O **FoncareSystem** é um sistema completo de gestão de clínicas desenvolvido com tecnologias modernas, oferecendo uma solução integrada para o gerenciamento de pacientes, agendamentos, recursos humanos, faturamento e relatórios executivos.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15.4.1 com React 19.1.0
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS 4
- **UI Components**: Radix UI + ShadCN UI
- **Backend**: Supabase (PostgreSQL)
- **Mapas**: Google Maps API
- **Ícones**: Lucide React
- **PDFs**: jsPDF
- **Excel**: xlsx
- **Deploy**: Vercel

## ✨ Funcionalidades Principais

### 📊 Dashboard Executivo
- Visualizações em tempo real
- Gráficos e métricas de performance
- Mapa de calor de pacientes
- Relatórios gerenciais

### 👥 Gestão de Pacientes
- Cadastro completo de pacientes
- Busca e filtros avançados
- Integração com unidades
- Histórico de atendimentos

### 📅 Sistema de Agendamentos
- NAC (Núcleo de Atendimento ao Cliente)
- Integração com WhatsApp
- Cronograma de pacientes
- Sala de espera digital

### 👨‍⚕️ Recursos Humanos
- Cadastro de colaboradores
- Folha de pagamento
- Banco de horas
- Gestão de descontos e benefícios

### 💰 Faturamento
- Controle de guias
- Relatórios financeiros
- Exportação de dados
- Análise por período

### 🏢 Recepção
- Cronograma de atendimentos
- Controle de chegadas
- Gestão de filas

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/FoncareSystem.git
cd FoncareSystem
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps
```

### 4. Execute o projeto em desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

### 5. Acesse o sistema
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📦 Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa em modo de produção
- `npm run lint` - Verifica problemas de código

## 🏗️ Estrutura do Projeto

```
FoncareSystem/
├── src/
│   ├── app/                 # Páginas do Next.js 13+ (App Router)
│   │   ├── dashboard/       # Dashboard executivo
│   │   ├── pacientes/       # Gestão de pacientes
│   │   ├── agendamentos/    # Sistema de agendamentos
│   │   ├── rh/              # Recursos humanos
│   │   ├── faturamento/     # Controle financeiro
│   │   └── recepcao/        # Módulo de recepção
│   ├── components/          # Componentes reutilizáveis
│   ├── lib/                 # Utilitários e configurações
│   ├── types/               # Definições de tipos TypeScript
│   └── styles/              # Estilos globais
├── public/                  # Arquivos estáticos
├── .env.local              # Variáveis de ambiente (não commitado)
├── package.json            # Dependências e scripts
└── README.md               # Documentação
```

## 🔐 Autenticação e Segurança

- Autenticação via Supabase Auth
- Controle de acesso baseado em funções
- Validação de dados no frontend e backend
- Proteção de rotas sensíveis

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🎨 Features de UI/UX

- 🌙 Dark Mode / Light Mode
- ♿ Acessibilidade (WCAG)
- 📱 Progressive Web App (PWA)
- 🎨 Interface moderna e intuitiva
- 🔄 Loading states e feedback visual

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Douglas Araújo**
- GitHub: [@SEU_USUARIO](https://github.com/SEU_USUARIO)

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:
- Abra uma [issue](https://github.com/SEU_USUARIO/FoncareSystem/issues)
- Entre em contato: seu.email@example.com

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!
