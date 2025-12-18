import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./components/LoginForm";

export default async function Home() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session");

  // If user is logged in, redirect to dashboard immediately
  if (userSession) {
    redirect("/dashboards");
  }

  // If not logged in, show login form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 font-sans dark:from-black dark:to-zinc-900">
      <LoginForm />
    </div>
  );
}
