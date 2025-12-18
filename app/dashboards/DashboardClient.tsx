"use client";

import { useEffect, useState } from "react";
import type { ApiKey, Toast } from "./types";
import { ToastStack } from "./components/ToastStack";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { ApiKeyCard } from "./components/ApiKeyCard";
import { Sidebar } from "../components/Sidebar";

interface DashboardClientProps {
  initialKeys: ApiKey[];
}

const MAX_API_KEYS = 10;

export function DashboardClient({ initialKeys }: DashboardClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>(initialKeys);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    key: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hasReachedLimit = apiKeys.length >= MAX_API_KEYS;

  // Keep filteredKeys in sync with search + data
  useEffect(() => {
    setCurrentPage(1);
    if (!searchQuery.trim()) {
      setFilteredKeys(apiKeys);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredKeys(
        apiKeys.filter(
          (key) =>
            key.name.toLowerCase().includes(query) ||
            key.description?.toLowerCase().includes(query) ||
            key.key.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, apiKeys]);

  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / pageSize));
  const paginatedKeys = filteredKeys.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const generateApiKey = () => {
    const prefix = "api_";
    const randomPart1 = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    const randomPart3 = Math.random().toString(36).substring(2, 15);
    return `${prefix}${randomPart1}${randomPart2}${randomPart3}`;
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "•".repeat(key.length);
    return `${key.substring(0, 7)}${"•".repeat(key.length - 11)}${key.substring(
      key.length - 4
    )}`;
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleOpenModal = (key?: ApiKey) => {
    // Prevent creating new keys if limit is reached
    if (!key && hasReachedLimit) {
      showToast(
        `You have reached the maximum limit of ${MAX_API_KEYS} API keys. Please delete an existing key before creating a new one.`,
        "error"
      );
      return;
    }

    if (key) {
      setEditingKey(key);
      setFormData({
        name: key.name,
        description: key.description || "",
        key: key.key,
      });
    } else {
      setEditingKey(null);
      setFormData({ name: "", description: "", key: generateApiKey() });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    setFormData({ name: "", description: "", key: "" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const upsert = async () => {
      try {
        if (editingKey) {
          // Update existing key
          const res = await fetch(`/api/api-keys/${editingKey.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              key: formData.key,
            }),
          });
          if (!res.ok) throw new Error("Failed to update API key");
          const updated: ApiKey = await res.json();
          setApiKeys((prev) =>
            prev.map((k) => (k.id === updated.id ? updated : k))
          );
          showToast("API key updated successfully", "success");
        } else {
          // Create new key
          const res = await fetch("/api/api-keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              key: formData.key,
              isActive: true,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to create API key");
          }
          const created: ApiKey = await res.json();
          setApiKeys((prev) => [created, ...prev]);
          showToast("API key created successfully", "success");
        }

        handleCloseModal();
      } catch (err) {
        // Show the specific error message from the API
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong saving the API key";
        showToast(errorMessage, "error");
      }
    };

    void upsert();
  };

  const handleDelete = (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    const remove = async () => {
      try {
        const res = await fetch(`/api/api-keys/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete API key");
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        showToast("API key deleted successfully", "success");
      } catch {
        // Error details are handled by the API, just show user-friendly message
        showToast("Failed to delete API key", "error");
      }
    };

    void remove();
  };

  const handleToggleActive = (id: string) => {
    const toggle = async () => {
      const key = apiKeys.find((k) => k.id === id);
      if (!key) return;

      const nextActive = !key.isActive;

      try {
        const res = await fetch(`/api/api-keys/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextActive }),
        });
        if (!res.ok) throw new Error("Failed to update key status");
        const updated: ApiKey = await res.json();
        setApiKeys((prev) =>
          prev.map((k) => (k.id === updated.id ? updated : k))
        );
        showToast(
          `API key ${nextActive ? "activated" : "deactivated"}`,
          "info"
        );
      } catch {
        // Error details are handled by the API, just show user-friendly message
        showToast("Failed to update key status", "error");
      }
    };

    void toggle();
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast("API key copied to clipboard", "success");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ToastStack toasts={toasts} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
                API Keys Management
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Create, manage, and monitor your API keys
                {hasReachedLimit && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                    (Limit reached: {apiKeys.length}/{MAX_API_KEYS})
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {hasReachedLimit && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Maximum of {MAX_API_KEYS} API keys reached
                </p>
              )}
              <button
                onClick={() => handleOpenModal()}
                disabled={hasReachedLimit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                title={
                  hasReachedLimit
                    ? `You have reached the maximum limit of ${MAX_API_KEYS} API keys. Please delete an existing key before creating a new one.`
                    : undefined
                }
              >
                + Create API Key
              </button>
            </div>
          </div>
        </div>

        {/* Search, Stats & Page Size */}
        {apiKeys.length > 0 && (
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search API keys by name, description, or key..."
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-zinc-600 dark:text-zinc-400 gap-2">
              <div>
                Showing{" "}
                <span className="font-medium">
                  {filteredKeys.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredKeys.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredKeys.length}</span>{" "}
                result{filteredKeys.length !== 1 ? "s" : ""}
              </div>
              <div>
                Total:{" "}
                <span className="font-medium">
                  {apiKeys.length} API key
                  {apiKeys.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4 text-6xl">🔑</div>
              <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                No API keys yet
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Create your first API key to start accessing your services
                securely.
              </p>
              <button
                onClick={() => handleOpenModal()}
                disabled={hasReachedLimit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                title={
                  hasReachedLimit
                    ? `You have reached the maximum limit of ${MAX_API_KEYS} API keys. Please delete an existing key before creating a new one.`
                    : undefined
                }
              >
                Create Your First API Key
              </button>
            </div>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              No API keys found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedKeys.map((apiKey) => (
              <ApiKeyCard
                key={apiKey.id}
                apiKey={apiKey}
                isVisible={visibleKeys.has(apiKey.id)}
                maskedKey={maskApiKey(apiKey.key)}
                onToggleVisible={() => toggleKeyVisibility(apiKey.id)}
                onCopy={() => handleCopyKey(apiKey.key)}
                onToggleActive={() => handleToggleActive(apiKey.id)}
                onEdit={() => handleOpenModal(apiKey)}
                onDelete={() => handleDelete(apiKey.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {filteredKeys.length > pageSize && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded border text-sm ${
                        page === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
            <div>
              Page{" "}
              <span className="font-medium">
                {currentPage} / {totalPages}
              </span>
            </div>
          </div>
        )}

        <ApiKeyModal
          isOpen={isModalOpen}
          editingKey={editingKey}
          formData={formData}
          onChange={setFormData}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onRegenerate={() =>
            setFormData((prev) => ({ ...prev, key: generateApiKey() }))
          }
        />
      </div>
    </div>
  );
}


