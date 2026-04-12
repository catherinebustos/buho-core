import { requireProfile } from '@/lib/auth';
import { hasRoleAtLeast } from '@/lib/auth';
import { CleanerDashboard } from '@/components/dashboard/cleaner-dashboard';
import { SupervisorDashboard } from '@/components/dashboard/supervisor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

export default async function DashboardPage() {
  const profile = await requireProfile();

  if (hasRoleAtLeast(profile.role, 'admin')) {
    return <AdminDashboard profile={profile} />;
  }

  if (hasRoleAtLeast(profile.role, 'supervisor')) {
    return <SupervisorDashboard profile={profile} />;
  }

  return <CleanerDashboard profile={profile} />;
}
