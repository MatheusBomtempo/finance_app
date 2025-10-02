import { requireRole } from '@/lib/session';

export default async function AdminPage() {
  const user = await requireRole(['admin']);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Área Administrativa</h1>
            <p className="text-gray-600">Bem-vindo, {user.email}</p>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <p className="text-gray-700">Conteúdo restrito a administradores.</p>
          </div>
        </div>
      </main>
    </div>
  );
}


