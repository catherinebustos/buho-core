import { AlertTriangle, TrendingUp, Info, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Insight } from '@/lib/insights';

const CONFIG = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-red-50 border-red-200',
    icon_class: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Crítico'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-200',
    icon_class: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Atención'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    icon_class: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Info'
  },
  positive: {
    icon: CheckCircle2,
    bg: 'bg-green-50 border-green-200',
    icon_class: 'text-green-500',
    badge: 'bg-green-100 text-green-700',
    label: 'Positivo'
  }
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 text-green-400" />
        <p className="text-sm font-medium">Todo en orden</p>
        <p className="text-xs">No hay alertas activas en el portfolio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const cfg = CONFIG[insight.level];
        const Icon = cfg.icon;
        return (
          <div
            key={insight.id}
            className={cn('flex gap-3 rounded-xl border p-4', cfg.bg)}
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cfg.icon_class)} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900">{insight.title}</span>
                {insight.property && (
                  <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 border border-zinc-200">
                    {insight.property}
                  </span>
                )}
                {insight.metric && (
                  <span className={cn('ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold', cfg.badge)}>
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InsightsBadge({ insights }: { insights: Insight[] }) {
  const critical = insights.filter(i => i.level === 'critical').length;
  const warning  = insights.filter(i => i.level === 'warning').length;
  if (critical === 0 && warning === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {critical > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
          <Zap className="h-3 w-3" /> {critical} crítico{critical > 1 ? 's' : ''}
        </span>
      )}
      {warning > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
          <AlertTriangle className="h-3 w-3" /> {warning} alerta{warning > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
