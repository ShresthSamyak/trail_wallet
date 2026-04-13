import { useState } from 'react';

/**
 * SeedPhrase — Displays the BIP39 mnemonic as a numbered word grid.
 *
 * SECURITY WARNING: In production, a seed phrase must NEVER be rendered
 * in plaintext in the DOM. Any XSS vulnerability could expose it. This
 * component exists purely for educational / demo purposes.
 */
export default function SeedPhrase({ mnemonic, onGenerate }) {
  const [copied, setCopied] = useState(false);
  const words = mnemonic ? mnemonic.split(' ') : [];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently, full phrase is visible in DOM
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon seed-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">Secret Recovery Phrase</h2>
            <p className="card-subtitle">12 words · BIP39 standard</p>
          </div>
        </div>

        <div className="card-actions">
          {/* Copy button only shown when phrase exists */}
          {mnemonic && (
            <button
              className={`btn btn-ghost btn-sm ${copied ? 'btn-success' : ''}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}

          <button className="btn btn-primary btn-sm" onClick={onGenerate}>
            {mnemonic ? 'Regenerate' : 'Generate Phrase'}
          </button>
        </div>
      </div>

      {mnemonic ? (
        <>
          {/* SECURITY: Warn users before showing plaintext phrase */}
          <div className="alert alert-warning">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Never share your seed phrase. Anyone with these 12 words has full access to your wallets.</span>
          </div>

          <div className="mnemonic-grid">
            {words.map((word, i) => (
              <div key={i} className="word-chip">
                <span className="word-index">{i + 1}</span>
                <span className="word-text">{word}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="empty-title">No seed phrase yet</p>
          <p className="empty-text">Generate a phrase to begin deriving wallets</p>
        </div>
      )}
    </div>
  );
}