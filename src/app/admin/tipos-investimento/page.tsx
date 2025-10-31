import { requireRole } from '@/lib/session';
import InvestmentTypesManager from './InvestmentTypesManager';

export default async function TiposInvestimentoPage() {
  const user = await requireRole(['admin']);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tipos de Investimento</h1>
              <p className="text-sm text-gray-600">Administração de tipos com percentuais de lucro</p>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Voltar ao Dashboard
              </a>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-500 capitalize">{user.perfil}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <InvestmentTypesManager />
      </main>
    </div>
  );
}