import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { moviesApi } from '../services/api';
import { GENRE_MAP } from '../types';

function parseGenreIds(ids: string): number[] {
  try {
    return JSON.parse(ids);
  } catch {
    return [];
  }
}

function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-row">
          <span className="bar-label">{d.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${maxVal ? (d.value / maxVal) * 100 : 0}%` }} />
          </div>
          <span className="bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function StatsPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['detailed-stats'],
    queryFn: () => moviesApi.detailedStats(),
  });

  if (isLoading) return <div className="empty">{t('loading')}</div>;
  if (!stats) return <div className="empty">{t('noResults')}</div>;

  const avgRating = stats.ratingStats.ratedCount
    ? Math.round(
        (stats.ratingDistribution.reduce((sum, r) => sum + r.rating * r.count, 0) /
          stats.ratingStats.ratedCount) *
          10
      ) / 10
    : 0;

  const ratingData = Array.from({ length: 10 }, (_, i) => {
    const found = stats.ratingDistribution.find(r => r.rating === i + 1);
    return { label: `${i + 1}`, value: found?.count || 0 };
  });
  const maxRating = Math.max(...ratingData.map(r => r.value), 1);

  const genreMap = new Map<number, { count: number; totalRating: number; ratedCount: number }>();
  stats.genreStats.forEach(g => {
    const ids = parseGenreIds(g.genre_ids);
    ids.forEach(id => {
      const existing = genreMap.get(id) || { count: 0, totalRating: 0, ratedCount: 0 };
      existing.count += g.count;
      if (g.avg_rating) {
        existing.totalRating += g.avg_rating * g.count;
        existing.ratedCount += g.count;
      }
      genreMap.set(id, existing);
    });
  });

  const genreData = Array.from(genreMap.entries())
    .map(([id, data]) => ({
      label: GENRE_MAP[id] || `#${id}`,
      value: data.count,
      avg: data.ratedCount ? Math.round((data.totalRating / data.ratedCount) * 10) / 10 : null,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const maxGenre = Math.max(...genreData.map(g => g.value), 1);

  const monthData = stats.monthlyStats.map(m => ({
    label: m.month,
    value: m.count,
  }));
  const maxMonth = Math.max(...monthData.map(m => m.value), 1);

  return (
    <div>
      <h1>{t('statisticsPage.title')}</h1>

      <div className="stat-grid">
        <StatCard label={t('statisticsPage.totalMovies')} value={stats.totalMovies} />
        <StatCard
          label={t('statisticsPage.avgRating')}
          value={avgRating || '—'}
          sub={`${stats.ratingStats.ratedCount} ${t('statisticsPage.rated')}`}
        />
        <StatCard label={t('statisticsPage.minRating')} value={stats.ratingStats.min || '—'} />
        <StatCard label={t('statisticsPage.maxRating')} value={stats.ratingStats.max || '—'} />
      </div>

      <div className="stats-section">
        <h2>{t('statisticsPage.ratingDistribution')}</h2>
        <BarChart data={ratingData} maxVal={maxRating} />
      </div>

      <div className="stats-section">
        <h2>{t('statisticsPage.topGenres')}</h2>
        <BarChart data={genreData} maxVal={maxGenre} />
        {genreData.some(g => g.avg !== null) && (
          <div className="genre-averages">
            {genreData.filter(g => g.avg !== null).map((g, i) => (
              <span key={i} className="genre-avg-tag">
                {g.label}: ★ {g.avg}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="stats-section">
        <h2>{t('statisticsPage.addedOverTime')}</h2>
        <BarChart data={monthData} maxVal={maxMonth} />
      </div>

      <div className="stats-section">
        <h2>{t('statisticsPage.byList')}</h2>
        <div className="stat-grid">
          {stats.byListType.map(l => (
            <StatCard
              key={l.list_type}
              label={t(l.list_type)}
              value={l.count}
              sub={l.avg_rating ? `★ ${Math.round(l.avg_rating * 10) / 10}` : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
