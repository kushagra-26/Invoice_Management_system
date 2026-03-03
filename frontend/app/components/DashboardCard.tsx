interface Props {
  title: string;
  value: string;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow">
      <h3 className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {title}
      </h3>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}