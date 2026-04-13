import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import { mnemonicToSeed } from 'bip39'; // async version — avoids blocking the main thread
import nacl from 'tweetnacl';

// SECURITY NOTE: In production, never use the public mainnet RPC for a
// browser wallet — it is rate-limited and logs requests. Use a private RPC.
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

/**
 * Derives a Solana Keypair from a mnemonic at a given account index.
 *
 * Derivation path: m/44'/501'/{index}'/0'
 *   - 44'  = BIP44 purpose
 *   - 501' = Solana coin type
 *   - {index}' = account index (incremented per wallet)
 *   - 0'   = change index (hardened, Solana convention)
 *
 * @param {Buffer} seed  - 64-byte seed from mnemonicToSeed
 * @param {number} index - account index
 * @returns {Keypair}
 */
function deriveKeypair(seed, index) {
  const path = `m/44'/501'/${index}'/0'`;
  // derivePath expects the seed as a lowercase hex string
  const { key } = derivePath(path, Buffer.from(seed).toString('hex'));
  // nacl.sign.keyPair.fromSeed needs a 32-byte Uint8Array
  const keyPair = nacl.sign.keyPair.fromSeed(key);
  return Keypair.fromSecretKey(keyPair.secretKey);
}

// ─── Wallet Card ─────────────────────────────────────────────────────────────

/**
 * Displays a single Solana wallet: address + live balance.
 * Fetches its own balance in a useEffect so we never run async
 * logic inside JSX .map() calls.
 */
function WalletCard({ publicKey, index }) {
  const [balance, setBalance] = useState(null);   // null = not yet loaded
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [copied, setCopied] = useState(false);

  // Fetch balance once when the component mounts (or if publicKey changes)
  useEffect(() => {
    let cancelled = false; // prevents state update after unmount

    async function fetchBalance() {
      try {
        setStatus('loading');
        const pubkey = new PublicKey(publicKey); // base58 → PublicKey object
        const lamports = await connection.getBalance(pubkey);
        if (cancelled) return;
        // 1 SOL = 1,000,000,000 lamports
        setBalance((lamports / 1e9).toFixed(4));
        setStatus('ok');
      } catch (err) {
        if (cancelled) return;
        console.error('Solana balance fetch failed:', err);
        setStatus('error');
      }
    }

    fetchBalance();
    return () => { cancelled = true; };
  }, [publicKey]);

  function copyAddress() {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Truncate address for display: first 6 … last 4 chars
  const shortAddress = `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;

  return (
    <div className="wallet-card">
      {/* Card accent bar */}
      <div className="wallet-card-accent sol-accent" />

      <div className="wallet-card-body">
        {/* Header row: wallet number + chain badge */}
        <div className="wallet-card-header">
          <span className="wallet-label">Wallet #{index + 1}</span>
          <span className="chain-badge sol-badge">SOL</span>
        </div>

        {/* Balance — prominent display */}
        <div className="balance-display">
          {status === 'loading' && (
            <span className="balance-loading">
              <span className="spinner" /> Fetching…
            </span>
          )}
          {status === 'ok' && (
            <span className="balance-value">{balance} <span className="balance-unit">SOL</span></span>
          )}
          {status === 'error' && (
            <span className="balance-error">Failed to load</span>
          )}
        </div>

        {/* Address row */}
        <div className="address-row">
          <span className="address-mono" title={publicKey}>{shortAddress}</span>
          <button
            className={`btn btn-ghost btn-xs ${copied ? 'btn-success' : ''}`}
            onClick={copyAddress}
            title="Copy full address"
          >
            {copied ? '✓' : '⎘ Copy'}
          </button>
        </div>

        {/* Full address (collapsed, selectable) */}
        <p className="address-full">{publicKey}</p>

        {/* Derivation path hint */}
        <p className="derive-path">m/44&apos;/501&apos;/{index}&apos;/0&apos;</p>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

/**
 * SolanaWallet section.
 * Manages an array of derived wallet public keys + a monotonic index counter.
 * Each "Add Wallet" click derives the next account from the same seed.
 */
export default function SolanaWallet({ mnemonic }) {
  // wallets: Array<{ publicKey: string, index: number }>
  const [wallets, setWallets] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [deriving, setDeriving] = useState(false);

  async function addWallet() {
    setDeriving(true);
    try {
      // mnemonicToSeed is async — avoids blocking the UI thread with heavy PBKDF2
      const seed = await mnemonicToSeed(mnemonic);
      const keypair = deriveKeypair(seed, nextIndex);
      const publicKey = keypair.publicKey.toBase58(); // standard base58 encoding

      // Functional update ensures we never read stale state
      setWallets(prev => [...prev, { publicKey, index: nextIndex }]);
      setNextIndex(prev => prev + 1);
    } catch (err) {
      console.error('Solana derivation failed:', err);
    } finally {
      setDeriving(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-icon sol-icon">◎</div>
        <div>
          <h2 className="card-title">Solana Wallets</h2>
          <p className="card-subtitle">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''} derived</p>
        </div>
        <button
          className="btn btn-primary btn-sm ml-auto"
          onClick={addWallet}
          disabled={deriving}
        >
          {deriving ? 'Deriving…' : '+ Add Wallet'}
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="empty-state">
          <p>No wallets yet. Click <strong>+ Add Wallet</strong> to derive your first Solana account.</p>
        </div>
      ) : (
        <div className="wallet-grid">
          {wallets.map(({ publicKey, index }) => (
            <WalletCard key={publicKey} publicKey={publicKey} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
