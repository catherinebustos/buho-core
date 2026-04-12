import { UserMinus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/utils';
import { assignCleaner, unassignCleaner } from '@/app/(app)/properties/actions';
import type { Tables } from '@/lib/types/database.generated';
type Profile = Tables<'profiles'>;
type PropertyAssignment = Tables<'property_assignments'>;

interface AssignmentRow extends PropertyAssignment {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'> | null;
}

interface AssignmentsPanelProps {
  propertyId: string;
  assignments: AssignmentRow[];
  availableCleaners: Profile[];
  canManage: boolean;
}

export function AssignmentsPanel({
  propertyId,
  assignments,
  availableCleaners,
  canManage
}: AssignmentsPanelProps) {
  const active = assignments.filter((a) => !a.unassigned_at);
  const history = assignments.filter((a) => a.unassigned_at);

  return (
    <div className="space-y-6">
      {canManage ? (
        <form action={assignCleaner} className="flex items-end gap-3">
          <input type="hidden" name="property_id" value={propertyId} />
          <div className="flex-1 space-y-2">
            <Label htmlFor="user_id">Asignar personal de limpieza</Label>
            <Select id="user_id" name="user_id" required>
              <option value="">— Selecciona usuario —</option>
              {availableCleaners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">
            <UserPlus className="h-4 w-4" />
            Asignar
          </Button>
        </form>
      ) : null}

      <div>
        <h3 className="mb-3 text-sm font-semibold">Asignaciones activas</h3>
        {active.length === 0 ? (
          <EmptyState title="Sin asignaciones activas" className="py-6" />
        ) : (
          <ul className="space-y-2">
            {active.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{a.profiles?.full_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    Desde {formatDateTime(a.assigned_at)}
                  </p>
                </div>
                {canManage ? (
                  <form action={unassignCleaner}>
                    <input type="hidden" name="assignment_id" value={a.id} />
                    <input type="hidden" name="property_id" value={propertyId} />
                    <Button type="submit" variant="ghost" size="sm">
                      <UserMinus className="h-4 w-4" />
                      Desasignar
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {history.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Historial</h3>
          <ul className="space-y-2 text-sm">
            {history.map((a) => (
              <li key={a.id} className="rounded-md border border-border p-3 text-muted-foreground">
                <span className="font-medium text-foreground">{a.profiles?.full_name ?? '—'}</span>
                {' · '}
                {formatDateTime(a.assigned_at)} → {formatDateTime(a.unassigned_at!)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
