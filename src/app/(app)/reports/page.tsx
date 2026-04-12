import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, ClipboardList, AlertTriangle, Receipt, TrendingUp, Building2 } from 'lucide-react';
import { formatCLP } from '@/lib/utils';
import { generateInsights, type PropertySummary } from '@/lib/insights';
import { InsightsPanel, InsightsBadge } from '@/components/reports/insights-panel';
import {
  PropertyComparisonChart,
  PropertySpendChart,
  MonthlyExpenseChart
} from '@/components/reports/charts';

export default async function ReportsPage() {
  await requireRole('admin');
  const supabase = createClient();

  const [
    { data: properties },
    { data: kpis },
    { data: damages },
    { data: ticketItems },
    { data: tickets }
  ] = await Promise.all([
    supabase.from('properties').select('id, nickname, title').eq('status', 'activa'),
    supabase.from('v_property_month_kpis' as any).select('*'),
    supabase.from('damage_reports').select('property_id, status, urgency'),
    supabase.from('ticket_items').select('property_id, subtotal'),
    supabase.from('purchase_tickets').select('purchase_date, total').order('purchase_date')
  ]);

  const props     = (properties  ?? []) as any[];
  const kpiRows   = (kpis        ?? []) as any[];
  const dmgRows   = (damages     ?? []) as any[];
  const itemRows  = (ticketItems ?? []) as any[];
  const ticketRows = (tickets    ?? []) as any[];

  const summaries: PropertySummary[] = props.map((p) => {
    const propKpis    = kpiRows.filter((k: any) => k.property_id === p.id);
    const nights      = propKpis.reduce((s: number, k: any) => s + Number(k.nights_count    ?? 0), 0);
    const occupations = propKpis.reduce((s: number, k: any) => s + Number(k.occupations_count ?? 0), 0);
    const cleanings   = propKpis.reduce((s: number, k: any) => s + Number(k.cleanings_count  ?? 0), 0);
    const totalSpent  = itemRows.filter((i: any) => i.property_id === p.id)
                                .reduce((s: number, i: any) => s + Number(i.subtotal ?? 0), 0);
    const propDmg        = dmgRows.filter((d: any) => d.property_id === p.id);
    const openDamages    = propDmg.filter((d: any) => !['resuelto','descartado'].includes(d.status)).length;
    const criticalDamages = propDmg.filter((d: any) => d.urgency === 'alta' && !['resuelto','descartado'].includes(d.status)).length;
    return {
      id: p.id, nickname: p.nickname, title: p.title,
      nights, occupations, cleanings, totalSpent, openDamages, criticalDamages,
      avgCleaningsPerOccupation: occupations > 0 ? cleanings / occupations : 0,
      costPerNight: nights > 0 ? totalSpent / nights : 0
    };
  });

  const totalNights      = summaries.reduce((s, p) => s + p.nights, 0);
  const totalOccupations = summaries.reduce((s, p) => s + p.occupations, 0);
  const totalCleanings   = summaries.reduce((s, p) => s + p.cleanings, 0);
  const totalSpent       = summaries.reduce((s, p) => s + p.totalSpent, 0);
  const totalOpenDamages = summaries.reduce((s, p) => s + p.openDamages, 0);

  const expenseByMonth: Record<string, number> = {};
  for (const t of ticketRows) {
    const month = (t.purchase_date as string)?.slice(0, 7) + '-01';
    expenseByMonth[month] = (expenseByMonth[month] ?? 0) + Number(t.total ?? 0);
  }
  const monthlyExpenses = Object.entries(expenseByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  const comparisonData = [...summaries]
    .sort((a, b) => b.nights - a.nights)
    .map(p => ({ nickname: p.nickname, nights: p.nights, spent: p.totalSpent }));

  const insights = generateInsights(summaries);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Análisis operacional</p>
          <h1 className="text-2xl font-bold">Reportes del Portfolio</h1>
          <p className="text-sm text-muted-foreground">{props.length} propiedades activas</p>
        </div>
        <InsightsBadge insights={insights} />
      </div>

      {/* KPIs globales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {([
          { label: 'Noches totales',  value: totalNights,           sub: `${totalOccupations} ocupaciones`, Icon: CalendarDays, alert: false },
          { label: 'Limpiezas',       value: totalCleanings,        sub: 'Históricas',                      Icon: ClipboardList, alert: false },
          { label: 'Gasto total',     value: formatCLP(totalSpent), sub: 'En tickets registrados',          Icon: Receipt, alert: false, text: true },
          { label: 'Daños abiertos',  value: totalOpenDamages,      sub: 'Sin resolver',                    Icon: AlertTriangle, alert: totalOpenDamages > 0 },
          { label: 'Propiedades',     value: props.length,          sub: 'Activas',                         Icon: Building2, alert: false },
        ] as const).map(({ label, value, sub, Icon, alert }) => (
          <Card key={label} className={alert ? 'border-red-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${alert ? 'text-red-400' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold tabular-nums ${alert ? 'text-red-600' : ''}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Análisis inteligente
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Detección automática de anomalías y oportunidades de mejora
          </p>
        </CardHeader>
        <CardContent>
          <InsightsPanel insights={insights} />
        </CardContent>
      </Card>

      {/* Gráficas comparativas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Noches por propiedad</CardTitle>
            <p className="text-xs text-muted-foreground">Comparativo histórico</p>
          </CardHeader>
          <CardContent className="pt-0">
            <PropertyComparisonChart data={comparisonData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Gasto por propiedad</CardTitle>
            <p className="text-xs text-muted-foreground">Total en tickets de compra</p>
          </CardHeader>
          <CardContent className="pt-0">
            <PropertySpendChart data={comparisonData.map(d => ({ nickname: d.nickname, spent: d.spent }))} />
          </CardContent>
        </Card>
      </div>

      {monthlyExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Evolución de gastos del portfolio</CardTitle>
            <p className="text-xs text-muted-foreground">Gasto mensual consolidado</p>
          </CardHeader>
          <CardContent className="pt-0">
            <MonthlyExpenseChart data={monthlyExpenses} />
          </CardContent>
        </Card>
      )}

      {/* Tabla ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Ranking de propiedades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/50 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Propiedad</th>
                  <th className="px-4 py-3 text-right font-medium">Noches</th>
                  <th className="px-4 py-3 text-right font-medium">Ocup.</th>
                  <th className="px-4 py-3 text-right font-medium">Limp.</th>
                  <th className="px-4 py-3 text-right font-medium">Gasto</th>
                  <th className="px-4 py-3 text-right font-medium">Daños</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {[...summaries].sort((a, b) => b.nights - a.nights).map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.nickname}</div>
                      <div className="text-xs text-muted-foreground">{p.title}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.nights}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.occupations}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.cleanings}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.totalSpent > 0 ? formatCLP(p.totalSpent) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {p.openDamages > 0 ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${p.criticalDamages > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.openDamages}{p.criticalDamages > 0 ? ' ⚡' : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-600">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/reports/${p.id}`} className="text-xs font-medium text-primary hover:underline">
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
