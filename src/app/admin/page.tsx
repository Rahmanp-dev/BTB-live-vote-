import { AdminDashboard } from '@/components/admin-dashboard';
import { pitches } from '@/lib/data';
import { ProtectedRoute } from '@/components/protected-route';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard pitches={pitches} />
    </ProtectedRoute>
  );
}
