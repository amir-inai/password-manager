import React, { useState } from "react";

interface MasterPasswordProps {
  onUnlock: (password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const MasterPassword: React.FC<MasterPasswordProps> = ({
  onUnlock,
  isLoading,
  error,
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onUnlock(password);
    }
  };

  return (
    <div className="master-password-container">
      <div className="master-password-card">
        <div className="logo">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1>Password Manager</h1>
        <p className="subtitle">Enter your master password to unlock</p>

        <form onSubmit={handleSubmit} className="unlock-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master Password"
            className="password-input"
            autoFocus
            disabled={isLoading}
          />
          <button
            type="submit"
            className="unlock-btn"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? "Unlocking..." : "Unlock Vault"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default MasterPassword;
