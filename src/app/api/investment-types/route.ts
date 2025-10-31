import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { getSessionUser } from '@/lib/session';
import { 
  InvestmentType, 
  CreateInvestmentTypeData, 
  UpdateInvestmentTypeData,
  INVESTMENT_TYPE_VALIDATION 
} from '@/lib/models/InvestmentType';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Listar todos os tipos de investimento
export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM investment_types ORDER BY name ASC'
    );
    
    return NextResponse.json({ investment_types: rows });
  } catch (error) {
    console.error('Erro ao buscar tipos de investimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo tipo de investimento (apenas administradores)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (user.perfil !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem gerenciar tipos de investimento.' },
        { status: 403 }
      );
    }

    const data: CreateInvestmentTypeData = await request.json();

    // Validação dos dados
    if (!data.name || data.name.length < INVESTMENT_TYPE_VALIDATION.name.minLength) {
      return NextResponse.json(
        { error: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    if (data.name.length > INVESTMENT_TYPE_VALIDATION.name.maxLength) {
      return NextResponse.json(
        { error: 'Nome muito longo (máximo 255 caracteres)' },
        { status: 400 }
      );
    }

    if (data.expected_return_percent < 0 || data.expected_return_percent > 100) {
      return NextResponse.json(
        { error: 'Percentual de retorno deve estar entre 0% e 100%' },
        { status: 400 }
      );
    }

    if (!INVESTMENT_TYPE_VALIDATION.risk_level.options.includes(data.risk_level)) {
      return NextResponse.json(
        { error: 'Nível de risco inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe um tipo com o mesmo nome
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM investment_types WHERE name = ?',
      [data.name]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um tipo de investimento com este nome' },
        { status: 409 }
      );
    }

    // Inserir novo tipo
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO investment_types (name, description, expected_return_percent, risk_level) 
       VALUES (?, ?, ?, ?)`,
      [data.name, data.description || null, data.expected_return_percent, data.risk_level]
    );

    // Buscar o tipo criado
    const [newType] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM investment_types WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(
      { 
        message: 'Tipo de investimento criado com sucesso',
        investment_type: newType[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar tipo de investimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar tipo de investimento (apenas administradores)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (user.perfil !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem gerenciar tipos de investimento.' },
        { status: 403 }
      );
    }

    const { id, ...data }: { id: number } & UpdateInvestmentTypeData = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o tipo existe
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM investment_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Tipo de investimento não encontrado' },
        { status: 404 }
      );
    }

    // Construir query de atualização dinamicamente
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      if (data.name.length < INVESTMENT_TYPE_VALIDATION.name.minLength) {
        return NextResponse.json(
          { error: 'Nome deve ter pelo menos 2 caracteres' },
          { status: 400 }
        );
      }
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description || null);
    }

    if (data.expected_return_percent !== undefined) {
      if (data.expected_return_percent < 0 || data.expected_return_percent > 100) {
        return NextResponse.json(
          { error: 'Percentual de retorno deve estar entre 0% e 100%' },
          { status: 400 }
        );
      }
      updates.push('expected_return_percent = ?');
      values.push(data.expected_return_percent);
    }

    if (data.risk_level !== undefined) {
      if (!INVESTMENT_TYPE_VALIDATION.risk_level.options.includes(data.risk_level)) {
        return NextResponse.json(
          { error: 'Nível de risco inválido' },
          { status: 400 }
        );
      }
      updates.push('risk_level = ?');
      values.push(data.risk_level);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    values.push(id);

    await pool.execute(
      `UPDATE investment_types SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Buscar o tipo atualizado
    const [updated] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM investment_types WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      message: 'Tipo de investimento atualizado com sucesso',
      investment_type: updated[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar tipo de investimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir tipo de investimento (apenas administradores)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (user.perfil !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem gerenciar tipos de investimento.' },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existe investimentos usando este tipo
    const [investmentsUsingType] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM investments WHERE type = (SELECT name FROM investment_types WHERE id = ?)',
      [id]
    );

    if (investmentsUsingType[0].count > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir este tipo pois existem investimentos vinculados a ele' },
        { status: 409 }
      );
    }

    // Excluir o tipo
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM investment_types WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tipo de investimento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tipo de investimento excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir tipo de investimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}