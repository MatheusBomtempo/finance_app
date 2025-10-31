import { requireAuth } from '@/lib/session';
import NewInvestmentComponent from './new-investment-component';

export default async function NewInvestmentPage() {
  const user = await requireAuth();

  return <NewInvestmentComponent user={user} />;
}