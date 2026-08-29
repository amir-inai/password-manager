import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authApi, UnlockResponse } from "../services/api";

interface AuthContextType {
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: UnlockResponse = await authApi.unlock({ password });
      if (response.success) {
        setIsUnlocked(true);
        return true;
      }
      setError(response.message || "Failed to unlock");
      return false;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to unlock vault";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const lock = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.lock();
      setIsUnlocked(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to lock vault");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isUnlocked, isLoading, error, unlock, lock }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
