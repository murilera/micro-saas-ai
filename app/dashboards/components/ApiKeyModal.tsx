import type { ApiKey } from "../types";

type FormState = { name: string; description: string; key: string };

interface ApiKeyModalProps {
  isOpen: boolean;
  editingKey: ApiKey | null;
  formData: FormState;
  onChange: (data: FormState) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onRegenerate: () => void;
}

export function ApiKeyModal({
  isOpen,
  editingKey,
  formData,
  onChange,
  onClose,
  onSubmit,
  onRegenerate,
}: ApiKeyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg max-w-lg w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
            {editingKey ? "Edit API Key" : "Create New API Key"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Production API Key"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                onChange({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description for this API key"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              API Key <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.key}
                onChange={(e) =>
                  onChange({ ...formData, key: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
              {!editingKey && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors whitespace-nowrap"
                >
                  🔄 Regenerate
                </button>
              )}
            </div>
            {!editingKey && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                A secure API key has been generated. Make sure to copy it before
                closing this dialog.
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              {editingKey ? "Update API Key" : "Create API Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


