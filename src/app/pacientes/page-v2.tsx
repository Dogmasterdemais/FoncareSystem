"use client";

import MainLayout from "../../components/MainLayout";

export default function PacientesPage() {
  return (
    <MainLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Gerenciar Pacientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de gerenciamento de pacientes
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Interface carregada com sucesso! ✅
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
