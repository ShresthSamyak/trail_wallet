import { useState } from 'react';

/**
 * WalletCard — Pure presentational component for a single derived wallet.
 *
 * Receives the entire wallet object from parent state — no fetching here.
 * Balance lifecycle (loading / error / value) is managed by the parent section.
 *
 * @param {{ id, chain, index, address, balance, loading, error, derivationPath }} wallet
 */
export default function WalletCard({ wallet }) {
  const [copied, setCopied] = useState(false);
  const { address, balance, loading, error, chain, index, derivationPath } = wallet;

  const isSol = chain === 'sol';
  const chainLabel = isSol ? 'SOL' : 'ETH';
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g., non-secure context) — fail silently
    }
  }

  return (
    <div className={`wallet-card wallet-card-${chain}`}>
      {/* Colored top accent stripe */}
      <div className="wallet-card-stripe" />

      <div className="wallet-card-body">
        {/* Header: wallet number + chain badge */}
        <div className="wallet-card-header">
          <span className="wallet-index">Wallet {index + 1}</span>
          <span className={`chain-badge chain-${chain}`}>{chainLabel}</span>
        </div>

        {/* Balance — largest typographic element on the card */}
        <div className="wallet-balance">
          {loading ? (
            <div className="balance-loading">
              <div className="skeleton skeleton-balance" />
              <span className="balance-fetching-label">Fetching...</span>
            </div>
          ) : error ? (
            <div className="balance-error">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Failed to fetch balance
            </div>
          ) : (
            <div className="balance-display">
              <span className="balance-value">{balance ?? '0.000000'}</span>
              <span className="balance-unit">{chainLabel}</span>
            </div>
          )}
        </div>

        {/* Address row with copy button */}
        <div className="wallet-address">
          <div className="address-row">
            <span className="address-mono">{shortAddress}</span>
            <button
              className={`btn btn-xs btn-ghost copy-btn ${copied ? 'copy-btn-success' : ''}`}
              onClick={handleCopy}
              title="Copy full address"
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Full address — selectable for manual copy fallback */}
          <p className="address-full">{address}</p>

          {/* BIP44 derivation path for transparency */}
          <p className="derive-path">{derivationPath}</p>
        </div>
      </div>
    </div>
  );
}