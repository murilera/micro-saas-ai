export default function DashboardsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
          <div className="h-4 w-80 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Loading your API keys...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


