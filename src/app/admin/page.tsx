import { AdminDashboard } from '@/components/admin-dashboard';
import { pitches } from '@/lib/data';

export default function AdminPage() {
  return <AdminDashboard pitches={pitches} />;
}
