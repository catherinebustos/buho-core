import { notFound } from 'next/navigation';
import { CalendarDays, ClipboardList, Repeat, Receipt, TrendingUp } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCLP } from '@/lib/utils';
import { generateInsights, type PropertySummary } from '@/lib/insights';
import { InsightsPanel } from '@/components/reports/insights-panel';
import {
  MonthlyOccupationChart,
  DamageDonutChart,
  MonthlyExpenseChart
} from '@/components/reports/charts';

interface KpiRow {
  property_id: string;
  month: string;
  occupations_count: number;
  nights_count: number;
  cleanings_count: number;
  cleanings_per_occupation: number | null;
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatMonth(month: string) {
  const d = new Date(month);
  return `${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default async function PropertyReportPage({
  params
}: {
  params: { propertyId: string };
}) {
  await requireRole('admin');
  const supabase = createClient();

  const [
    { data: property },
    { data: kpis },
    { data: damages },
    { data: ticketItems },
    { data: tickets }
  ] = await Promise.all([
    supabase.from('properties').select('id, nickname, title, city').eq('id', params.propertyId).maybeSingle(),
    supabase.from('v_property_month_kpis' as any).select('*').eq('property_id', params.propertyId).order('month', { ascending: true }),
    supabase.from('damage_reports').select('status, urgency').eq('property_id', params.propertyId),
    supabase.from('ticket_items').select('subtotal').eq('property_id', params.propertyId),
    supabase.from('purchase_tickets').select('purchase_date, total').order('purchase_date')
  ]);

  if (!property) notFound();

  const p = property as any;
  const rows = (kpis ?? []) as unknown as KpiRow[];
  const dmgRows = (damages ?? []) as any[];
  const itemRows = (ticketItems ?? []) as any[];
  const ticketRows = (tickets ?? []) as any[];

  const totals = rows.reduce(
    (acc, r) => {
      acc.occupations += r.occupations_count;
      acc.nights += r.nights_count;
      acc.cleanings += r.cleanings_count;
      return acc;
    },
    { occupations: 0, nights: 0, cleanings: 0 }
  );

  const totalSpent = itemRows.reduce((s: number, i: any) => s + Number(i.subtotal ?? 0), 0);
  const openDamages = dmgRows.filter((d: any) => !['resuelto', 'descartado'].includes(d.status)).length;
  const criticalDamages = dmgRows.filter((d: any) => d.urgency === 'alta' && !['resuelto', 'descartado'].includes(d.status)).length;
  const avgCleaningsPerOccupation = totals.occupations > 0 ? totals.cleanings / totals.occupations : 0;
  const costPerNight = totals.nights > 0 ? totalSpent / totals.nights : 0;

  const summary: PropertySummary = {
    id: p.id,
    nickname: p.nickname,
    title: p.title,
    nights: totals.nights,
    occupations: totals.occupations,
    cleanings: totals.cleanings,
    totalSpent,
    openDamages,
    criticalDamages,
    avgCleaningsPerOccupation,
    costPerNight
  };

  const insights = generateInsights([summary]);

  // Monthly occupation data for chart
  const occupationChartData = rows.map(r => ({
    month: r.month,
    nights: r.nights_count,
    cleanings: r.cleanings_count
  }));

  // Damage status distribution for donut chart
  const damageStatusMap: Record<string, number> = {};
  for (const d of dmgRows) {
    damageStatusMap[d.status] = (damageStatusMap[d.status] ?? 0) + 1;
  }
  const damageChartData = Object.entries(damageStatusMap).map(([status, count]) => ({ status, count }));

  // Monthly expense data (from all tickets — filtered to this property via ticket_items)
  // We use ticket_items for this property to build per-month spend
  const expenseByMonth: Record<string, number> = {};
  for (const t of ticketRows) {
    const month = (t.purchase_date as string)?.slice(0, 7) + '-01';
    expenseByMonth[month] = (expenseByMonth[month] ?? 0) + Number(t.total ?? 0);
  }
  // Note: purchase_tickets don't have property_id — use ticket_items subtotals per month instead
  // We'll build monthly expense from ticket_items if we had the date; for now show portfolio expense trend
  // Since ticket_items don't have a date, we use the global tickets trend as context
  const monthlyExpenses = Object.entries(expenseByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/reports" />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Reporte de propiedad</p>
          <h1 className="text-2xl font-bold">{p.nickname}</h1>
          <p className="text-sm text-muted-foreground">{p.title} · {p.city}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Noches totales</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totals.nights}</p>
            <p className="text-xs text-muted-foreground">{totals.occupations} ocupaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Limpiezas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totals.cleanings}</p>
            <p className="text-xs text-muted-foreground">Históricas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Limp. / ocupación</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {totals.occupations > 0 ? avgCleaningsPerOccupation.toFixed(2) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Promedio histórico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Gasto total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {totalSpent > 0 ? formatCLP(totalSpent) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {costPerNight > 0 ? `${formatCLP(Math.round(costPerNight))} / noche` : 'Sin gastos registrados'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights for this property */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Análisis de la propiedad
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Alertas y observaciones automáticas
          </p>
        </CardHeader>
        <CardContent>
          <InsightsPanel insights={insights} />
        </CardContent>
      </Card>

      {/* Charts */}
      {occupationChartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Noches y limpiezas por mes</CardTitle>
              <p className="text-xs text-muted-foreground">Evolución histórica</p>
            </CardHeader>
            <CardContent className="pt-0">
              <MonthlyOccupationChart data={occupationChartData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Estado de daños</CardTitle>
              <p className="text-xs text-muted-foreground">Distribución por estado</p>
            </CardHeader>
            <CardContent className="pt-0">
              <DamageDonutChart data={damageChartData} />
            </CardContent>
          </Card>
        </div>
      )}

      {monthlyExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Evolución de gastos del portfolio</CardTitle>
            <p className="text-xs text-muted-foreground">Contexto: gasto mensual consolidado de todas las propiedades</p>
          </CardHeader>
          <CardContent className="pt-0">
            <MonthlyExpenseChart data={monthlyExpenses} />
          </CardContent>
        </Card>
      )}

      {/* Monthly breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose mensual</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CalendarDays className="h-10 w-10" />}
                title="Sin datos"
                description="Todavía no se registraron ocupaciones ni visitas para esta propiedad."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Ocupaciones</TableHead>
                  <TableHead className="text-right">Noches</TableHead>
                  <TableHead className="text-right">Limpiezas</TableHead>
                  <TableHead className="text-right">Limp. / ocup.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...rows].reverse().map((r) => (
                  <TableRow key={r.month}>
                    <TableCell className="font-medium">{formatMonth(r.month)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.occupations_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.nights_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.cleanings_count}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.cleanings_per_occupation ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
