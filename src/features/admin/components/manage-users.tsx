import { updateUserRoleAction } from '@/features/admin/mutations';
import type { AdminUser } from '@/features/admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ProfileDisplayName } from '@/features/profile/components/profile-display-name';

export function ManageUsers({ users, isAdmin }: { users: AdminUser[]; isAdmin: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users and roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <form key={user.id} action={updateUserRoleAction} className="grid items-center gap-2 rounded-md border p-2 md:grid-cols-[1fr_160px_140px_90px]">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                <ProfileDisplayName isVerified={user.is_verified} name={user.display_name || user.username || user.id} />
              </p>
              <p className="truncate text-xs text-muted-foreground">@{user.username || 'unknown'} • Rep {user.reputation}</p>
            </div>
            <input name="userId" type="hidden" value={user.id} />
            <Select defaultValue={user.role} disabled={!isAdmin} name="role">
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </Select>
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input defaultChecked={user.role === 'admin' ? true : user.is_verified} disabled={!isAdmin || user.role === 'admin'} name="isVerified" type="checkbox" />
              Verified
            </label>
            <Button disabled={!isAdmin} size="sm" type="submit" variant="secondary">
              Save
            </Button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}
