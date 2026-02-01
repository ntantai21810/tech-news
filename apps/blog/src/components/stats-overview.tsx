import { SystemStats } from '@/lib/api';

interface StatsOverviewProps {
  stats: SystemStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    { label: 'Sources', value: stats.activeSources, total: stats.totalSources },
    { label: 'Items', value: stats.processedItems, total: stats.totalItems },
    { label: 'Digests', value: stats.publishedDigests, total: stats.totalDigests },
  ];

  return (
    <section className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-[var(--accent-primary)]">📊</span>
        System Stats
      </h3>
      <div className="space-y-3">
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">{item.label}</span>
            <span className="font-mono font-medium">
              {item.value}
              <span className="text-[var(--text-muted)]">/{item.total}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
