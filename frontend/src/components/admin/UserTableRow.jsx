import { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Trash2, UserCheck, UserX, Shield, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export function UserTableRow({
  user,
  toggleUserField,
  confirmDelete,
  saveEdit,
  loading
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name || '', email: user.email });

  const handleSaveEdit = async () => {
    const success = await saveEdit(user, editForm);
    if (success) setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    const success = await confirmDelete(user.email);
    if (success) setIsDeleteDialogOpen(false);
  };

  return (
    <TableRow className={!user.active ? 'opacity-60' : ''}>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{user.name || <span className="text-muted-foreground italic">No name</span>}</TableCell>
      <TableCell>
        <Badge variant={user.active ? 'default' : 'destructive'}>
          {user.active ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {user.admin ? (
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        ) : (
          <Badge variant="outline">User</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setEditForm({ name: user.name || '', email: user.email })}>
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user details below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor={`edit-email-${user.id}`}>Email</Label>
                  <Input
                    id={`edit-email-${user.id}`}
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit-name-${user.id}`}>Name</Label>
                  <Input
                    id={`edit-name-${user.id}`}
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Toggle Active */}
          <Button
            size="sm"
            variant={user.active ? "outline" : "secondary"}
            onClick={() => toggleUserField(user.email, 'active')}
            title={user.active ? 'Deactivate' : 'Activate'}
          >
            {user.active ? (
              <>
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Active
              </>
            ) : (
              <>
                <UserX className="w-3.5 h-3.5 mr-1" />
                Inactive
              </>
            )}
          </Button>

          {/* Toggle Admin */}
          <Button
            size="sm"
            variant={user.admin ? "outline" : "secondary"}
            onClick={() => toggleUserField(user.email, 'admin')}
            title={user.admin ? 'Remove admin' : 'Make admin'}
          >
            {user.admin ? (
              <>
                <Shield className="w-3.5 h-3.5 mr-1" />
                Admin
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 mr-1" />
                User
              </>
            )}
          </Button>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong>{user.email}</strong>? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
