"use client";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: Props) {
  const pathname = usePathname();

 const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-40"
        />
      )}

      <aside
        className={`
          fixed md:static z-50
          h-full
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "left-0" : "-left-64"}
          md:left-0
          bg-white dark:bg-slate-800
          border-r border-slate-200 dark:border-slate-700
          flex flex-col
        `}
      >
        {/* Top Section */}
        <div className="flex items-center justify-between p-4">

          {!collapsed && (
            <h2 className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
              Invoice SaaS
            </h2>
          )}

         <button
  onClick={() => setCollapsed(!collapsed)}
  className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-transform duration-200 hover:scale-110"
>
  {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
</button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2 px-2">
  {navItems.map((item) => {
    const active = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`
          flex items-center
          ${collapsed ? "justify-center" : "gap-3"}
          px-4 py-3 rounded-lg text-sm font-medium
          transition-all duration-200
          ${
            active
              ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }
        `}
      >
        <Icon size={20} className="min-w-[20px]" />

        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  })}
</nav>
      </aside>
    </>
  );
}