"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Invoices() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const fetchInvoices = async () => {
    if (!token) return;

    try {
      const res = await api.get("/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data);
    } catch {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchInvoices();
  }, []);

  // Status badge styling
  const statusBadge = (status: string) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";

    if (status === "paid")
      return `${base} bg-green-100 text-green-700`;

    if (status === "overdue")
      return `${base} bg-red-100 text-red-700`;

    return `${base} bg-yellow-100 text-yellow-700`;
  };

  // Filter logic
  const filteredInvoices =
    filter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === filter);

  // Mark as paid
  const handleMarkPaid = async (id: string) => {
    try {
      await api.patch(
        `/invoices/${id}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchInvoices(); 
    } catch {
      alert("Failed to update invoice");
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3">
        {["all", "pending", "paid", "overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="grid grid-cols-6 px-6 py-4 border-b text-sm font-semibold text-slate-500">
          <span>Client</span>
          <span>Amount</span>
          <span>Total</span>
          <span>Status</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="px-6 py-8 text-slate-500 text-sm">
            No invoices found.
          </div>
        )}

        {filteredInvoices.map((inv) => (
          <div
            key={inv._id}
            className="grid grid-cols-6 px-6 py-4 border-b text-sm items-center"
          >
            {/* Client */}
            <div>
              <p className="font-medium">{inv.clientName}</p>
              <p className="text-xs text-slate-500">
                {inv.clientEmail}
              </p>
            </div>

            {/* Amount */}
            <span>${inv.amount}</span>

            {/* Total */}
            <span>${inv.total}</span>

            {/* Status */}
            <span className={statusBadge(inv.status)}>
              {inv.status}
            </span>

            {/* Issue Date */}
            <span>
              {new Date(inv.issueDate).toLocaleDateString()}
            </span>

            {/* Action */}
            <div>
              {inv.status !== "paid" && (
                <button
                  onClick={() => handleMarkPaid(inv._id)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}