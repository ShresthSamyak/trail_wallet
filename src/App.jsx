import { useState } from 'react';
import { generateMnemonic } from 'bip39';
import SeedPhrase from './components/SeedPhrase';
import SolanaWallet from './components/SolanaWallet';
import EthWallet from './components/EthWallet';
import './App.css';

/**
 * Root application component.
 *
 * State lives here so that the mnemonic is the single source of truth.
 * Both SolanaWallet and EthWallet receive it as a read-only prop and derive
 * their keypairs independently — no cross-chain state sharing needed.
 *
 * SECURITY WARNING: Storing a mnemonic in React state means it lives in
 * JavaScript memory and is accessible to any script on the page. This is
 * NOT production-safe. A real wallet would use a hardware enclave or an
 * encrypted vault and would NEVER expose the raw phrase to the UI layer.
 */
export default function App() {
  const [mnemonic, setMnemonic] = useState('');

  function handleGenerate() {
    // generateMnemonic() uses the browser's crypto.getRandomValues via bip39
    setMnemonic(generateMnemonic());
  }

  return (
    <div className="app">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">ChainWallet</span>
          </div>
          <span className="topbar-tag">Testnet / Demo</span>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <main className="main">
        {/* Hero */}
        <div className="hero">
          <h1 className="hero-title">
            Multi-Chain <span className="gradient-text">HD Wallet</span>
          </h1>
          <p className="hero-sub">
            Derive Solana &amp; Ethereum accounts from a single seed phrase.
            Non-custodial · BIP39 · BIP44
          </p>
        </div>

        {/* Sections */}
        <SeedPhrase mnemonic={mnemonic} onGenerate={handleGenerate} />

        {/* Wallet sections appear only after a mnemonic is created */}
        {mnemonic && (
          <div className="wallet-sections">
            <SolanaWallet mnemonic={mnemonic} />
            <EthWallet mnemonic={mnemonic} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>For educational purposes only · Never use on mainnet with real funds</p>
      </footer>
    </div>
  );
}
