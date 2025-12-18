"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "../components/Sidebar";

export function PlaygroundClient() {
  const [apiKey, setApiKey] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: null });
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      showToast("Please enter an API key.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey.trim() }),
      });

      if (res.ok) {
        showToast("API key is valid. Redirecting...", "success");
        setTimeout(() => {
          router.push("/protected");
        }, 600);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(
          data.error ?? "Invalid API key. Please check and try again.",
          "error"
        );
      }
    } catch (error) {
      // Error details are handled by the API, just show user-friendly message
      showToast("Something went wrong validating the API key.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a toast if redirected here due to unauthorized access
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      showToast("You must provide a valid API key to access that page.", "error");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast.type && (
          <div
            className={`fixed top-4 right-4 z-40 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            API Playground
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Experiment with your API keys and endpoints.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-xl space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter an API key to validate"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting ? "Validating..." : "Validate API Key"}
          </button>
        </form>
      </main>
    </div>
  );
}

