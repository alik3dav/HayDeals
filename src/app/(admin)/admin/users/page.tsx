import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { ManageUsers } from '@/features/admin/components/manage-users';
import { getUsers } from '@/features/admin/queries';
import { requireRole } from '@/lib/auth/session';

export default async function AdminUsersPage() {
  const [{ role }, users] = await Promise.all([requireRole(['moderator', 'admin']), getUsers()]);

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Manage users and roles" description="Moderators can view users, admins can update role assignments." />
      <ManageUsers isAdmin={role === 'admin'} users={users} />
    </div>
  );
}
