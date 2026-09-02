import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface PasswordEntry {
  id: number;
  title: string;
  username: string;
  password?: string;
  url: string;
  notes: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface UnlockRequest {
  password: string;
}

export interface UnlockResponse {
  success: boolean;
  message: string;
}

export interface PasswordRequest {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
}

export interface GenerateRequest {
  length?: number;
  include_uppercase?: boolean;
  include_lowercase?: boolean;
  include_numbers?: boolean;
  include_symbols?: boolean;
}

export interface GenerateResponse {
  password: string;
}

// Auth API
export const authApi = {
  unlock: (data: UnlockRequest): Promise<UnlockResponse> =>
    api.post("/unlock", data).then((res) => res.data),

  lock: (): Promise<{ success: boolean; message: string }> =>
    api.post("/lock").then((res) => res.data),
};

// Passwords API
export const passwordsApi = {
  list: (): Promise<PasswordEntry[]> =>
    api.get("/passwords").then((res) => res.data),

  get: (id: number): Promise<PasswordEntry> =>
    api.get(`/passwords/${id}`).then((res) => res.data),

  create: (data: PasswordRequest): Promise<PasswordEntry> =>
    api.post("/passwords", data).then((res) => res.data),

  update: (id: number, data: PasswordRequest): Promise<PasswordEntry> =>
    api.put(`/passwords/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<{ success: boolean; message: string }> =>
    api.delete(`/passwords/${id}`).then((res) => res.data),
};

// Generator API
export const generatorApi = {
  generate: (data: GenerateRequest): Promise<GenerateResponse> =>
    api.post("/generate", data).then((res) => res.data),
};
