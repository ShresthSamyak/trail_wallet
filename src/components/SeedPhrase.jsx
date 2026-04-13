import { useState } from 'react';

/**
 * SeedPhrase component
 * Displays the generated mnemonic as a grid of word chips.
 *
 * SECURITY WARNING: In a production wallet, the seed phrase must NEVER be
 * stored in plaintext in state, localStorage, or transmitted over a network.
 * This component is for educational/demo purposes only.
 */
export default function SeedPhrase({ mnemonic, onGenerate }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="card seed-card">
      {/* Section header */}
      <div className="card-header">
        <div className="card-icon seed-icon">🔑</div>
        <div>
          <h2 className="card-title">Seed Phrase</h2>
          <p className="card-subtitle">Your master key — controls all derived wallets</p>
        </div>
      </div>

      {/* Security warning */}
      <div className="alert alert-warning">
        <span className="alert-icon">⚠</span>
        <span>
          <strong>Never share your seed phrase.</strong> Anyone with it has full
          access to your funds. Store it offline in a safe place. This app is
          NOT production-safe.
        </span>
      </div>

      {/* Generate button */}
      <button className="btn btn-primary" onClick={onGenerate}>
        <span className="btn-icon">✦</span>
        {mnemonic ? 'Regenerate Seed Phrase' : 'Create Seed Phrase'}
      </button>

      {/* Word grid — only shown after generation */}
      {mnemonic && (
        <div className="mnemonic-container">
          <div className="mnemonic-grid">
            {mnemonic.split(' ').map((word, i) => (
              <div className="word-chip" key={i}>
                <span className="word-num">{i + 1}</span>
                <span className="word-text">{word}</span>
              </div>
            ))}
          </div>

          <div className="mnemonic-footer">
            <span className="mnemonic-hint">12 words · BIP39</span>
            <button
              className={`btn btn-ghost btn-sm ${copied ? 'btn-success' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied!' : '⎘ Copy Phrase'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
