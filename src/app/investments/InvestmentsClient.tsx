'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Investment, InvestmentTypes } from '@/lib/models/Investment';

interface InvestmentsClientProps {
  user: {
    email: string;
    perfil: string;
  };
}

export function InvestmentsClient({ user }: InvestmentsClientProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar investimentos
  useEffect(() => {
    fetchInvestments();
  }, [typeFilter]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      let url = '/api/investments?limit=50';
      
      if (typeFilter) {
        url += `&type=${encodeURIComponent(typeFilter)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInvestments(data);
      } else {
        setError('Erro ao carregar investimentos');
      }
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      setError('Erro ao carregar investimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshValues = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/investments/refresh', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.updated > 0) {
          await fetchInvestments(); // Recarrega a lista
        }
      } else {
        setError('Erro ao atualizar valores');
      }
    } catch (error) {
      console.error('Erro ao atualizar valores:', error);
      setError('Erro ao atualizar valores');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteInvestment = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este investimento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/investments?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInvestments(investments.filter(investment => investment.id !== id));
      } else {
        setError('Erro ao deletar investimento');
      }
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
      setError('Erro ao deletar investimento');
    }
  };

  // Filtrar investimentos pelo termo de busca
  const filteredInvestments = investments.filter(investment => 
    investment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalInvested = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0);
  const totalCurrentValue = filteredInvestments.reduce((sum, investment) => sum + investment.current_value, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando investimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
              <p className="text-sm text-gray-600">Gerencie seus investimentos</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">← Dashboard</Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleRefreshValues}
                disabled={refreshing}
              >
                {refreshing ? 'Atualizando...' : 'Atualizar Valores'}
              </Button>
              <Link href="/investments/new">
                <Button variant="primary">+ Novo Investimento</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">×</button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6 mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nome do investimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {InvestmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 px-4 sm:px-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-700">Total Investido</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-700">Valor Atual</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalReturn >= 0 ? '+' : ''}R$ {totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-700">Lucro/Prejuízo</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={`text-2xl font-bold ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-700">Rentabilidade</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Investimentos */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle>Lista de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvestments.length > 0 ? (
              <div className="space-y-4">
                {filteredInvestments.map((investment) => {
                  const returnValue = investment.current_value - investment.amount;
                  const returnPercent = (returnValue / investment.amount) * 100;
                  
                  return (
                    <div key={investment.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">{investment.name}</h3>
                          {investment.is_automated && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              Auto
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                            {investment.type}
                          </span>
                          <span>Compra: {new Date(investment.purchase_date).toLocaleDateString('pt-BR')}</span>
                          {investment.quantity && investment.quantity > 0 && (
                            <span className="ml-2">| Qtd: {investment.quantity}</span>
                          )}
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Investido: </span>
                          <span className="font-medium text-gray-900">R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          R$ {investment.current_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm font-medium ${returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                        </p>
                        <div className="mt-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteInvestment(investment.id)}
                          >
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Nenhum investimento encontrado</p>
                <Link href="/investments/new">
                  <Button variant="primary">Adicionar primeiro investimento</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}