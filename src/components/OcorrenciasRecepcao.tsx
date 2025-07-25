'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, XCircle, CheckCircle } from 'lucide-react'
import MainLayout from './MainLayout'
import { moduloTerapeuticoService } from '@/lib/moduloTerapeuticoService'

export default function OcorrenciasRecepcao() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [loading, setLoading] = useState(true)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Ocorrências
          </h1>
        </div>

        {/* Sistema de registro de ocorrências em tempo real */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Atrasos
              </h3>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Faltas
              </h3>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Encerramentos Antecipados
              </h3>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
