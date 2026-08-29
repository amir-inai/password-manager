import React, { useState } from "react";
import {
  generatorApi,
  GenerateRequest,
  GenerateResponse,
} from "../services/api";

interface PasswordGeneratorProps {
  onClose: () => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onClose }) => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = async () => {
    setLoading(true);
    setError(null);

    try {
      const request: GenerateRequest = {
        length,
        include_uppercase: includeUppercase,
        include_lowercase: includeLowercase,
        include_numbers: includeNumbers,
        include_symbols: includeSymbols,
      };

      const response: GenerateResponse = await generatorApi.generate(request);
      setGeneratedPassword(response.password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate password");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Password Generator</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        <div className="generator-content">
          {error && <div className="error-message">{error}</div>}

          <div className="generator-options">
            <div className="option-group">
              <label htmlFor="length">Length: {length}</label>
              <input
                type="range"
                id="length"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                />
                Uppercase (A-Z)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                />
                Lowercase (a-z)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                />
                Numbers (0-9)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                />
                Symbols (!@#$%...)
              </label>
            </div>

            <button
              onClick={generatePassword}
              disabled={loading}
              className="generate-btn"
            >
              {loading ? "Generating..." : "Generate Password"}
            </button>
          </div>

          {generatedPassword && (
            <div className="generated-password">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className="password-display"
              />
              <button onClick={copyToClipboard} className="copy-btn">
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
