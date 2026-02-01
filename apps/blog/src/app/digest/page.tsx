import { Metadata } from 'next';
import { getDigests } from '@/lib/api';
import { DigestCard } from '@/components/digest-card';

export const metadata: Metadata = {
  title: 'All Digests',
  description: 'Browse all daily tech digests covering JavaScript, TypeScript, Next.js, NestJS, and AI/ML updates.',
};

export const revalidate = 60;

export default async function DigestsPage() {
  const digests = await getDigests(50);

  // Group by month
  const grouped = digests.reduce((acc, digest) => {
    const date = new Date(digest.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(digest);
    return acc;
  }, {} as Record<string, typeof digests>);

  return (
    <div className="container max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">All Digests</h1>

      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--text-muted)]">No digests published yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, monthDigests]) => {
              const date = new Date(`${month}-01`);
              const monthName = date.toLocaleString('en', { month: 'long', year: 'numeric' });

              return (
                <section key={month}>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--text-secondary)]">
                    {monthName}
                  </h2>
                  <div className="space-y-4">
                    {monthDigests.map((digest) => (
                      <DigestCard key={digest.id} digest={digest} />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
