"use client";
import { Bell, User, Menu, Sidebar } from 'lucide-react';
import { useState } from 'react';
import { DirectDarkToggle } from './DirectDarkToggle';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleCollapse?: () => void;
  sidebarCollapsed?: boolean;
}

export default function Header({ onToggleSidebar, onToggleCollapse, sidebarCollapsed }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Controles do Sidebar + Logo */}
        <div className="flex items-center gap-4">
          {/* Botão Mobile Sidebar */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Botão Desktop Collapse */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:block p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <Sidebar className="w-5 h-5" />
          </button>

          {/* Logo e título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200">
              <img src="/logo-foncare.png" alt="Logo" className="h-6 w-6" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Foncare</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sistema de Gestão Clínica</p>
            </div>
          </div>
        </div>

        {/* Controles do usuário */}
        <div className="flex items-center gap-3">
          {/* Toggle tema */}
          <DirectDarkToggle />

          {/* Notificações */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>

          {/* Perfil do usuário */}
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
