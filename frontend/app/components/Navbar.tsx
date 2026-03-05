"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function Navbar({
  setMobileOpen,
}: {
  setMobileOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const [dark, setDark] = useState(false);

  // Sync state with DOM on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
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

  return (
    <div className="flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden text-xl text-slate-700 dark:text-white"
      >
        ☰
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-slate-700 dark:text-white">
        Dashboard
      </h1>

      {/* Right side actions */}
      <div className="flex items-center gap-4">

        {/* Dark mode toggle */}
        <button
  onClick={toggleDark}
  className="flex items-center justify-center w-9 h-9 rounded-md 
             hover:bg-slate-200 dark:hover:bg-slate-700 
             transition-transform duration-200 hover:scale-110
             text-slate-700 dark:text-yellow-400"
>
  {dark ? <Sun size={18} /> : <Moon size={18} />}
</button>
        {/* Logout button */}
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