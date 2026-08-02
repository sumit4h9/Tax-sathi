'use client';

export function CardSkeleton({ count = 4 }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      ))}
    </section>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <section className="space-y-3 animate-pulse p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      ))}
    </section>
  );
}
