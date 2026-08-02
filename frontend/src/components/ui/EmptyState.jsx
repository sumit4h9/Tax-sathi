'use client';

export default function EmptyState({ title, description, icon: Icon }) {
  return (
    <section className="py-16 px-6 text-center">
      {Icon && (
        <span className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </span>
      )}
      <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">{description}</p>
      )}
    </section>
  );
}
