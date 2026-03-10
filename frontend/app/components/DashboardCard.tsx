import { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "indigo" | "green" | "yellow" | "red";
}

const colorMap = {
  indigo: {
    border: "border-indigo-100 dark:border-indigo-800/50",
    iconBg: "bg-indigo-600",
    iconText: "text-white",
    accent: "from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-800",
    valueCls: "text-slate-800 dark:text-white",
  },
  green: {
    border: "border-green-100 dark:border-green-800/50",
    iconBg: "bg-green-600",
    iconText: "text-white",
    accent: "from-green-50 to-white dark:from-green-950/20 dark:to-slate-800",
    valueCls: "text-slate-800 dark:text-white",
  },
  yellow: {
    border: "border-amber-100 dark:border-amber-800/50",
    iconBg: "bg-amber-500",
    iconText: "text-white",
    accent: "from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-800",
    valueCls: "text-slate-800 dark:text-white",
  },
  red: {
    border: "border-red-100 dark:border-red-800/50",
    iconBg: "bg-red-500",
    iconText: "text-white",
    accent: "from-red-50 to-white dark:from-red-950/20 dark:to-slate-800",
    valueCls: "text-slate-800 dark:text-white",
  },
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
}: Props) {
  const c = colorMap[color];

  return (
    <div
      className={`bg-gradient-to-br ${c.accent} rounded-2xl shadow-sm border ${c.border} hover:shadow-md transition-all duration-200 p-5 group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 tracking-tight ${c.valueCls}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`shrink-0 p-2.5 rounded-xl ${c.iconBg} ${c.iconText} shadow-sm group-hover:scale-110 transition-transform duration-200`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
