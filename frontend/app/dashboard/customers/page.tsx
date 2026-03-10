"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

type Customer = {
  email: string;
  name: string;
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalRevenue: number;
};

const statusBadge: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    api.get("/invoices", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const invoices: any[] = res.data;
        const today = new Date();
        const map: Record<string, Customer> = {};
        for (const inv of invoices) {
          const email = inv.clientEmail;
          const status =
            inv.status === "pending" && new Date(inv.dueDate) < today
              ? "overdue"
              : inv.status;
          if (!map[email]) {
            map[email] = { email, name: inv.clientName, totalInvoices: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0, totalRevenue: 0 };
          }
          const c = map[email];
          c.totalInvoices++;
          if (status === "paid") { c.totalPaid++; c.totalRevenue += inv.total; }
          if (status === "pending") c.totalPending++;
          if (status === "overdue") c.totalOverdue++;
        }
        setCustomers(Object.values(map).sort((a, b) => b.totalInvoices - a.totalInvoices));
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const totalInvoices = customers.reduce((s, c) => s + c.totalInvoices, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Customers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All clients derived from your invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Customers</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{customers.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400"><Users size={20} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-green-100 dark:border-green-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {String.fromCharCode(8377)}{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400"><IndianRupee size={20} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-100 dark:border-purple-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Invoices</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{totalInvoices}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400"><TrendingUp size={20} /></div>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by name or email"
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_90px_80px_130px_110px] px-6 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          {["Customer", "Email", "Invoices", "Paid", "Pending / Overdue", "Revenue"].map((h) => (
            <span key={h} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
            <Users size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs mt-1">Create invoices to see your customers here</p>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.email} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_90px_80px_130px_110px] px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 last:border-0 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="mb-1 sm:mb-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1 sm:mb-0">
                <Mail size={13} className="shrink-0" />
                <span className="truncate text-xs">{c.email}</span>
              </div>
              <div className="mb-1 sm:mb-0">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FileText size={13} className="text-slate-400" />{c.totalInvoices}
                </span>
              </div>
              <div className="mb-1 sm:mb-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${statusBadge.paid}`}>
                  <CheckCircle2 size={10} />{c.totalPaid}
                </span>
              </div>
              <div className="flex gap-1 mb-1 sm:mb-0">
                {c.totalPending > 0 && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.pending}`}>
                    <Clock size={10} />{c.totalPending}
                  </span>
                )}
                {c.totalOverdue > 0 && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.overdue}`}>
                    <AlertTriangle size={10} />{c.totalOverdue}
                  </span>
                )}
                {c.totalPending === 0 && c.totalOverdue === 0 && <span className="text-xs text-slate-400">—</span>}
              </div>
              <div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {String.fromCharCode(8377)}{c.totalRevenue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
