import { Suspense } from "react";
import { PlaygroundClient } from "./PlaygroundClient";

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    }>
      <PlaygroundClient />
    </Suspense>
  );
}


