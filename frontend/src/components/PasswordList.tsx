import React, { useState, useEffect } from "react";
import {
  passwordsApi,
  PasswordEntry,
  PasswordWithSecret,
} from "../services/api";
import QRCodeModal from "./QRCodeModal";

interface PasswordListProps {
  onEdit: (password: PasswordEntry) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({ onEdit }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  const safePasswords = passwords || [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [qrCodePassword, setQrCodePassword] = useState<PasswordEntry | null>(
    null
  );
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: string;
  }>({});
  const [loadingPasswordId, setLoadingPasswordId] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    try {
      const data = await passwordsApi.list();
      setPasswords(data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load passwords");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this password?")) {
      return;
    }

    try {
      await passwordsApi.delete(id);
      setPasswords(passwords.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete password");
    }
  };

  const togglePasswordVisibility = async (id: number) => {
    // If already visible, hide it
    if (visiblePasswords[id]) {
      const newVisible = { ...visiblePasswords };
      delete newVisible[id];
      setVisiblePasswords(newVisible);
      return;
    }

    // Otherwise, fetch the password
    setLoadingPasswordId(id);
    try {
      const data: PasswordWithSecret = await passwordsApi.get(id);
      setVisiblePasswords({ ...visiblePasswords, [id]: data.password });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch password");
    } finally {
      setLoadingPasswordId(null);
    }
  };

  const filteredPasswords = safePasswords.filter(
    (password) =>
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading passwords...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="password-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredPasswords.length === 0 ? (
        <div className="empty-state">
          <p>No passwords found. Add your first password to get started.</p>
        </div>
      ) : (
        <div className="password-grid">
          {filteredPasswords.map((password) => (
            <div key={password.id} className="password-card">
              <div className="password-header">
                <h3>{password.title}</h3>
                <span className="category">
                  {password.category || "Uncategorized"}
                </span>
              </div>
              <div className="password-body">
                <p>
                  <strong>Username:</strong> {password.username}
                </p>
                <p>
                  <strong>Password:</strong>{" "}
                  {loadingPasswordId === password.id
                    ? "Loading..."
                    : visiblePasswords[password.id]
                    ? visiblePasswords[password.id]
                    : "••••••••"}
                  <button
                    onClick={() => togglePasswordVisibility(password.id)}
                    className="show-password-btn"
                    disabled={loadingPasswordId === password.id}
                  >
                    {visiblePasswords[password.id] ? "Hide" : "Show"}
                  </button>
                </p>
                {password.url && (
                  <p>
                    <strong>URL:</strong> {password.url}
                  </p>
                )}
                {password.notes && (
                  <p>
                    <strong>Notes:</strong> {password.notes}
                  </p>
                )}
              </div>
              <div className="password-actions">
                <button
                  onClick={() => setQrCodePassword(password)}
                  className="qrcode-btn"
                >
                  QR
                </button>
                <button onClick={() => onEdit(password)} className="edit-btn">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(password.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {qrCodePassword && (
        <QRCodeModal
          password={qrCodePassword}
          onClose={() => setQrCodePassword(null)}
        />
      )}
    </div>
  );
};

export default PasswordList;
