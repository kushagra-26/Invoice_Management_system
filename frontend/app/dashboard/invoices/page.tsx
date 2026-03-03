"use client";

import { useState } from "react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([
    { id: 1, client: "Acme Inc", amount: 1200 },
  ]);

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Invoices
      </h2>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
          >
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {inv.client}
            </p>
            <p className="text-slate-800 dark:text-white font-semibold">
              ${inv.amount}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}