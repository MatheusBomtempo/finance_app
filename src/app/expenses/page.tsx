import { requireAuth } from '@/lib/session';

// Componente integrado diretamente para evitar problemas de import
import ExpensesPageComponent from '@/app/expenses/expenses-page-component';

export default async function ExpensesPage() {
  const user = await requireAuth();

  return <ExpensesPageComponent user={user} />;
}