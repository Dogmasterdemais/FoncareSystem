"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

interface Unidade {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  ativo?: boolean;
}

interface Convenio {
  id: string;
  nome: string;
  codigo?: string;
  tipo?: string;
  ativo?: boolean;
}

interface UnidadeContextType {
  unidadeSelecionada: string;
  setUnidadeSelecionada: (id: string) => void;
  unidades: Unidade[];
  convenios: Convenio[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const UnidadeContext = createContext<UnidadeContextType | undefined>(undefined);

export function UnidadeProvider({ children }: { children: ReactNode }) {
  console.log('🏢 DEBUG: UnidadeProvider iniciado');
  console.log('🏢 DEBUG: React e hooks disponíveis:', {
    useState: typeof useState,
    useEffect: typeof useEffect,
    createContext: typeof createContext
  });
  
  const [unidades, setUnidades] = useState<Unidade[]>([
    { id: 'ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', nome: 'Unidade Principal', ativo: true },
    { id: 'f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', nome: 'Penha - Matriz', ativo: true },
    { id: '15ef46f7-3cf7-4c26-af91-92405834cad6', nome: 'Foncare - Santos', ativo: true },
    { id: '4dc0ca5c-7049-40f8-9461-19afb39935ef', nome: 'Foncare - Suzano', ativo: true },
    { id: 'ba2a4f33-4cfa-4530-96ee-523db17772c5', nome: 'Foncare - São Miguel Paulista', ativo: true },
    { id: '85889e10-bdbb-402f-a06b-7930e4fe0b33', nome: 'Foncare - Osasco 1', ativo: true },
    { id: 'a4429bd3-1737-43bc-920e-dae4749e20dd', nome: 'Foncare - Osasco 2', ativo: true },
    { id: '18bca994-1c17-47f0-b650-10ef3690a481', nome: 'Escritório', ativo: true }
  ]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>("a4429bd3-1737-43bc-920e-dae4749e20dd");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🏢 DEBUG: Estados inicializados');
  console.log('🏢 DEBUG: Testando conexão Supabase:', !!supabase);
  console.log('🏢 DEBUG: Prestes a definir useEffect...');

  // useEffect para executar fetchData
  useEffect(() => {
    console.log('🏢 DEBUG: useEffect EXECUTANDO!');
    console.log('🏢 DEBUG: Teste simples do useEffect funcionando');
  }, []);

  const refreshData = () => {
    console.log('🏢 DEBUG: Refresh solicitado - recarregando página');
    window.location.reload();
  };

  console.log('🏢 DEBUG: Provider renderizando com estado:', {
    unidadesLength: unidades.length,
    unidadeSelecionada,
    loading,
    error
  });

  return (
    <UnidadeContext.Provider value={{ 
      unidadeSelecionada, 
      setUnidadeSelecionada, 
      unidades, 
      convenios, 
      loading, 
      error, 
      refreshData 
    }}>
      {children}
    </UnidadeContext.Provider>
  );
}

export function useUnidade() {
  const context = useContext(UnidadeContext);
  if (!context) throw new Error("useUnidade deve ser usado dentro do UnidadeProvider");
  return context;
}
