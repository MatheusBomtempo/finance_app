'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { InvestmentTypes, CreateInvestmentRequest } from '@/lib/models/Investment';

interface NewInvestmentClientProps {
  user: {
    email: string;
    perfil: string;
  };
}

export function NewInvestmentClient({ user }: NewInvestmentClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateInvestmentRequest>({
    name: '',
    type: '',
    amount: 0,
    current_value: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        setError('Nome é obrigatório');
        return;
      }
      if (!formData.type) {
        setError('Tipo é obrigatório');
        return;
      }
      if (formData.amount <= 0) {
        setError('Valor inicial deve ser maior que zero');
        return;
      }
      if (formData.current_value < 0) {
        setError('Valor atual não pode ser negativo');
        return;
      }
      if (!formData.purchase_date) {
        setError('Data de compra é obrigatória');
        return;
      }

      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/investments');
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao criar investimento');
      }
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateInvestmentRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Investimento</h1>
              <p className="text-sm text-gray-600">Adicionar um novo investimento</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/investments">
                <Button variant="ghost">← Voltar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">×</button>
            </div>
          </div>
        )}

        <Card className="mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle>Informações do Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nome do Investimento *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: CDB Banco Inter"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Investimento *</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
                >
                  <SelectItem value="">Selecione um tipo</SelectItem>
                  {InvestmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Valor Inicial Investido (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="current_value">Valor Atual (R$) *</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.current_value || ''}
                  onChange={(e) => handleInputChange('current_value', parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Se for igual ao valor inicial, informe o mesmo valor
                </p>
              </div>

              <div>
                <Label htmlFor="purchase_date">Data de Compra *</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/investments">
                  <Button type="button" variant="ghost">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Investimento'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}