import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export interface DecodedUserToken {
  userId: number;
  email: string;
  perfil: 'admin' | 'user';
  exp?: number;
  iat?: number;
}

export async function getSessionUser(): Promise<DecodedUserToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token) as DecodedUserToken | null;
  if (!decoded) return null;

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    const store = await cookies();
    store.delete('auth-token');
    return null;
  }

  return decoded;
}

export async function requireAuth(): Promise<DecodedUserToken> {
  const user = await getSessionUser();
  if (!user) redirect('/');
  return user;
}

export async function requireRole(allowed: Array<'admin' | 'user'>): Promise<DecodedUserToken> {
  const user = await requireAuth();
  if (!allowed.includes(user.perfil)) {
    redirect('/sem_permissao');
  }
  return user;
}


