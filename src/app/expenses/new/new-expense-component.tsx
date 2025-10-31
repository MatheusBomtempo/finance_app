'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ExpenseCategories, CreateExpenseRequest } from '@/lib/models/Expense';

interface NewExpenseProps {
  user: {
    email: string;
    perfil: string;
  };
}

export default function NewExpenseComponent({ user }: NewExpenseProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0], // Data atual
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!formData.description.trim()) {
        setError('Descrição é obrigatória');
        return;
      }
      if (!formData.category) {
        setError('Categoria é obrigatória');
        return;
      }
      if (formData.amount <= 0) {
        setError('Valor deve ser maior que zero');
        return;
      }
      if (!formData.date) {
        setError('Data é obrigatória');
        return;
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirecionar para a lista de despesas
        router.push('/expenses');
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao criar despesa');
      }
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateExpenseRequest, value: string | number) => {
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
              <h1 className="text-3xl font-bold text-gray-900">Nova Despesa</h1>
              <p className="text-sm text-gray-600">Adicionar uma nova despesa</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/expenses">
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
            <CardTitle>Informações da Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Supermercado Pão de Açúcar"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$) *</Label>
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
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <SelectItem value="">Selecione uma categoria</SelectItem>
                  {ExpenseCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/expenses">
                  <Button type="button" variant="ghost">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Despesa'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}