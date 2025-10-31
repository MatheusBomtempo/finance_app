import { requireAuth } from '@/lib/session';
import NewExpenseComponent from './new-expense-component';

export default async function NewExpensePage() {
  const user = await requireAuth();

  return <NewExpenseComponent user={user} />;
}