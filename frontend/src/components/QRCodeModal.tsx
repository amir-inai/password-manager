import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PasswordEntry } from "../services/api";

interface QRCodeModalProps {
  password: PasswordEntry;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ password, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Simple URL for QR code - when scanned, opens in browser
  const qrUrl = password.url || "";

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>QR Code for {password.title}</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        <div className="qrcode-content">
          {qrUrl ? (
            <>
              <div className="qrcode-display">
                <QRCodeSVG
                  value={qrUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="qrcode-info">
                <p className="qrcode-success">
                  ✅ Scan this QR code to open <strong>{password.title}</strong>{" "}
                  in your browser.
                </p>

                <div className="qrcode-details">
                  <p>
                    <strong>Title:</strong> {password.title}
                  </p>
                  <p>
                    <strong>URL:</strong>{" "}
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                      {qrUrl}
                    </a>
                  </p>
                  <p>
                    <strong>Username:</strong>{" "}
                    {showPassword ? password.username : "••••••••"}
                  </p>
                  <p>
                    <strong>Password:</strong> {"••••••••"}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-password-btn"
                      style={{ marginLeft: "8px", padding: "4px 8px" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="qrcode-info">
              <p className="qrcode-warning">
                ⚠️ No URL is set for this password entry. Please add a URL
                first.
              </p>
            </div>
          )}

          <div className="form-actions">
            <button onClick={onClose} className="cancel-btn">
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .qrcode-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .qrcode-display {
          display: flex;
          justify-content: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .qrcode-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .qrcode-success {
          background: #d4edda;
          color: #155724;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .qrcode-warning {
          background: #fff3cd;
          color: #856404;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .qrcode-details {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
        }

        .qrcode-details p {
          margin: 0.5rem 0;
          color: #333;
        }

        .qrcode-details a {
          color: #667eea;
          text-decoration: none;
        }

        .qrcode-details a:hover {
          text-decoration: underline;
        }

        .toggle-password-btn {
          background: #e9ecef;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .toggle-password-btn:hover {
          background: #d0d0d0;
        }
      `}</style>
    </div>
  );
};

export default QRCodeModal;
