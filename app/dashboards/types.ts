export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}


