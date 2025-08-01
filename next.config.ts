import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações de produção otimizadas
  experimental: {
    // Otimizações para Next.js 15
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // Configurações de build
  typescript: {
    // Permite build mesmo com erros de TypeScript (opcional)
    ignoreBuildErrors: false,
  },

  eslint: {
    // Permite build mesmo com warnings de ESLint (opcional)
    ignoreDuringBuilds: false,
  },

  // Configurações de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
