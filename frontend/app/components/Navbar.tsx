"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar({
  setMobileOpen,
}: {
  setMobileOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const [dark, setDark] = useState(false);

  // Sync state with actual DOM class on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
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

  return (
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">

      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden text-xl text-slate-700 dark:text-white"
      >
        ☰
      </button>

      <h1 className="text-lg font-semibold text-slate-700 dark:text-white">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">

        <button
          onClick={toggleDark}
          className="text-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Toggle dark mode"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Logout
        </button>

      </div>
    </div>
  );
}