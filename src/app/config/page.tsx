import MainLayout from '../../components/MainLayout';
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react';
import Link from 'next/link';

export default function ConfigPage() {
  const configSections = [
    {
      title: 'Perfil do Usuário',
      description: 'Gerencie suas informações pessoais e preferências',
      icon: User,
      color: 'blue'
    },
    {
      title: 'Notificações',
      description: 'Configure alertas e notificações do sistema',
      icon: Bell,
      color: 'green'
    },
    {
      title: 'Segurança',
      description: 'Configurações de segurança e privacidade',
      icon: Shield,
      color: 'red'
    },
    {
      title: 'Base de Dados',
      description: 'Configurações de conexão e backup',
      icon: Database,
      color: 'purple',
      href: '/config/database'
    },
    {
      title: 'Aparência',
      description: 'Personalize cores e temas do sistema',
      icon: Palette,
      color: 'pink'
    },
    {
      title: 'Sistema',
      description: 'Configurações avançadas do sistema',
      icon: Settings,
      color: 'gray'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4 text-cyan-600">Configurações</h1>
          <p className="text-zinc-700 dark:text-zinc-300">Personalize e configure o sistema de acordo com suas necessidades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configSections.map((section, index) => {
            const IconComponent = section.icon;
            const cardContent = (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-zinc-200 dark:border-zinc-800 hover:scale-105 cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl bg-${section.color}-100 dark:bg-${section.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent size={24} className={`text-${section.color}-600 dark:text-${section.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{section.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{section.description}</p>
              </div>
            );

            return section.href ? (
              <Link key={index} href={section.href}>
                {cardContent}
              </Link>
            ) : (
              <div key={index}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
