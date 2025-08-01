'use client';

import MainLayout from '../../components/MainLayout';
import ControleSalasProfissional from '../../components/ControleSalasProfissional';

export default function AgendaPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Novo Sistema de Controle de Salas Profissional */}
        <ControleSalasProfissional />
      </div>
    </MainLayout>
  );
}
