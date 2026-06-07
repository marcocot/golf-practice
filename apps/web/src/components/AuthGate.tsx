import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/lib/auth-client';

export function AuthGate() {
  const { data, isPending } = useSession();

  if (isPending) {
    return null;
  }
  if (!data) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}
