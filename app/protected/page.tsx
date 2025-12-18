import { Sidebar } from "../components/Sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("api_key_session");

  if (!session || session.value !== "valid") {
    redirect("/playground?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Protected Area
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You have accessed a protected page using a valid API key.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
          This is where you can expose protected resources or tools that require
          a valid API key. Authentication will be wired here later.
        </div>
      </main>
    </div>
  );
}



