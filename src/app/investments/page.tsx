import { requireAuth } from '@/lib/session';
import InvestmentsComponent from './investments-component';

export default async function InvestmentsPage() {
  const user = await requireAuth();

  return <InvestmentsComponent user={user} />;
}