// Configuração centralizada de cores do sistema Foncare
export const colors = {
  // Cores primárias (azul/cyan) - Sistema médico profissional
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Cor principal
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Cores secundárias (verde) - Saúde e bem-estar
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Cor principal
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Cores de destaque (âmbar) - Alertas e destaques
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Cor principal
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Cores de status
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
  },

  // Cores neutras
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

// Classes CSS predefinidas para uso rápido
export const colorClasses = {
  // Botões primários
  buttonPrimary: 'bg-primary-500 hover:bg-primary-600 text-white',
  buttonSecondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
  buttonAccent: 'bg-accent-500 hover:bg-accent-600 text-white',
  
  // Cartões e containers
  card: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
  cardHeader: 'bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700',
  
  // Status de agendamentos
  agendamento: {
    agendado: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400',
    confirmado: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    realizado: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400',
  },
  
  // Gradientes
  gradients: {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600',
    hero: 'bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900',
  },
} as const;

// Função auxiliar para obter cor por nome
export const getColor = (colorName: keyof typeof colors, shade: number = 500) => {
  return colors[colorName][shade as keyof typeof colors[typeof colorName]];
};

export default colors;
