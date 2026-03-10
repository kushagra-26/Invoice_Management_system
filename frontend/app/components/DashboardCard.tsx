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
    border: "border-indigo-100 dark:border-indigo-800",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
    iconText: "text-indigo-600 dark:text-indigo-400",
  },
  green: {
    border: "border-green-100 dark:border-green-800",
    iconBg: "bg-green-50 dark:bg-green-900/30",
    iconText: "text-green-600 dark:text-green-400",
  },
  yellow: {
    border: "border-yellow-100 dark:border-yellow-800",
    iconBg: "bg-yellow-50 dark:bg-yellow-900/30",
    iconText: "text-yellow-600 dark:text-yellow-400",
  },
  red: {
    border: "border-red-100 dark:border-red-800",
    iconBg: "bg-red-50 dark:bg-red-900/30",
    iconText: "text-red-600 dark:text-red-400",
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
      className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border ${c.border} hover:shadow-md transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`shrink-0 p-3 rounded-xl ${c.iconBg} ${c.iconText} group-hover:scale-110 transition-transform duration-200`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
