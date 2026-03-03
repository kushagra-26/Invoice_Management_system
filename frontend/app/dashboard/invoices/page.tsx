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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Multi-item state
 const [items, setItems] = useState<InvoiceItem[]>([
  { description: "", quantity: 1, price: 0 },
]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};
 const updateItem = <K extends keyof InvoiceItem>(
  index: number,
  field: K,
  value: InvoiceItem[K]
) => {
  const updated = [...items];
  updated[index][field] = value;
  setItems(updated);
};

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    issueDate: "",
    dueDate: "",
    tax: "",
    notes: "",
  });

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

  // Filtering logic
  const filteredInvoices = invoices
    .filter(inv =>
      (inv.clientName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(inv =>
      filter === "all"
        ? true
        : (inv.status || "").toLowerCase() === filter.toLowerCase()
    );

  const totalPages = Math.ceil(filteredInvoices.length / perPage);
  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const statusBadge = (status: string) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";

    if (status === "paid")
      return `${base} bg-green-100 text-green-700`;

    if (status === "overdue")
      return `${base} bg-red-100 text-red-700`;

    return `${base} bg-yellow-100 text-yellow-700`;
  };

  const handleCreate = async () => {
    setLoading(true);

    try {
      await api.post(
        "/invoices",
        {
          ...form,
          tax: Number(form.tax),
          discount: 0,
          items,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowModal(false);
      setForm({
        clientName: "",
        clientEmail: "",
        issueDate: "",
        dueDate: "",
        tax: "",
        notes: "",
      });
      setItems([{ description: "", quantity: 1, price: 0 }]);

      fetchInvoices();
    } catch {
      alert("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    await api.patch(
      `/invoices/${id}/pay`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchInvoices();
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + New Invoice
        </button>
      </div>

      {/* Search */}
      <input
        placeholder="Search by client name..."
        className="border px-3 py-2 rounded-lg"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filter */}
      <div className="flex gap-3">
        {["all", "pending", "paid", "overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-slate-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="grid grid-cols-5 px-6 py-4 border-b text-sm font-semibold text-slate-500">
          <span>Client</span>
          <span>Total</span>
          <span>Status</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        {paginatedInvoices.map((inv) => (
          <div
            key={inv._id}
            className="grid grid-cols-5 px-6 py-4 border-b text-sm items-center"
          >
            <div>
              <p className="font-medium">{inv.clientName}</p>
              <p className="text-xs text-slate-500">
                {inv.clientEmail}
              </p>
            </div>

            <span>${inv.total}</span>

            <span className={statusBadge(inv.status)}>
              {inv.status}
            </span>

            <span>
              {inv.issueDate
                ? new Date(inv.issueDate).toLocaleDateString()
                : "-"}
            </span>

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

      {/* Pagination */}
      <div className="flex gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1
                ? "bg-indigo-600 text-white"
                : "bg-slate-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-[600px] space-y-4 max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg font-semibold">
              Create Invoice
            </h3>

            <input
              placeholder="Client Name"
              className="w-full border p-2 rounded"
              value={form.clientName}
              onChange={(e) =>
                setForm({ ...form, clientName: e.target.value })
              }
            />

            <input
              placeholder="Client Email"
              className="w-full border p-2 rounded"
              value={form.clientEmail}
              onChange={(e) =>
                setForm({ ...form, clientEmail: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="border p-2 rounded"
                value={form.issueDate}
                onChange={(e) =>
                  setForm({ ...form, issueDate: e.target.value })
                }
              />

              <input
                type="date"
                className="border p-2 rounded"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
              />
            </div>

            <h4 className="font-medium mt-4">Items</h4>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-3">
                <input
                  placeholder="Description"
                  className="border p-2 rounded"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Qty"
                  className="border p-2 rounded"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  placeholder="Price"
                  className="border p-2 rounded"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, "price", Number(e.target.value))
                  }
                />
              </div>
            ))}

            <button
              onClick={addItem}
              className="text-indigo-600 text-sm"
            >
              + Add Item
            </button>

            <input
              type="number"
              placeholder="Tax %"
              className="w-full border p-2 rounded"
              value={form.tax}
              onChange={(e) =>
                setForm({ ...form, tax: e.target.value })
              }
            />

            <textarea
              placeholder="Notes"
              className="w-full border p-2 rounded"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}