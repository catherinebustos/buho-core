/**
 * Motor de insights automáticos para BúhoOps.
 * Analiza datos operacionales y genera alertas / recomendaciones.
 */

export type InsightLevel = 'critical' | 'warning' | 'info' | 'positive';

export interface Insight {
  id: string;
  level: InsightLevel;
  title: string;
  description: string;
  property?: string;
  metric?: string;
}

export interface PropertySummary {
  id: string;
  nickname: string;
  title: string;
  nights: number;
  occupations: number;
  cleanings: number;
  totalSpent: number;
  openDamages: number;
  criticalDamages: number;
  avgCleaningsPerOccupation: number;
  costPerNight: number;
}

export function generateInsights(properties: PropertySummary[]): Insight[] {
  const insights: Insight[] = [];

  if (properties.length === 0) return insights;

  const avgNights = properties.reduce((s, p) => s + p.nights, 0) / properties.length;
  const avgCost = properties.reduce((s, p) => s + p.totalSpent, 0) / properties.length;
  const avgCleaningsRatio = properties.reduce((s, p) => s + p.avgCleaningsPerOccupation, 0) / properties.filter(p => p.occupations > 0).length || 0;

  for (const p of properties) {
    // ── Daños críticos sin resolver ──────────────────────────────
    if (p.criticalDamages > 0) {
      insights.push({
        id: `critical-damage-${p.id}`,
        level: 'critical',
        title: `Daño urgente sin resolver`,
        description: `${p.nickname} tiene ${p.criticalDamages} daño${p.criticalDamages > 1 ? 's' : ''} de urgencia ALTA pendiente${p.criticalDamages > 1 ? 's' : ''}. Requiere atención inmediata.`,
        property: p.nickname,
        metric: `${p.criticalDamages} urgentes`
      });
    }

    // ── Muchos daños abiertos ────────────────────────────────────
    if (p.openDamages >= 3) {
      insights.push({
        id: `open-damages-${p.id}`,
        level: 'warning',
        title: `Acumulación de daños`,
        description: `${p.nickname} acumula ${p.openDamages} daños sin resolver. Un volumen alto puede afectar la experiencia del huésped y el valor del inmueble.`,
        property: p.nickname,
        metric: `${p.openDamages} abiertos`
      });
    }

    // ── Gasto muy por encima del promedio ───────────────────────
    if (avgCost > 0 && p.totalSpent > avgCost * 1.5 && p.totalSpent > 0) {
      insights.push({
        id: `high-spend-${p.id}`,
        level: 'warning',
        title: `Gasto elevado`,
        description: `${p.nickname} registra un gasto ${Math.round((p.totalSpent / avgCost - 1) * 100)}% por encima del promedio del portfolio. Vale revisar los tickets recientes.`,
        property: p.nickname,
        metric: `$${p.totalSpent.toLocaleString('es-CL')}`
      });
    }

    // ── Baja ocupación vs promedio ──────────────────────────────
    if (avgNights > 0 && p.nights < avgNights * 0.5 && p.nights >= 0) {
      insights.push({
        id: `low-occupancy-${p.id}`,
        level: 'warning',
        title: `Baja ocupación`,
        description: `${p.nickname} tiene un 50% menos de noches ocupadas que el promedio del portfolio (${p.nights} vs ~${Math.round(avgNights)}). Podría necesitar ajuste de precios o mayor visibilidad.`,
        property: p.nickname,
        metric: `${p.nights} noches`
      });
    }

    // ── Demasiadas limpiezas por ocupación ──────────────────────
    if (p.occupations > 0 && p.avgCleaningsPerOccupation > 2.5) {
      insights.push({
        id: `excess-cleanings-${p.id}`,
        level: 'info',
        title: `Alta rotación de limpieza`,
        description: `${p.nickname} promedia ${p.avgCleaningsPerOccupation.toFixed(1)} limpiezas por ocupación. Si no es intencional, podría indicar estadías muy cortas o limpiezas duplicadas.`,
        property: p.nickname,
        metric: `${p.avgCleaningsPerOccupation.toFixed(1)} limp/ocup`
      });
    }

    // ── Propiedad con buena performance ─────────────────────────
    if (
      p.nights >= avgNights * 1.2 &&
      p.openDamages === 0 &&
      p.totalSpent <= avgCost * 1.1
    ) {
      insights.push({
        id: `top-performer-${p.id}`,
        level: 'positive',
        title: `Propiedad estrella`,
        description: `${p.nickname} está por encima del promedio en ocupación, sin daños abiertos y con gastos controlados. El modelo a seguir del portfolio.`,
        property: p.nickname,
        metric: `${p.nights} noches`
      });
    }
  }

  // ── Insights globales ────────────────────────────────────────
  const totalCritical = properties.reduce((s, p) => s + p.criticalDamages, 0);
  if (totalCritical >= 3) {
    insights.unshift({
      id: 'global-critical',
      level: 'critical',
      title: `Alerta de operaciones`,
      description: `Hay ${totalCritical} daños de urgencia ALTA distribuidos en el portfolio. Se recomienda revisión inmediata por parte de la administración.`,
      metric: `${totalCritical} críticos`
    });
  }

  const propertiesWithNoDamage = properties.filter(p => p.openDamages === 0).length;
  if (propertiesWithNoDamage === properties.length && properties.length > 0) {
    insights.push({
      id: 'global-no-damage',
      level: 'positive',
      title: `Portfolio sin daños pendientes`,
      description: `Todas las propiedades están sin daños abiertos. Excelente estado operacional.`,
      metric: `100% sin daños`
    });
  }

  // Ordenar: critical → warning → info → positive
  const order: Record<InsightLevel, number> = { critical: 0, warning: 1, info: 2, positive: 3 };
  return insights.sort((a, b) => order[a.level] - order[b.level]);
}
