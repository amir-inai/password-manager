import React, { useState, useEffect } from "react";
import { passwordsApi, PasswordEntry } from "../services/api";

interface PasswordListProps {
  onEdit: (password: PasswordEntry) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({ onEdit }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredPasswords = passwords.filter(
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
    </div>
  );
};

export default PasswordList;
