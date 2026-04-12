'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PRIMARY = '#854d0e';
const COLORS = ['#854d0e', '#a16207', '#ca8a04', '#eab308', '#fde047'];
const DAMAGE_COLORS: Record<string, string> = {
  pendiente: '#ef4444',
  en_proceso: '#f97316',
  resuelto: '#22c55e',
  descartado: '#94a3b8'
};

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatMonth(month: string) {
  const d = new Date(month);
  return `${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatCLP(value: number) {
  return `$${value.toLocaleString('es-CL')}`;
}

// ── Gráfica de barras: noches + limpiezas por mes ────────────────
export function MonthlyOccupationChart({
  data
}: {
  data: { month: string; nights: number; cleanings: number }[];
}) {
  const formatted = data.map(d => ({ ...d, mes: formatMonth(d.month) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="nights" name="Noches" fill={PRIMARY} radius={[4,4,0,0]} />
        <Bar dataKey="cleanings" name="Limpiezas" fill="#d97706" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Gráfica de línea: gasto mensual ─────────────────────────────
export function MonthlyExpenseChart({
  data
}: {
  data: { month: string; total: number }[];
}) {
  const formatted = data.map(d => ({ ...d, mes: formatMonth(d.month) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => formatCLP(v)} />
        <Line
          type="monotone" dataKey="total" name="Gasto"
          stroke={PRIMARY} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Donut: distribución de daños ─────────────────────────────────
const DAMAGE_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso',
  resuelto: 'Resuelto', descartado: 'Descartado'
};

export function DamageDonutChart({
  data
}: {
  data: { status: string; count: number }[];
}) {
  if (data.length === 0) return (
    <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
      Sin daños registrados
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data} dataKey="count" nameKey="status"
          cx="50%" cy="50%" innerRadius={55} outerRadius={80}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={DAMAGE_COLORS[entry.status] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [v, DAMAGE_LABELS[name as string] ?? name]} />
        <Legend formatter={(v) => DAMAGE_LABELS[v] ?? v} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Barras horizontales: comparación de propiedades ──────────────
export function PropertyComparisonChart({
  data
}: {
  data: { nickname: string; nights: number; spent: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
      <BarChart
        data={data} layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="nickname" width={90} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="nights" name="Noches" fill={PRIMARY} radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Barras: gasto por propiedad ──────────────────────────────────
export function PropertySpendChart({
  data
}: {
  data: { nickname: string; spent: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
      <BarChart
        data={data} layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="nickname" width={90} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => formatCLP(v)} />
        <Bar dataKey="spent" name="Gasto total" fill="#d97706" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
