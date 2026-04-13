import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import nacl from 'tweetnacl';

// Mainnet RPC endpoint
const connection = new Connection('https://api.mainnet-beta.solana.com');

/**
 * Derives a Solana keypair from a mnemonic at the given index.
 * Path: m/44'/501'/{index}'/0'  (BIP44 for Solana coin type 501)
 */
function deriveSolanaKeypair(mnemonic, index) {
  const seed = mnemonicToSeedSync(mnemonic); // synchronous — returns a Buffer
  const path = `m/44'/501'/${index}'/0'`;
  const { key } = derivePath(path, seed.toString('hex'));
  // nacl.sign.keyPair.fromSeed expects a 32-byte Uint8Array seed
  const keyPair = nacl.sign.keyPair.fromSeed(key);
  return Keypair.fromSecretKey(keyPair.secretKey);
}

/**
 * Single wallet card component.
 * Fetches its own balance on mount via useEffect.
 */
function WalletCard({ publicKey }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalance() {
      try {
        const pubkey = new PublicKey(publicKey);
        const lamports = await connection.getBalance(pubkey);
        if (!cancelled) {
          // Convert lamports → SOL (1 SOL = 1_000_000_000 lamports)
          setBalance(lamports / 1e9);
        }
      } catch {
        if (!cancelled) setBalance('Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBalance();
    return () => { cancelled = true; }; // cleanup to avoid state update on unmounted component
  }, [publicKey]);

  function copyAddress() {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="wallet-card">
      <div className="wallet-address">
        <span className="label">Address</span>
        <span className="address-text">{publicKey}</span>
        <button className="copy-btn" onClick={copyAddress}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="wallet-balance">
        <span className="label">Balance</span>
        <span>{loading ? 'Loading...' : `${balance} SOL`}</span>
      </div>
    </div>
  );
}

/**
 * SolanaWallet section.
 * Manages an array of derived wallets and an index counter.
 */
export default function SolanaWallet({ mnemonic }) {
  // Each item: { publicKey: string, index: number }
  const [wallets, setWallets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  function addWallet() {
    const keypair = deriveSolanaKeypair(mnemonic, currentIndex);
    const publicKey = keypair.publicKey.toBase58(); // base58-encoded public key

    setWallets(prev => [...prev, { publicKey, index: currentIndex }]);
    setCurrentIndex(prev => prev + 1); // increment index for next derivation
  }

  return (
    <section className="wallet-section">
      <h2>Solana Wallets</h2>
      <button className="primary-btn" onClick={addWallet}>
        Add Solana Wallet
      </button>
      <div className="wallets-list">
        {wallets.map(({ publicKey, index }) => (
          <div key={publicKey}>
            <p className="wallet-index">Wallet #{index + 1} — m/44&apos;/501&apos;/{index}&apos;/0&apos;</p>
            <WalletCard publicKey={publicKey} />
          </div>
        ))}
      </div>
    </section>
  );
}
