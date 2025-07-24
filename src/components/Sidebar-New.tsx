"use client";
import Link from 'next/link';
import Image from 'next/image';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  BarChart2, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  UserPlus,
  CalendarCheck,
  UserCheck,
  CreditCard,
  Building2,
  TrendingUp,
  PieChart,
  Cog,
  MapPin,
  Heart,
  Activity,
  Shield,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useUnidade } from '../context/UnidadeContext';

const menu = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: Home,
    description: 'Visão geral do sistema',
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'NAC', 
    icon: UserPlus, 
    color: 'from-emerald-500 to-emerald-600',
    description: 'Núcleo de Atendimento ao Cliente',
    submenu: [
      { href: '/nac/pacientes', label: 'Pacientes', icon: Users, description: 'Gerenciar pacientes' },
      { href: '/nac/agendamentos', label: 'Agenda', icon: Calendar, description: 'Agendamentos NAC' },
    ]
  },
  { 
    href: '/agenda', 
    label: 'Agenda', 
    icon: Calendar,
    description: 'Agendamentos e consultas',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    href: '/pacientes', 
    label: 'Pacientes', 
    icon: Users,
    description: 'Cadastro de pacientes',
    color: 'from-cyan-500 to-cyan-600'
  },
  { 
    href: '/financeiro', 
    label: 'Financeiro', 
    icon: CreditCard,
    description: 'Controle financeiro',
    color: 'from-green-500 to-green-600'
  },
  { 
    href: '/faturamento', 
    label: 'Faturamento', 
    icon: BarChart2,
    description: 'Faturamento e cobrança',
    color: 'from-orange-500 to-orange-600'
  },
  {
    label: 'RH', 
    icon: UserCheck, 
    color: 'from-pink-500 to-pink-600',
    description: 'Recursos Humanos',
    submenu: [
      { href: '/rh', label: 'RH', icon: Users, description: 'Gestão de funcionários' },
      { href: '/contabil', label: 'Contábil', icon: FileText, description: 'Controle contábil' },
    ]
  },
  { 
    href: '/config', 
    label: 'Configurações', 
    icon: Settings,
    description: 'Configurações do sistema',
    color: 'from-gray-500 to-gray-600'
  },
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const { unidadeSelecionada, setUnidadeSelecionada, unidades } = useUnidade();

  const handleToggle = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="h-screen w-80 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 shadow-2xl flex flex-col border-r border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
      {/* Header com Logo */}
      <div className="relative p-6 border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm"></div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Image 
              src="/logo-foncare.png" 
              alt="Foncare Logo" 
              width={48} 
              height={48} 
              className="drop-shadow-xl animate-pulse-slow" 
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Foncare</h1>
            <p className="text-xs text-blue-100">Sistema de Gestão Clínica</p>
          </div>
        </div>
      </div>

      {/* Seletor de Unidade */}
      <div className="p-4 border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-blue-900">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            Unidade Ativa
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            value={unidadeSelecionada}
            onChange={e => setUnidadeSelecionada(e.target.value)}
          >
            <option value="">🏥 Todas as Unidades</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>📍 {u.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {menu.map((item, idx) => (
            item.submenu ? (
              <div key={item.label} className="group">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform ${
                    openMenus[item.label] 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-blue-800'
                  }`}
                  onClick={() => handleToggle(item.label)}
                  aria-expanded={!!openMenus[item.label]}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-md`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.label}</div>
                    <div className={`text-xs opacity-75 truncate ${openMenus[item.label] ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {openMenus[item.label] ? 
                      <ChevronDown size={18} className="animate-spin-slow" /> : 
                      <ChevronRight size={18} />
                    }
                  </div>
                </button>
                
                {openMenus[item.label] && (
                  <div className="ml-6 mt-2 space-y-1 animate-slide-down">
                    {item.submenu.map(sub => (
                      <Link 
                        key={sub.href} 
                        href={sub.href} 
                        className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group/sub hover:shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white shadow-sm group-hover/sub:scale-110 transition-transform">
                          <sub.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{sub.label}</div>
                          <div className="text-xs opacity-75 truncate">{sub.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                key={item.href} 
                href={item.href} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group hover:shadow-md hover:scale-[1.02] transform"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{item.label}</div>
                  <div className="text-xs opacity-75 truncate text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Footer com Botão de Sair */}
      <div className="p-4 border-t border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-blue-900">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group hover:shadow-md">
          <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md group-hover:scale-110 transition-transform">
            <LogOut size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">Sair do Sistema</div>
            <div className="text-xs opacity-75 truncate">Finalizar sessão</div>
          </div>
        </button>
        
        {/* Status System */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Sistema Online</span>
          <Sparkles size={12} className="text-blue-400" />
        </div>
      </div>
    </aside>
  );
}
