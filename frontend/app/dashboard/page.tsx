"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import DashboardCard from "../components/DashboardCard";
import RevenueChart from "../components/RevenueCharts";
import {
  IndianRupee,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const statusConfig: Record<string, { label: string; classes: string; Icon: typeof CheckCircle2 }> = {
  paid: {
    label: "Paid",
    classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Icon: Clock,
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Icon: AlertTriangle,
  },
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    Promise.all([
      api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([userRes, statsRes]) => {
        setUser(userRes.data);
        setStats(statsRes.data);
      })
      .catch(() => router.push("/login"));
  }, []);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          {user ? `Welcome back, ${user.username || user.email} 👋` : "Dashboard"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Here&apos;s an overview of your business activity.
        </p>
      </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Revenue"
            value={`₹${Number(stats.totalRevenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            subtitle="From paid invoices"
            icon={<IndianRupee size={20} />}
            color="green"
          />
          <DashboardCard
            title="Pending"
            value={stats.pendingInvoices}
            subtitle="Awaiting payment"
            icon={<Clock size={20} />}
            color="yellow"
          />
          <DashboardCard
            title="Overdue"
            value={stats.overdueInvoices}
            subtitle="Past due date"
            icon={<AlertTriangle size={20} />}
            color="red"
          />
          <DashboardCard
            title="Total Invoices"
            value={stats.totalInvoices}
            subtitle={`${stats.customers} unique client${stats.customers !== 1 ? "s" : ""}`}
            icon={<FileText size={20} />}
            color="indigo"
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Chart + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
              Recent Invoices
            </h3>
            <a
              href="/dashboard/invoices"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View all
            </a>
          </div>

          {stats?.recentInvoices?.length > 0 ? (
            <div className="space-y-0 flex-1">
              {stats.recentInvoices.map((inv: any) => {
                const s = statusConfig[inv.status] ?? statusConfig.pending;
                const { Icon } = s;
                return (
                  <div
                    key={inv._id}
                    className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {inv.clientName}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {inv.invoiceNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        ₹{Number(inv.total).toLocaleString("en-IN")}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.classes}`}>
                        <Icon size={10} />
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-8 text-slate-400 dark:text-slate-600">
              <FileText size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No invoices yet</p>
              <a href="/dashboard/invoices" className="text-xs text-indigo-500 hover:underline mt-2">
                Create your first invoice
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
