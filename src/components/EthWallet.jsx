import { useState, useCallback } from 'react';
import { HDNodeWallet, JsonRpcProvider, formatEther } from 'ethers';
import { mnemonicToSeed } from 'bip39';
import WalletCard from './WalletCard';

/**
 * SECURITY WARNING: eth.llamarpc.com is a free public RPC — rate-limited and
 * not suitable for production. Use a private RPC (Alchemy, Infura, etc.).
 * This app is for EDUCATIONAL PURPOSES ONLY.
 *
 * A new provider is created per balance fetch to avoid stale connection state.
 */
const ETH_RPC = 'https://eth.llamarpc.com';

/**
 * Derives an Ethereum address and derivation path from a seed buffer.
 *
 * Path: m/44'/60'/{index}'/0/0
 *   44'  = BIP44 purpose
 *   60'  = Ethereum coin type (SLIP-0044)
 *   {index}' = account index
 *   0/0  = external chain / first address
 *
 * @param {Buffer} seed  - 64-byte output of mnemonicToSeed
 * @param {number} index - account index
 * @returns {{ address: string, derivationPath: string }}
 */
function deriveAddress(seed, index) {
  const path = `m/44'/60'/${index}'/0/0`;
  // HDNodeWallet.fromSeed accepts Buffer (which extends Uint8Array)
  const address = HDNodeWallet.fromSeed(seed).derivePath(path).address;
  return { address, derivationPath: path };
}

/**
 * Fetches the ETH balance for an address from mainnet.
 *
 * provider.getBalance returns a BigInt (wei). We use formatEther() which
 * handles BigInt correctly — never use Number() on wei, it loses precision.
 *
 * @param {string} address - checksummed 0x… Ethereum address
 * @returns {Promise<string>}
 */
async function fetchEthBalance(address) {
  const provider = new JsonRpcProvider(ETH_RPC);
  const wei = await provider.getBalance(address);
  // formatEther converts BigInt wei → decimal ETH string without precision loss
  return parseFloat(formatEther(wei)).toFixed(6);
}

// ─── Section Component ────────────────────────────────────────────────────────

/**
 * EthWallet section.
 *
 * State architecture: wallets is an array of wallet objects (not raw addresses).
 * Each object tracks its own balance, loading, and error state.
 * Balance is fetched HERE (not in WalletCard) so WalletCard stays presentational.
 *
 * wallets: Array<{
 *   id: string,          // unique key, e.g. "eth-0"
 *   chain: 'eth',
 *   index: number,
 *   address: string,
 *   derivationPath: string,
 *   balance: string | null,
 *   loading: boolean,
 *   error: string | null,
 * }>
 */
export default function EthWallet({ mnemonic }) {
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
      const { address, derivationPath } = deriveAddress(seed, index);
      const id = `eth-${index}`;

      // Add wallet immediately with loading state so user sees instant feedback
      setWallets(prev => [
        ...prev,
        { id, chain: 'eth', index, address, derivationPath, balance: null, loading: true, error: null },
      ]);
      setNextIndex(prev => prev + 1);

      // Fetch balance separately — only for this new wallet, not all wallets
      try {
        const balance = await fetchEthBalance(address);
        setWallets(prev =>
          prev.map(w => (w.id === id ? { ...w, balance, loading: false } : w))
        );
      } catch {
        setWallets(prev =>
          prev.map(w => (w.id === id ? { ...w, loading: false, error: 'Failed to fetch balance' } : w))
        );
      }
    } catch (err) {
      console.error('ETH derivation failed:', err);
    } finally {
      setIsAdding(false);
    }
  }, [mnemonic, nextIndex, isAdding]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon eth-icon">
            {/* Ethereum diamond logo */}
            <svg width="14" height="22" viewBox="0 0 256 417" fill="currentColor">
              <path fillOpacity=".6" d="M127.9 0 125 9.5 0 212.5l127.9 75.7 128-75.7z" />
              <path d="M0 212.5l127.9 75.7V0z" />
              <path fillOpacity=".6" d="M127.9 315.8 0 240l127.9 177z" />
              <path d="M0 240l127.9 177V315.8z" />
              <path fillOpacity=".2" d="M127.9 288.2l128-75.7-128-58.5z" />
              <path fillOpacity=".6" d="M255.9 212.5 127.9 136v152.2z" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">Ethereum</h2>
            <p className="card-subtitle">
              {wallets.length} {wallets.length === 1 ? 'account' : 'accounts'} · m/44&apos;/60&apos;
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
          <div className="empty-icon empty-icon-eth">
            <svg width="18" height="28" viewBox="0 0 256 417" fill="currentColor">
              <path fillOpacity=".6" d="M127.9 0 125 9.5 0 212.5l127.9 75.7 128-75.7z" />
              <path d="M0 212.5l127.9 75.7V0z" />
              <path fillOpacity=".6" d="M127.9 315.8 0 240l127.9 177z" />
              <path d="M0 240l127.9 177V315.8z" />
              <path fillOpacity=".2" d="M127.9 288.2l128-75.7-128-58.5z" />
              <path fillOpacity=".6" d="M255.9 212.5 127.9 136v152.2z" />
            </svg>
          </div>
          <p className="empty-title">No Ethereum accounts</p>
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