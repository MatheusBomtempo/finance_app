import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { getSessionUser } from '@/lib/session';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/lib/models/Expense';

// GET /api/expenses - Listar despesas do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params: any[] = [user.userId];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params) as any[];

    const expenses: Expense[] = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      amount: parseFloat(row.amount),
      category: row.category,
      date: row.date,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Criar nova despesa
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body: CreateExpenseRequest = await request.json();
    const { description, amount, category, date } = body;

    // Validações
    if (!description || !amount || !category || !date) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { message: 'Valor deve ser um número positivo' },
        { status: 400 }
      );
    }

    // Verificar se a data é válida
    const expenseDate = new Date(date);
    if (isNaN(expenseDate.getTime())) {
      return NextResponse.json(
        { message: 'Data inválida' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
      [user.userId, description, amount, category, date]
    ) as any[];

    const expense: Expense = {
      id: result.insertId,
      user_id: user.userId,
      description,
      amount,
      category,
      date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses - Atualizar despesa (precisa do ID no body ou query param)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json(
        { message: 'ID da despesa é obrigatório' },
        { status: 400 }
      );
    }

    const body: UpdateExpenseRequest = await request.json();
    const { description, amount, category, date } = body;

    // Verificar se a despesa existe e pertence ao usuário
    const [existingRows] = await pool.execute(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, user.userId]
    ) as any[];

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: 'Despesa não encontrada' },
        { status: 404 }
      );
    }

    // Construir query de update dinâmica
    const updates: string[] = [];
    const params: any[] = [];

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { message: 'Valor deve ser um número positivo' },
          { status: 400 }
        );
      }
      updates.push('amount = ?');
      params.push(amount);
    }

    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }

    if (date !== undefined) {
      const expenseDate = new Date(date);
      if (isNaN(expenseDate.getTime())) {
        return NextResponse.json(
          { message: 'Data inválida' },
          { status: 400 }
        );
      }
      updates.push('date = ?');
      params.push(date);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(expenseId, user.userId);

    const updateQuery = `UPDATE expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    await pool.execute(updateQuery, params);

    // Buscar a despesa atualizada
    const [updatedRows] = await pool.execute(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, user.userId]
    ) as any[];

    const expense: Expense = {
      id: updatedRows[0].id,
      user_id: updatedRows[0].user_id,
      description: updatedRows[0].description,
      amount: parseFloat(updatedRows[0].amount),
      category: updatedRows[0].category,
      date: updatedRows[0].date,
      created_at: updatedRows[0].created_at,
      updated_at: updatedRows[0].updated_at
    };

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses - Deletar despesa
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json(
        { message: 'ID da despesa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a despesa existe e pertence ao usuário
    const [existingRows] = await pool.execute(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, user.userId]
    ) as any[];

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: 'Despesa não encontrada' },
        { status: 404 }
      );
    }

    await pool.execute(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, user.userId]
    );

    return NextResponse.json({ message: 'Despesa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}