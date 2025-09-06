import { AdminDashboard } from '@/components/admin-dashboard';
import { ProtectedRoute } from '@/components/protected-route';
import { Toaster } from '@/components/ui/toaster';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
      <Toaster />
    </ProtectedRoute>
  );
}
