'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { MyNotification } from '@/lib/types/database';

const EVENT_ICONS: Record<string, string> = {
  damage_new: '🔴',
  damage_updated: '🔧',
  occupation_new: '🏠',
  ticket_new: '🧾',
  maintenance_new: '🔨',
  maintenance_updated: '✅',
  maintenance_assigned: '👷',
};

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function entityHref(n: MyNotification): string | null {
  const { entity_type: t, entity_id: id } = n;
  if (t === 'damage_report')       return `/damages/${id}`;
  if (t === 'occupation')          return `/occupations/${id}`;
  if (t === 'purchase_ticket')     return `/tickets/${id}`;
  if (t === 'maintenance_request') return `/maintenance/${id}`;
  return null;
}

interface Props {
  userId: string;
}

export function NotificationBell({ userId }: Props) {
  const [open, setOpen]       = useState(false);
  const [items, setItems]     = useState<MyNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef              = useRef<HTMLDivElement>(null);
  const supabase              = createClient();

  const unread = items.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('v_my_notifications' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    setItems((data ?? []) as MyNotification[]);
    setLoading(false);
  }, [supabase]);

  async function markAllRead() {
    const unreadItems = items.filter(n => !n.is_read);
    if (unreadItems.length === 0) return;
    await supabase.from('notification_reads' as any).upsert(
      unreadItems.map(n => ({ notification_id: n.id, user_id: userId })),
      { onConflict: 'notification_id,user_id' }
    );
    setItems(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  // Carga inicial + suscripción Realtime
  useEffect(() => {
    fetchNotifications();

    const channelName = `notifications-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Cerrar al hacer clic fuera y marcar como leído
  useEffect(() => {
    if (!open) return;
    markAllRead();

    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Botón campana ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors',
          open
            ? 'bg-primary/10 text-primary'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
        )}
        aria-label="Notificaciones"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-black text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Panel ──────────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notificaciones</span>
            {unread > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                {unread} nueva{unread > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
                Cargando…
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-zinc-200" />
                <p className="text-sm font-medium text-zinc-400">Sin notificaciones</p>
                <p className="text-xs text-zinc-300">Todo tranquilo por aquí.</p>
              </div>
            ) : (
              items.map(n => {
                const href = entityHref(n);
                const icon = EVENT_ICONS[n.event_type] ?? '📋';

                const inner = (
                  <div
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors',
                      n.is_read
                        ? 'hover:bg-zinc-50'
                        : 'bg-blue-50/60 hover:bg-blue-50'
                    )}
                  >
                    <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className={cn(
                          'text-xs leading-snug',
                          n.is_read ? 'text-zinc-600' : 'font-semibold text-zinc-900'
                        )}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {n.body}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        {n.property_nickname && (
                          <span className="text-[10px] font-semibold text-primary">
                            {n.property_nickname}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );

                return href ? (
                  <Link key={n.id} href={href} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border px-4 py-2 text-center">
              <p className="text-[10px] text-zinc-400">Últimas 30 notificaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
