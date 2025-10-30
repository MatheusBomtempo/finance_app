'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DashboardClientProps {
  user: {
    email: string;
    perfil: string;
  };
  safeEmail: string;
}

export function DashboardClient({ user, safeEmail }: DashboardClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance App</h1>
              <p className="text-sm text-gray-600">Painel de Controle</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: safeEmail }} />
                <p className="text-sm text-gray-500 capitalize">{user.perfil}</p>
              </div>
              <form action="/api/logout" method="post">
                <Button variant="danger" size="sm" type="submit">
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filtro de Período */}
        <div className="mb-6 px-4 sm:px-0">
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === 'month' ? 'primary' : 'ghost'}
              onClick={() => setSelectedPeriod('month')}
            >
              Mês Atual
            </Button>
            <Button
              variant={selectedPeriod === 'year' ? 'primary' : 'ghost'}
              onClick={() => setSelectedPeriod('year')}
            >
              Ano Atual
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">R$ 5.234,56</p>
              <p className="text-sm text-gray-500 mt-1">+15% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">R$ 1.234,56</p>
              <p className="text-sm text-gray-500 mt-1">-5% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">R$ 10.234,56</p>
              <p className="text-sm text-gray-500 mt-1">+8% em relação ao mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Seções de Detalhamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-0">
          {/* Últimas Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { desc: 'Supermercado', valor: 'R$ 450,00', data: '25/10/2023' },
                  { desc: 'Energia', valor: 'R$ 180,00', data: '22/10/2023' },
                  { desc: 'Internet', valor: 'R$ 120,00', data: '20/10/2023' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.desc}</p>
                      <p className="text-sm text-gray-500">{item.data}</p>
                    </div>
                    <p className="text-red-600 font-medium">{item.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Carteira de Investimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tipo: 'Renda Fixa', valor: 'R$ 5.000,00', rend: '+6.5%' },
                  { tipo: 'Ações', valor: 'R$ 3.234,56', rend: '+12.3%' },
                  { tipo: 'Fundos', valor: 'R$ 2.000,00', rend: '+4.8%' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.tipo}</p>
                      <p className="text-sm text-green-600">{item.rend}</p>
                    </div>
                    <p className="text-blue-600 font-medium">{item.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}