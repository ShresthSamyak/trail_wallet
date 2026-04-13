import { useState, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { mnemonicToSeed } from 'bip39';
import nacl from 'tweetnacl';
import WalletCard from './WalletCard';

/**
 * SECURITY WARNING: Using the public mainnet RPC is rate-limited and logs
 * requests. A real wallet must use a private RPC (Alchemy, Helius, etc.).
 * This app is for EDUCATIONAL PURPOSES ONLY.
 */
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

/**
 * Derives a Solana public key (base58) and derivation path from a seed buffer.
 *
 * Path: m/44'/501'/{index}'/0'
 *   44'  = BIP44 purpose
 *   501' = Solana coin type (SLIP-0044)
 *   {index}' = account index
 *   0'   = change index (hardened per Solana convention)
 *
 * @param {Buffer} seed  - 64-byte output of mnemonicToSeed
 * @param {number} index - account index
 * @returns {{ address: string, derivationPath: string }}
 */
function deriveKeypair(seed, index) {
  const path = `m/44'/501'/${index}'/0'`;
  // derivePath expects the seed as a lowercase hex string
  const { key } = derivePath(path, Buffer.from(seed).toString('hex'));
  // nacl.sign.keyPair.fromSeed needs a 32-byte Uint8Array (key is already that)
  const { publicKey } = nacl.sign.keyPair.fromSeed(key);
  return {
    address: new PublicKey(publicKey).toBase58(),
    derivationPath: path,
  };
}

/**
 * Fetches the SOL balance for an address from mainnet.
 * Returns a formatted string (e.g. "1.2345").
 *
 * @param {string} address - base58 Solana public key
 * @returns {Promise<string>}
 */
async function fetchSolBalance(address) {
  const connection = new Connection(SOLANA_RPC, 'confirmed');
  const lamports = await connection.getBalance(new PublicKey(address));
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

// ─── Section Component ────────────────────────────────────────────────────────

/**
 * SolanaWallet section.
 *
 * State architecture: wallets is an array of wallet objects (not raw addresses).
 * Each object tracks its own balance, loading, and error state.
 * Balance is fetched HERE (not in WalletCard) so WalletCard stays presentational.
 *
 * wallets: Array<{
 *   id: string,          // unique key, e.g. "sol-0"
 *   chain: 'sol',
 *   index: number,
 *   address: string,
 *   derivationPath: string,
 *   balance: string | null,
 *   loading: boolean,
 *   error: string | null,
 * }>
 */
export default function SolanaWallet({ mnemonic }) {
  const [wallets, setWallets] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddWallet = useCallback(async () => {
    if (!mnemonic || isAdding) return;
    setIsAdding(true);

    try {
      // mnemonicToSeed is async (PBKDF2) — awaiting keeps the UI responsive
      const seed = await mnemonicToSeed(mnemonic);
      const index = nextIndex;
      const { address, derivationPath } = deriveKeypair(seed, index);
      const id = `sol-${index}`;

      // Add wallet immediately with loading state so user sees instant feedback
      setWallets(prev => [
        ...prev,
        { id, chain: 'sol', index, address, derivationPath, balance: null, loading: true, error: null },
      ]);
      setNextIndex(prev => prev + 1);

      // Fetch balance separately — only for this new wallet, not all wallets
      try {
        const balance = await fetchSolBalance(address);
        setWallets(prev =>
          prev.map(w => (w.id === id ? { ...w, balance, loading: false } : w))
        );
      } catch {
        setWallets(prev =>
          prev.map(w => (w.id === id ? { ...w, loading: false, error: 'Failed to fetch balance' } : w))
        );
      }
    } catch (err) {
      console.error('Solana derivation failed:', err);
    } finally {
      setIsAdding(false);
    }
  }, [mnemonic, nextIndex, isAdding]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon sol-icon">
            {/* Solana logo — three parallel bars with diagonal cuts */}
            <svg width="18" height="14" viewBox="0 0 96 96" fill="currentColor">
              <path d="M16.2 65.2c.6-.6 1.4-.9 2.2-.9H92c1.4 0 2.1 1.7 1.1 2.7L76.5 83.6c-.6.6-1.4.9-2.2.9H1c-1.4 0-2.1-1.7-1.1-2.7L16.2 65.2zM16.2 12.4C16.8 11.8 17.6 11.5 18.4 11.5H92c1.4 0 2.1 1.7 1.1 2.7L76.5 30.8c-.6.6-1.4.9-2.2.9H1c-1.4 0-2.1-1.7-1.1-2.7L16.2 12.4zM76.5 38.7c-.6-.6-1.4-.9-2.2-.9H1c-1.4 0-2.1 1.7-1.1 2.7l16.3 16.6c.6.6 1.4.9 2.2.9H92c1.4 0 2.1-1.7 1.1-2.7L76.5 38.7z" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">Solana</h2>
            <p className="card-subtitle">
              {wallets.length} {wallets.length === 1 ? 'account' : 'accounts'} · m/44&apos;/501&apos;
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleAddWallet}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <span className="spinner-sm" />
              Adding...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Wallet
            </>
          )}
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon empty-icon-sol">
            <svg width="24" height="18" viewBox="0 0 96 96" fill="currentColor">
              <path d="M16.2 65.2c.6-.6 1.4-.9 2.2-.9H92c1.4 0 2.1 1.7 1.1 2.7L76.5 83.6c-.6.6-1.4.9-2.2.9H1c-1.4 0-2.1-1.7-1.1-2.7L16.2 65.2zM16.2 12.4C16.8 11.8 17.6 11.5 18.4 11.5H92c1.4 0 2.1 1.7 1.1 2.7L76.5 30.8c-.6.6-1.4.9-2.2.9H1c-1.4 0-2.1-1.7-1.1-2.7L16.2 12.4zM76.5 38.7c-.6-.6-1.4-.9-2.2-.9H1c-1.4 0-2.1 1.7-1.1 2.7l16.3 16.6c.6.6 1.4.9 2.2.9H92c1.4 0 2.1-1.7 1.1-2.7L76.5 38.7z" />
            </svg>
          </div>
          <p className="empty-title">No Solana accounts</p>
          <p className="empty-text">Click "Add Wallet" to derive your first account</p>
        </div>
      ) : (
        <div className="wallet-grid">
          {wallets.map(wallet => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      )}
    </div>
  );
}