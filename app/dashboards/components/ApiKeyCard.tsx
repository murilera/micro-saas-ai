import type { ApiKey } from "../types";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  isVisible: boolean;
  maskedKey: string;
  onToggleVisible: () => void;
  onCopy: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ApiKeyCard({
  apiKey,
  isVisible,
  maskedKey,
  onToggleVisible,
  onCopy,
  onToggleActive,
  onEdit,
  onDelete,
}: ApiKeyCardProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-lg border ${
        apiKey.isActive
          ? "border-zinc-200 dark:border-zinc-800"
          : "border-zinc-300 dark:border-zinc-700 opacity-60"
      } p-6 transition-all`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              {apiKey.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                apiKey.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              }`}
            >
              {apiKey.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {apiKey.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              {apiKey.description}
            </p>
          )}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded font-mono text-zinc-800 dark:text-zinc-200">
              {isVisible ? apiKey.key : maskedKey}
            </code>
            <button
              onClick={onToggleVisible}
              className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title={isVisible ? "Hide key" : "Show key"}
            >
              {isVisible ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>Show</span>
                </>
              )}
            </button>
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Copy to clipboard"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy</span>
            </button>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <div>Created: {new Date(apiKey.createdAt).toLocaleString()}</div>
            {apiKey.lastUsed && (
              <div>Last used: {new Date(apiKey.lastUsed).toLocaleString()}</div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onToggleActive}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              apiKey.isActive
                ? "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            }`}
          >
            {apiKey.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}


