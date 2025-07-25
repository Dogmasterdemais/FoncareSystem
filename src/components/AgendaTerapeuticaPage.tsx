'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Calendar, Plus, Clock, User, MapPin, Activity, Edit, Trash2, Save, X, Timer } from 'lucide-react';

interface AgendaTerapeuticaProps {
  profissionalId?: string;
}

export default function AgendaTerapeuticaPage({ profissionalId }: AgendaTerapeuticaProps) {
  const [loading, setLoading] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtros, setFiltros] = useState({
    data: '',
    profissional: '',
    status: ''
  });

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header da página */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda Terapêutica</h1>
            <p className="text-gray-600">Gerencie agendamentos e sessões terapêuticas</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={filtros.data}
                onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
              <select
                value={filtros.profissional}
                onChange={(e) => setFiltros({ ...filtros, profissional: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os profissionais</option>
                <option value="1">Dr. João Silva</option>
                <option value="2">Dra. Maria Santos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-lg shadow-sm flex-1">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agendamentos</h2>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando agendamentos...</p>
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum agendamento encontrado</p>
                <p className="text-sm">Ajuste os filtros ou crie um novo agendamento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Agendamentos serão renderizados aqui */}
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
