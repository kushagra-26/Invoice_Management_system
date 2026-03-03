"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import DashboardCard from "../components/DashboardCard";
import RevenueChart from "../components/RevenueCharts";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        router.push("/login");
      });
  }, []);

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Welcome {user?.email}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <DashboardCard
          title="Total Revenue"
          value="$12,450"
          subtitle="This month"
        />

        <DashboardCard
          title="Pending Invoices"
          value="18"
          subtitle="Awaiting payment"
        />

        <DashboardCard
          title="Customers"
          value="42"
          subtitle="Active clients"
        />
        <RevenueChart />

      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold mb-4 text-slate-700 dark:text-white">
          Recent Activity
        </h3>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Invoice #1023 paid</p>
          <p>New customer added</p>
          <p>Invoice #1024 pending</p>
        </div>
      </div>

    </div>
  );
}