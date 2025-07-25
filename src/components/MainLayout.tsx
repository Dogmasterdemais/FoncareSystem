"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Sempre fixo */}
      <div className={`
        fixed left-0 top-0 h-full z-50 transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Área principal com margem fixa */}
      <div className={`
        flex flex-col h-screen w-full transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        ml-0
      `}>
        {/* Header fixo no topo */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-blue-100 dark:border-blue-800/50">
          <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>
        
        {/* Conteúdo principal com scroll próprio */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
