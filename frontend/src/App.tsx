import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MasterPassword from "./components/MasterPassword";
import PasswordList from "./components/PasswordList";
import PasswordForm from "./components/PasswordForm";
import "./App.css";

const AppContent: React.FC = () => {
  const { isUnlocked, isLoading, error, unlock, lock } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<any>(null);

  if (!isUnlocked) {
    return (
      <MasterPassword onUnlock={unlock} isLoading={isLoading} error={error} />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Password Manager</h1>
        <button onClick={lock} className="lock-btn">
          Lock Vault
        </button>
      </header>

      <main className="app-main">
        <div className="actions">
          <button
            onClick={() => {
              setEditingPassword(null);
              setShowForm(true);
            }}
            className="add-btn"
          >
            + Add Password
          </button>
        </div>

        <PasswordList
          key={showForm ? "form-open" : "form-closed"}
          onEdit={(password: any) => {
            setEditingPassword(password);
            setShowForm(true);
          }}
        />
      </main>

      {showForm && (
        <PasswordForm
          password={editingPassword}
          onClose={() => {
            setShowForm(false);
            setEditingPassword(null);
          }}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
