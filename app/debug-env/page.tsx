"use client";

export default function DebugEnvPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS (hidden)' : 'NOT FOUND',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT FOUND',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT FOUND',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Delete this page after debugging: app/debug-env/page.tsx
      </p>
    </div>
  );
}
