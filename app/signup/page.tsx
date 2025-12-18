import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignupForm } from "../components/SignupForm";

export default async function SignupPage() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session");

  // If user is logged in, redirect to dashboard immediately
  if (userSession) {
    redirect("/dashboards");
  }

  // If not logged in, show signup form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 font-sans dark:from-black dark:to-zinc-900">
      <SignupForm />
    </div>
  );
}


