import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PasswordEntry } from "../services/api";

interface QRCodeModalProps {
  password: PasswordEntry;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ password, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Generate deep link URI for companion app
  // Format: passwordmanager://login?url=<url>&title=<title>&username=<username>
  // Note: Password is NOT included in QR for security reasons
  // The companion app would need to authenticate to access the full credentials
  const deepLinkUri = `passwordmanager://login?url=${encodeURIComponent(
    password.url || ""
  )}&title=${encodeURIComponent(password.title)}&username=${encodeURIComponent(
    password.username
  )}`;

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
          <div className="qrcode-display">
            <QRCodeSVG
              value={deepLinkUri}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="qrcode-info">
            <p className="qrcode-warning">
              ⚠️ Scan this QR code with your companion mobile app to quickly
              access credentials.
            </p>

            <div className="qrcode-details">
              <p>
                <strong>Title:</strong> {password.title}
              </p>
              <p>
                <strong>URL:</strong> {password.url || "(not set)"}
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

            <div className="qrcode-uri-info">
              <small>
                The QR code contains a deep link URI for:{" "}
                <code>passwordmanager://</code> protocol. You need a companion
                mobile app that handles this URI scheme.
              </small>
            </div>
          </div>

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

        .qrcode-uri-info {
          color: #666;
          font-size: 0.85rem;
          text-align: center;
        }

        .qrcode-uri-info code {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
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
