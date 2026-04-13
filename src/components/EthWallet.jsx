import { useEffect, useState } from 'react';
import { HDNodeWallet, JsonRpcProvider } from 'ethers';
import { mnemonicToSeedSync } from 'bip39';

// Public Ethereum RPC — no API key required
const provider = new JsonRpcProvider('https://eth.llamarpc.com');

/**
 * Derives an Ethereum wallet from a mnemonic at the given index.
 * Path: m/44'/60'/{index}'/0/0  (BIP44 for Ethereum coin type 60)
 */
function deriveEthWallet(mnemonic, index) {
  const seed = mnemonicToSeedSync(mnemonic); // Buffer
  // HDNodeWallet.fromSeed returns the root HD node
  const root = HDNodeWallet.fromSeed(seed);
  // Derive the child wallet at the given account index
  const path = `m/44'/60'/${index}'/0/0`;
  const child = root.derivePath(path);
  return child.address; // checksummed Ethereum address (0x...)
}

/**
 * Single wallet card component.
 * Fetches its own ETH balance via useEffect.
 */
function WalletCard({ address }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalance() {
      try {
        const rawBalance = await provider.getBalance(address); // returns BigInt in wei
        if (!cancelled) {
          // Convert wei → ETH (1 ETH = 10^18 wei)
          const eth = Number(rawBalance) / 1e18;
          setBalance(eth.toFixed(6)); // 6 decimal places
        }
      } catch {
        if (!cancelled) setBalance('Error');
      } finally {
        if (!cancelled) setLoading(false);
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

  return (
    <div className="wallet-card">
      <div className="wallet-address">
        <span className="label">Address</span>
        <span className="address-text">{address}</span>
        <button className="copy-btn" onClick={copyAddress}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="wallet-balance">
        <span className="label">Balance</span>
        <span>{loading ? 'Loading...' : `${balance} ETH`}</span>
      </div>
    </div>
  );
}

/**
 * EthWallet section.
 * Manages an array of derived wallets and an index counter.
 */
export default function EthWallet({ mnemonic }) {
  // Each item: { address: string, index: number }
  const [wallets, setWallets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  function addWallet() {
    const address = deriveEthWallet(mnemonic, currentIndex);

    setWallets(prev => [...prev, { address, index: currentIndex }]);
    setCurrentIndex(prev => prev + 1);
  }

  return (
    <section className="wallet-section">
      <h2>Ethereum Wallets</h2>
      <button className="primary-btn" onClick={addWallet}>
        Add Ethereum Wallet
      </button>
      <div className="wallets-list">
        {wallets.map(({ address, index }) => (
          <div key={address}>
            <p className="wallet-index">Wallet #{index + 1} — m/44&apos;/60&apos;/{index}&apos;/0/0</p>
            <WalletCard address={address} />
          </div>
        ))}
      </div>
    </section>
  );
}
