"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Trash2,
  X,
} from "lucide-react";

type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

const defaultItem = (): InvoiceItem => ({ description: "", quantity: 1, price: 0 });

const defaultForm = () => ({
  clientName: "",
  clientEmail: "",
  issueDate: "",
  dueDate: "",
  tax: "",
  notes: "",
});

const statusConfig: Record<string, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  paid: {
    label: "Paid",
    classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: AlertTriangle,
  },
};

export default function Invoices() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm());
  const [items, setItems] = useState<InvoiceItem[]>([defaultItem()]);

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
    if (!token) { router.push("/login"); return; }
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices
    .filter((inv) =>
      (inv.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.invoiceNumber || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter((inv) =>
      filter === "all" ? true : (inv.status || "").toLowerCase() === filter.toLowerCase()
    );

  const totalPages = Math.ceil(filteredInvoices.length / perPage);
  const paginatedInvoices = filteredInvoices.slice((page - 1) * perPage, page * perPage);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxPercent = Number(form.tax) || 0;
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        tax: Number(form.tax) || 0,
        discount: 0,
        notes: form.notes,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 0,
          price: Number(it.price) || 0,
        })),
      };

      await api.post("/invoices", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setForm(defaultForm());
      setItems([defaultItem()]);
      fetchInvoices();
    } catch {
      alert("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoice: any) => {
    setPayingId(invoice._id);
    try {
      const order = await api.post("/payments/create-order", { invoiceId: invoice._id });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.data.amount,
        currency: order.data.currency,
        name: "Invoice SaaS",
        description: `Payment for ${invoice.invoiceNumber}`,
        order_id: order.data.id,
        handler: async function () {
          await api.patch(`/invoices/${invoice._id}/pay`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchInvoices();
          alert("Payment successful! Invoice marked as paid.");
        },
        theme: { color: "#4f46e5" },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPayingId(null);
    }
  };

  const filterCounts = {
    all: invoices.length,
    pending: invoices.filter((i) => i.status === "pending").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Invoices
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and track all your invoices
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by client or invoice #"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "paid", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-indigo-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`ml-1.5 text-[10px] font-bold ${filter === f ? "text-indigo-200" : "text-slate-400"}`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_110px_120px_100px_120px] px-6 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          {["Client", "Invoice #", "Total", "Status", "Due Date", "Action"].map((h) => (
            <span key={h} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {h}
            </span>
          ))}
        </div>

        {paginatedInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
            <Clock size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No invoices found</p>
            <p className="text-xs mt-1">Try a different filter or create a new invoice</p>
          </div>
        ) : (
          paginatedInvoices.map((inv) => {
            const s = statusConfig[inv.status] ?? statusConfig.pending;
            const Icon = s.icon;
            return (
              <div
                key={inv._id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_110px_120px_100px_120px] px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 last:border-0 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="mb-1 sm:mb-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {inv.clientName}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {inv.clientEmail}
                  </p>
                </div>

                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 sm:mb-0">
                  {inv.invoiceNumber}
                </span>

                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 sm:mb-0">
                  ₹{Number(inv.total).toLocaleString("en-IN")}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit mb-1 sm:mb-0 ${s.classes}`}>
                  <Icon size={11} />
                  {s.label}
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 sm:mb-0">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </span>

                <div>
                  {inv.status !== "paid" && (
                    <button
                      onClick={() => handlePay(inv)}
                      disabled={payingId === inv._id}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <CreditCard size={13} />
                      {payingId === inv._id ? "Processing…" : "Pay Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                page === i + 1
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-indigo-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Invoice</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Client Info */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Client Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Client Name</label>
                    <input
                      placeholder="Acme Corp"
                      className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      value={form.clientName}
                      onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Client Email</label>
                    <input
                      placeholder="client@example.com"
                      type="email"
                      className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      value={form.clientEmail}
                      onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Dates
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Issue Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      value={form.issueDate}
                      onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      value={form.dueDate}
                      onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Line Items
                </p>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_80px_90px_32px] gap-2 items-start">
                      <div>
                        {index === 0 && <label className="text-[11px] text-slate-400 mb-1 block">Description</label>}
                        <input
                          placeholder="Service or product"
                          className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[index].description = e.target.value;
                            setItems(updated);
                          }}
                        />
                      </div>
                      <div>
                        {index === 0 && <label className="text-[11px] text-slate-400 mb-1 block">Qty</label>}
                        <input
                          type="number"
                          min="1"
                          className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[index].quantity = Math.max(1, Number(e.target.value));
                            setItems(updated);
                          }}
                        />
                      </div>
                      <div>
                        {index === 0 && <label className="text-[11px] text-slate-400 mb-1 block">Price (₹)</label>}
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[index].price = Math.max(0, Number(e.target.value));
                            setItems(updated);
                          }}
                        />
                      </div>
                      <div className={index === 0 ? "mt-5" : ""}>
                        {items.length > 1 && (
                          <button
                            onClick={() => setItems(items.filter((_, i) => i !== index))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setItems((prev) => [...prev, defaultItem()])}
                  className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add another item
                </button>
              </div>

              {/* Tax */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 18 for GST"
                  className="w-full sm:w-40 border border-slate-200 dark:border-slate-600 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  value={form.tax}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tax: Math.max(0, Number(e.target.value)).toString() }))
                  }
                />
              </div>

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Summary
                </p>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Tax ({taxPercent}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-slate-800 dark:text-white border-t border-slate-200 dark:border-slate-600 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Notes (optional)</label>
                <textarea
                  placeholder="Any additional notes for the client..."
                  rows={2}
                  className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <button
                onClick={() => { setShowModal(false); setForm(defaultForm()); setItems([defaultItem()]); }}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {loading ? "Creating…" : "Create Invoice"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
