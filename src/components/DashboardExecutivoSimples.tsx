"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Users, Activity, DollarSign, Clock, AlertCircle, Download, Building2 } from "lucide-react";
import { dashboardExecutivoService } from '@/lib/dashboardExecutivoService';
import MapaCalorWrapper from './MapaCalorWrapper';
import { 
  DashboardExecutivo, 
  AtendimentoPorEspecialidade, 
  GuiasPorConvenio, 
  ResumoProfissionais,
  MapaCalorDados
} from '@/types/dashboardExecutivo';

interface DashboardExecutivoPageProps {
  unidadeId?: string;
}

export default function DashboardExecutivoPage({ unidadeId }: DashboardExecutivoPageProps) {
  const [dashboard, setDashboard] = useState<DashboardExecutivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedUnidade, setSelectedUnidade] = useState<string>(unidadeId || '');
  const [exportando, setExportando] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  useEffect(() => {
    carregarDashboard();
  }, [selectedYear, selectedMonth, selectedUnidade]);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dashboard:', { selectedYear, selectedMonth, selectedUnidade });
      console.log('📊 DashboardExecutivoService:', dashboardExecutivoService);
      
      // Verificar se o service e a função existem
      if (!dashboardExecutivoService) {
        throw new Error('DashboardExecutivoService não encontrado');
      }
      
      if (!dashboardExecutivoService.obterDashboardCompleto) {
        throw new Error('Método obterDashboardCompleto não encontrado');
      }
      
      const dashboardData = await dashboardExecutivoService.obterDashboardCompleto({
        ano: selectedYear,
        mes: selectedMonth,
        unidade_id: selectedUnidade || undefined
      });
      
      console.log('✅ Dashboard carregado:', dashboardData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      console.error('❌ Detalhes do erro:', {
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        name: (error as any)?.name
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async (tipo: 'geral' | 'especialidades' | 'convenios' | 'profissionais') => {
    try {
      setExportando(true);
      console.log('📊 Exportando relatório:', tipo);
      
      await dashboardExecutivoService.exportarRelatorio(tipo);
      
      console.log('✅ Relatório exportado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao exportar relatório:', error);
    } finally {
      setExportando(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularTaxaAprovacao = (guias: GuiasPorConvenio[]) => {
    const totalGuias = guias.reduce((acc, g) => acc + g.quantidade_guias, 0);
    const totalAprovado = guias.reduce((acc, g) => acc + g.valor_aprovado, 0);
    const totalGeral = guias.reduce((acc, g) => acc + g.valor_total, 0);
    
    return totalGeral > 0 ? (totalAprovado / totalGeral) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar dados do dashboard</p>
          <button 
            onClick={carregarDashboard} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Executivo</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visão abrangente dos indicadores da clínica
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <button 
            onClick={() => exportarRelatorio('geral')}
            disabled={exportando}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            {exportando ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.kpis.total_pacientes_ativos}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">no período selecionado</p>
            </div>
            <Users className="h-8 w-8 text-cyan-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.kpis.total_atendimentos_mes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Média: {dashboard.kpis.media_atendimentos_dia.toFixed(1)}/dia</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatarMoeda(dashboard.kpis.receita_total_mes)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">guias aprovadas</p>
            </div>
            <DollarSign className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Ocupação</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard.kpis.taxa_ocupacao_salas.toFixed(1)}%</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-cyan-600 h-2 rounded-full" 
                  style={{ width: `${dashboard.kpis.taxa_ocupacao_salas}%` }}
                ></div>
              </div>
            </div>
            <Clock className="h-8 w-8 text-cyan-600" />
          </div>
        </div>
      </div>

      {/* Tabs Simplificadas */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-gray-200 dark:border-zinc-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <a href="#mapa" className="border-cyan-500 text-cyan-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Mapa de Calor
            </a>
            <a href="#especialidades" className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Especialidades
            </a>
            <a href="#convenios" className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Convênios
            </a>
            <a href="#profissionais" className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Profissionais
            </a>
          </nav>
        </div>

        <div className="p-6">
          {/* Mapa de Calor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Localização Regional Pacientes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Distribuição geográfica dos pacientes atendidos no período
            </p>
            
            {dashboard.mapa_calor.length > 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                <MapaCalorWrapper 
                  dados={dashboard.mapa_calor} 
                  className="h-96 w-full"
                />
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum dado de localização disponível</p>
                <p className="text-gray-400 text-sm mt-2">
                  Aguardando dados de pacientes com endereços válidos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
