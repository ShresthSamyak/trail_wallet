import { useEffect, useState } from 'react';
import { HDNodeWallet, JsonRpcProvider, formatEther } from 'ethers';
import { mnemonicToSeed } from 'bip39'; // async version

// SECURITY NOTE: eth.llamarpc.com is a free public RPC. In production use a
// private RPC (Alchemy / Infura) to avoid rate limits and request logging.
const provider = new JsonRpcProvider('https://eth.llamarpc.com');

/**
 * Derives an Ethereum address from a seed at a given account index.
 *
 * Derivation path: m/44'/60'/{index}'/0/0
 *   - 44'  = BIP44 purpose
 *   - 60'  = Ethereum coin type
 *   - {index}' = account index
 *   - 0/0  = external chain / first address
 *
 * @param {Buffer|Uint8Array} seed  - 64-byte seed from mnemonicToSeed
 * @param {number}            index - account index
 * @returns {string} checksummed Ethereum address (0x…)
 */
function deriveAddress(seed, index) {
  // HDNodeWallet.fromSeed accepts a Uint8Array / Buffer directly
  const root = HDNodeWallet.fromSeed(seed);
  const path = `m/44'/60'/${index}'/0/0`;
  return root.derivePath(path).address; // checksummed 0x… address
}

// ─── Wallet Card ─────────────────────────────────────────────────────────────

/**
 * Displays a single Ethereum wallet: address + live balance.
 * Fetches its own balance in a useEffect to keep JSX pure.
 */
function WalletCard({ address, index }) {
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalance() {
      try {
        setStatus('loading');
        // provider.getBalance returns a BigInt (wei) in ethers v6
        const wei = await provider.getBalance(address);
        if (cancelled) return;

        // formatEther handles BigInt safely — no floating-point precision loss.
        // It returns a string like "0.001234" which we then format to 6 dp.
        const eth = parseFloat(formatEther(wei)).toFixed(6);
        setBalance(eth);
        setStatus('ok');
      } catch (err) {
        if (cancelled) return;
        console.error('ETH balance fetch failed:', err);
        setStatus('error');
      }
    }

    fetchBalance();
    return () => { cancelled = true; };
  }, [address]);

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Shortened display: 0x1234…abcd
  const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="wallet-card">
      {/* Accent bar (Ethereum purple) */}
      <div className="wallet-card-accent eth-accent" />

      <div className="wallet-card-body">
        {/* Header */}
        <div className="wallet-card-header">
          <span className="wallet-label">Wallet #{index + 1}</span>
          <span className="chain-badge eth-badge">ETH</span>
        </div>

        {/* Balance */}
        <div className="balance-display">
          {status === 'loading' && (
            <span className="balance-loading">
              <span className="spinner" /> Fetching…
            </span>
          )}
          {status === 'ok' && (
            <span className="balance-value">{balance} <span className="balance-unit">ETH</span></span>
          )}
          {status === 'error' && (
            <span className="balance-error">Failed to load</span>
          )}
        </div>

        {/* Address row */}
        <div className="address-row">
          <span className="address-mono" title={address}>{shortAddress}</span>
          <button
            className={`btn btn-ghost btn-xs ${copied ? 'btn-success' : ''}`}
            onClick={copyAddress}
            title="Copy full address"
          >
            {copied ? '✓' : '⎘ Copy'}
          </button>
        </div>

        {/* Full address (selectable) */}
        <p className="address-full">{address}</p>

        {/* Derivation path */}
        <p className="derive-path">m/44&apos;/60&apos;/{index}&apos;/0/0</p>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

/**
 * EthWallet section.
 * Each click derives the next account-index wallet from the same seed.
 */
export default function EthWallet({ mnemonic }) {
  // wallets: Array<{ address: string, index: number }>
  const [wallets, setWallets] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [deriving, setDeriving] = useState(false);

  async function addWallet() {
    setDeriving(true);
    try {
      // Await the async PBKDF2 seed derivation — do NOT block the thread
      const seed = await mnemonicToSeed(mnemonic);
      const address = deriveAddress(seed, nextIndex);

      setWallets(prev => [...prev, { address, index: nextIndex }]);
      setNextIndex(prev => prev + 1);
    } catch (err) {
      console.error('ETH derivation failed:', err);
    } finally {
      setDeriving(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-icon eth-icon">Ξ</div>
        <div>
          <h2 className="card-title">Ethereum Wallets</h2>
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
          <p>No wallets yet. Click <strong>+ Add Wallet</strong> to derive your first Ethereum account.</p>
        </div>
      ) : (
        <div className="wallet-grid">
          {wallets.map(({ address, index }) => (
            <WalletCard key={address} address={address} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
