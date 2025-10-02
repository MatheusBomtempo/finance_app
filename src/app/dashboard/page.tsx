import { requireAuth } from '@/lib/session';
import { escapeHtml } from '@/lib/sanitize';

export default async function DashboardPage() {
  const user = await requireAuth();
  const safeEmail = escapeHtml(user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance App</h1>
              <p className="text-gray-600">Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: safeEmail }} />
                <p className="text-sm text-gray-500 capitalize">{user.perfil}</p>
              </div>
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" dangerouslySetInnerHTML={{ __html: `Bem-vindo, ${safeEmail}!` }} />
              <p className="text-gray-600 mb-6">
                Você está logado como <span className="font-semibold capitalize">{user.perfil}</span>
              </p>
              
              {/* Cards de exemplo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Saldo Atual</h3>
                  <p className="text-3xl font-bold text-green-600">R$ 1.234,56</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Receitas</h3>
                  <p className="text-3xl font-bold text-blue-600">R$ 5.678,90</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Despesas</h3>
                  <p className="text-3xl font-bold text-red-600">R$ 4.444,34</p>
                </div>
              </div>

              {user.perfil === 'admin' && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Área Administrativa
                  </h3>
                  <p className="text-yellow-700">
                    Como administrador, você tem acesso a funcionalidades especiais.
                  </p>
                  <div className="mt-4">
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Gerenciar Usuários
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
