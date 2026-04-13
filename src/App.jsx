import { useState, useCallback } from 'react';
import { generateMnemonic } from 'bip39';
import Layout from './components/Layout';
import SeedPhrase from './components/SeedPhrase';
import SolanaWallet from './components/SolanaWallet';
import EthWallet from './components/EthWallet';
import './App.css';

/**
 * App — Root state container.
 *
 * The mnemonic lives here so it can be passed to both chain sections.
 * Each chain section manages its own wallet array independently.
 *
 * SECURITY WARNING: Storing a mnemonic in React state means it lives in
 * JavaScript heap memory and is accessible to any script on the page.
 * This is NOT production-safe. A production wallet would use a hardware
 * enclave, secure enclave, or encrypted vault — never exposing the raw
 * phrase to the UI rendering layer.
 */
export default function App() {
  const [mnemonic, setMnemonic] = useState('');

  // generateMnemonic() uses crypto.getRandomValues under the hood via bip39
  const handleGenerate = useCallback(() => {
    setMnemonic(generateMnemonic());
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">HD Wallet · BIP39 · BIP44</div>
        <h1 className="hero-title">
          Your <span className="gradient-text">Multi-Chain</span> Wallet
        </h1>
        <p className="hero-subtitle">
          Generate and manage Solana &amp; Ethereum accounts from a single seed phrase.
          Non-custodial · open source · educational only.
        </p>
      </div>

      {/* Seed phrase section */}
      <SeedPhrase mnemonic={mnemonic} onGenerate={handleGenerate} />

      {/* Chain sections — appear only after mnemonic is generated */}
      {mnemonic && (
        <div className="wallet-sections">
          <SolanaWallet mnemonic={mnemonic} />
          <EthWallet mnemonic={mnemonic} />
        </div>
      )}
    </Layout>
  );
}