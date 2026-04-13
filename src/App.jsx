import { useState } from 'react';
import { generateMnemonic } from 'bip39';
import SolanaWallet from './components/SolanaWallet';
import EthWallet from './components/EthWallet';
import './App.css';

export default function App() {
  // mnemonic is the single source of truth — derived wallets are computed from it
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicCopied, setMnemonicCopied] = useState(false);

  function createSeedPhrase() {
    // generateMnemonic() returns a random 12-word BIP39 mnemonic
    const phrase = generateMnemonic();
    setMnemonic(phrase);
  }

  function copyMnemonic() {
    navigator.clipboard.writeText(mnemonic);
    setMnemonicCopied(true);
    setTimeout(() => setMnemonicCopied(false), 2000);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Multi-Chain Web Wallet</h1>
        <p className="subtitle">Solana + Ethereum — non-custodial HD wallet</p>
      </header>

      {/* ── Seed Phrase Section ─────────────────────────────────────── */}
      <section className="seed-section">
        <h2>Seed Phrase</h2>
        <p className="warning">
          ⚠ Never share your seed phrase. Store it offline in a safe place.
        </p>

        <button className="primary-btn" onClick={createSeedPhrase}>
          {mnemonic ? 'Regenerate Seed Phrase' : 'Create Seed Phrase'}
        </button>

        {mnemonic && (
          <div className="mnemonic-box">
            {/* Display each word in its own chip for readability */}
            <div className="mnemonic-words">
              {mnemonic.split(' ').map((word, i) => (
                <span className="mnemonic-word" key={i}>
                  <span className="word-index">{i + 1}.</span> {word}
                </span>
              ))}
            </div>
            <button className="copy-btn mnemonic-copy-btn" onClick={copyMnemonic}>
              {mnemonicCopied ? 'Copied!' : 'Copy Seed Phrase'}
            </button>
          </div>
        )}
      </section>

      {/* ── Wallet Sections (only shown after mnemonic is generated) ── */}
      {mnemonic && (
        <>
          <SolanaWallet mnemonic={mnemonic} />
          <EthWallet mnemonic={mnemonic} />
        </>
      )}
    </div>
  );
}
