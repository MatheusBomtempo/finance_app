import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface User {
  id: number;
  email: string;
  perfil: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

// Função para verificar credenciais do usuário
export async function verifyCredentials(credentials: LoginCredentials): Promise<User | null> {
  try {
    const { email, senha } = credentials;
    
    const [rows] = await pool.execute(
      'SELECT id, email, senha_hash, perfil FROM usuarios WHERE email = ?',
      [email]
    ) as any[];

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      perfil: user.perfil
    };
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error);
    return null;
  }
}

// Função para gerar JWT
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      perfil: user.perfil 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Função para verificar JWT
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Função para hash de senha (útil para criar usuários)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}
