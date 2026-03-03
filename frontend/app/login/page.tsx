"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 space-y-6 border border-slate-200 dark:border-slate-700">

        {/* Accent line */}
        <div className="h-1 w-16 mx-auto bg-indigo-600 rounded-full" />

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white text-center">
          Welcome Back
        </h1>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 -mt-2">
          Sign in to your account
        </p>

        <div className="space-y-4">
          <input
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200"
          >
            Login
          </button>
        </div>

        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}