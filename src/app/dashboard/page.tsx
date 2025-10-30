import { requireAuth } from '@/lib/session';
import { escapeHtml } from '@/lib/sanitize';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const user = await requireAuth();
  const safeEmail = escapeHtml(user.email);







  return (
    <DashboardClient user={user} safeEmail={safeEmail} />
  );
}
  