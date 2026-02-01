import { SystemStats } from '@/lib/api';
import { Database, FileText, Newspaper, BarChart3 } from 'lucide-react';

interface StatsOverviewProps {
  stats: SystemStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    { 
      label: 'Sources', 
      value: stats.activeSources, 
      total: stats.totalSources,
      icon: Database,
      color: '#60A5FA'
    },
    { 
      label: 'Items', 
      value: stats.processedItems, 
      total: stats.totalItems,
      icon: FileText,
      color: '#34D399'
    },
    { 
      label: 'Digests', 
      value: stats.publishedDigests, 
      total: stats.totalDigests,
      icon: Newspaper,
      color: '#FBBF24'
    },
  ];

  return (
    <section className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: 'var(--accent-muted)',
        }}>
          <BarChart3 style={{ width: '1rem', height: '1rem', color: 'var(--accent-primary)' }} />
        </span>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>System Stats</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {statItems.map((item) => {
          const Icon = item.icon;
          const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
          
          return (
            <div key={item.label}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '0.375rem',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Icon style={{ width: '1rem', height: '1rem', color: item.color }} />
                  {item.label}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  {item.value}
                  <span style={{ color: 'var(--text-muted)' }}>/{item.total}</span>
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ 
                height: '0.375rem', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div 
                  style={{ 
                    height: '100%',
                    background: 'var(--accent-primary)',
                    borderRadius: '9999px',
                    width: `${Math.min(percentage, 100)}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
