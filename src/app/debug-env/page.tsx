export default function DebugEnvPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Environment</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify({
              NODE_ENV: process.env.NODE_ENV,
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}