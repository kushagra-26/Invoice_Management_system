"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sun, Moon, LogOut, Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/invoices": "Invoices",
  "/dashboard/customers": "Customers",
  "/dashboard/settings": "Settings",
};

export default function Navbar({
  setMobileOpen,
}: {
  setMobileOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const name: string = payload.username || payload.email || "U";
        setInitials(name.slice(0, 2).toUpperCase());
      } catch {}
    }
  }, []);

  const toggleDark = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <header className="flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/60 px-5 py-3 sticky top-0 z-30 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-yellow-400"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium transition"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>

        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}
