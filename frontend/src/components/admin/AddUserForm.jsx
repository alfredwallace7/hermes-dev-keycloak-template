import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Plus, RefreshCw } from 'lucide-react';

export function AddUserForm({
  newUser,
  setNewUser,
  addUser,
  loading,
  collapsed,
  setCollapsed
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Create a new managed user.</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">Display name</Label>
              <Input
                id="new-name"
                type="text"
                placeholder="Optional display name"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="active-checkbox"
                checked={newUser.active}
                onCheckedChange={checked => setNewUser({ ...newUser, active: checked })}
              />
              <Label htmlFor="active-checkbox" className="cursor-pointer">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="admin-checkbox"
                checked={newUser.admin}
                onCheckedChange={checked => setNewUser({ ...newUser, admin: checked })}
              />
              <Label htmlFor="admin-checkbox" className="cursor-pointer">Admin</Label>
            </div>
          </div>
          <Button onClick={addUser} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
