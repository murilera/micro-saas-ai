"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: null });
    }, 3000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast("Username and password are required.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Invalid username or password.", "error");
        return;
      }

      showToast("Logged in successfully. Redirecting...", "success");
      setTimeout(() => {
        router.push("/dashboards");
      }, 600);
    } catch {
      showToast("Something went wrong while logging in.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast.type && (
        <div
          className={`fixed top-4 right-4 z-40 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
      <main className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 rounded-2xl bg-white p-10 shadow-xl dark:bg-zinc-950 md:grid-cols-2 md:p-12">
        <section className="space-y-5">
          <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            API Management SaaS
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Manage API keys and protected APIs for your product.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Log in to access your API keys dashboard, experiment in the API
            playground, and secure access to your protected resources. New
            here? Create an account in seconds.
          </p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• Centralized API key management</li>
            <li>• Built-in API playground and protected routes</li>
            <li>• Supabase-backed storage, ready for real users</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Log in
          </h2>
          <p className="mb-6 text-xs text-zinc-600 dark:text-zinc-400">
            Use your account credentials to access the dashboard.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500/0 transition focus:border-blue-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500/0 transition focus:border-blue-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSubmitting ? "Please wait..." : "Log in"}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <span className="mr-1">Don&apos;t have an account?</span>
            <Link
              href="/signup"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              Create a new user
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

