import React, { useState, useEffect } from "react";
import { passwordsApi, PasswordEntry } from "../services/api";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [qrCodePassword, setQrCodePassword] = useState<PasswordEntry | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Get unique categories from passwords
  const categories = Array.from(
    new Set(safePasswords.map((p) => p.category).filter(Boolean))
  ) as string[];

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

  const handleEdit = async (password: PasswordEntry) => {
    try {
      const fullPassword = await passwordsApi.get(password.id);
      onEdit(fullPassword);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load password details");
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

  const handleCopyPassword = async (password: PasswordEntry) => {
    try {
      const fullPassword = await passwordsApi.get(password.id);
      await navigator.clipboard.writeText(fullPassword.password || "");
      setCopiedId(password.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err: any) {
      setError("Failed to copy password");
    }
  };

  const filteredPasswords = safePasswords.filter((password) => {
    const matchesSearch =
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || password.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading">Loading passwords...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="password-list">
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
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
                {password.url && (
                  <p>
                    <strong>URL:</strong> {password.url}
                  </p>
                )}
              </div>
              <div className="password-actions">
                <button
                  onClick={() => handleCopyPassword(password)}
                  className="copy-btn"
                >
                  {copiedId === password.id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setQrCodePassword(password)}
                  className="qrcode-btn"
                >
                  QR
                </button>
                <button
                  onClick={() => handleEdit(password)}
                  className="edit-btn"
                >
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
