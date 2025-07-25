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
  Sparkles,
  DollarSign,
  Clock,
  Stethoscope,
  ClipboardList,
  MonitorSpeaker,
  UserCog
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
      { href: '/nac/agendamentos', label: 'Agendamentos', icon: Calendar, description: 'Agendamentos NAC' },
    ]
  },
  {
    label: 'Recepção', 
    icon: Heart, 
    color: 'from-purple-500 to-purple-600',
    description: 'Gestão de chegadas e cronograma',
    submenu: [
      { href: '/recepcao', label: 'Visão Geral', icon: Activity, description: 'Dashboard da Recepção' },
      { href: '/recepcao/sala-espera', label: 'Sala de Espera', icon: Users, description: 'Controle de chegadas' },
      { href: '/recepcao/cronograma', label: 'Cronograma', icon: Calendar, description: 'Cronograma semanal' },
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
      { href: '/rh', label: 'Colaboradores', icon: Users, description: 'Gestão de colaboradores' },
      { href: '/rh/folha-pagamento', label: 'Folha de Pagamento', icon: DollarSign, description: 'Gestão da folha' },
      { href: '/rh/banco-horas', label: 'Banco de Horas', icon: Clock, description: 'Controle de ponto' },
      { href: '/contabil', label: 'Contábil', icon: FileText, description: 'Controle contábil' },
    ]
  },
  {
    label: 'Módulo Terapêutico', 
    icon: Stethoscope, 
    color: 'from-teal-500 to-teal-600',
    description: 'Gestão avançada de terapias',
    submenu: [
      { href: '/salas', label: 'Gestão de Salas', icon: Building2, description: 'Controle de salas e capacidade' },
      { href: '/agenda-terapeutica', label: 'Agenda Terapêutica', icon: Calendar, description: 'Agendamento avançado' },
      { href: '/supervisao', label: 'Supervisão', icon: UserCog, description: 'Supervisão de atendimentos' },
      { href: '/relatorios', label: 'Relatórios', icon: BarChart2, description: 'Relatórios terapêuticos' },
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

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export default function Sidebar({ collapsed = false, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const { unidadeSelecionada, setUnidadeSelecionada, unidades } = useUnidade();

  const handleToggle = (label: string) => {
    if (collapsed) return; // Não permitir abertura de submenus quando collapsed
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLinkClick = () => {
    onCloseMobile?.(); // Fechar sidebar no mobile ao clicar em um link
  };

  return (
    <aside className={`h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 shadow-2xl flex flex-col border-r border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header com Logo */}
      <div className={`relative border-b border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-300 ${collapsed ? 'p-4' : 'p-6'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm"></div>
        <div className={`relative flex items-center ${collapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="relative bg-white rounded-xl p-2 shadow-lg">
            <Image 
              src="/logo-foncare.png" 
              alt="Foncare Logo" 
              width={collapsed ? 28 : 40} 
              height={collapsed ? 28 : 40} 
              className="drop-shadow-sm" 
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-wide">Foncare</h1>
              <p className="text-xs text-blue-100">Sistema de Gestão Clínica</p>
            </div>
          )}
        </div>
      </div>

      {/* Seletor de Unidade */}
      {!collapsed && (
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
      )}

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {menu.map((item, idx) => (
            item.submenu ? (
              <div key={item.label} className="group">
                <button
                  className={`w-full flex items-center transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform ${
                    collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                  } rounded-xl text-left ${
                    openMenus[item.label] 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-blue-800'
                  }`}
                  onClick={() => handleToggle(item.label)}
                  aria-expanded={!!openMenus[item.label]}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-md ${collapsed ? 'w-8 h-8 flex items-center justify-center' : ''}`}>
                    <item.icon size={collapsed ? 16 : 20} />
                  </div>
                  {!collapsed && (
                    <>
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
                    </>
                  )}
                </button>
                
                {openMenus[item.label] && !collapsed && (
                  <div className="ml-6 mt-2 space-y-1 animate-slide-down">
                    {item.submenu.map(sub => (
                      <Link 
                        key={sub.href} 
                        href={sub.href}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="p-1 rounded-md bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                          <sub.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{sub.label}</div>
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
                onClick={handleLinkClick}
                className={`flex items-center transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-blue-800 hover:text-blue-600 dark:hover:text-blue-400 ${
                  collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } rounded-xl`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-md ${collapsed ? 'w-8 h-8 flex items-center justify-center' : ''}`}>
                  <item.icon size={collapsed ? 16 : 20} />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.label}</div>
                    <div className="text-xs opacity-75 truncate text-gray-500">{item.description}</div>
                  </div>
                )}
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-blue-900 transition-all duration-300 ${collapsed ? 'p-2' : 'p-4'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">Admin</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">admin@foncare.com</div>
            </div>
          </div>
        )}
        
        <button 
          className={`w-full flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl ${
            collapsed ? 'justify-center p-2' : 'px-4 py-2'
          }`}
          title={collapsed ? "Sair do Sistema" : undefined}
        >
          <LogOut size={collapsed ? 18 : 16} />
          {!collapsed && <span className="font-medium text-sm">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
}
