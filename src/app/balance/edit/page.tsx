import { requireAuth } from '@/lib/session';
import EditBalanceComponent from './edit-balance-component';

export default async function EditBalancePage() {
  const user = await requireAuth();

  return <EditBalanceComponent user={user} />;
}