import { cookies } from 'next/headers';
import { requireProfile, PREVIEW_COOKIE } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNav } from '@/components/layout/mobile-nav';
import { RolePreviewBar } from '@/components/layout/role-preview-bar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import type { UserRole } from '@/lib/types/database';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const realRole = (profile as any)._realRole as UserRole | undefined;
  const isPreview = !!realRole;
  const previewRole = isPreview ? profile.role : null;

  const cookieStore = cookies();
  const previewCookieVal = realRole
    ? (cookieStore.get(PREVIEW_COOKIE)?.value as UserRole | undefined) ?? null
    : null;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Banner de vista previa (solo super_admin) */}
      {(profile.role === 'super_admin' || realRole === 'super_admin') && (
        <RolePreviewBar currentPreviewRole={previewCookieVal} />
      )}

      {/* Main App Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop - Super Clean */}
        <aside className="hidden w-64 flex-col bg-white z-10 md:flex my-4 ml-4">
          <div className="flex h-20 items-center gap-4 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary text-xl font-bold text-white shadow-lg shadow-primary/20">
              B
            </div>
            <div>
              <p className="font-heading text-lg font-extrabold tracking-tight text-foreground">Búho Core</p>
              <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Workspace <span className="italic lowercase">/ spazio</span></p>
            </div>
          </div>
          <div className="px-3 mt-4 flex-1">
             <Sidebar role={profile.role} />
          </div>
        </aside>

        {/* Content Area - Subtly separated */}
        <div className="flex flex-1 flex-col relative md:p-4 w-full">
          {/* Mobile Header (Hidden on Desktop) */}
          <header className="sticky top-0 z-[150] flex h-16 md:hidden">
            {/* Div decorativo para no romper el fixed del Drawer interno */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-zinc-100 -z-10 pointer-events-none" />
            <div className="relative z-10 flex flex-1 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <MobileNav role={profile.role} fullName={profile.full_name} />
                <span className="font-heading text-lg font-bold tracking-tight">Búho Core</span>
              </div>
              <NotificationBell userId={profile.id} />
            </div>
          </header>

          {/* Main Workspace Card */}
          <main className="flex-1 overflow-y-auto bg-zinc-50/70 md:rounded-[2rem] p-4 md:p-8 pb-28 md:pb-8 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
            <div className="hidden md:flex items-center justify-between mb-8">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Overview <span className="text-zinc-300 italic lowercase font-normal ml-1">/ riepilogo</span></h1>
              <div className="flex items-center gap-3">
                <NotificationBell userId={profile.id} />
                <UserMenu profile={profile} />
              </div>
            </div>
            
            {/* Page Content */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
