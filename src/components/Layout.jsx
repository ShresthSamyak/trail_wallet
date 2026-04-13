/**
 * Layout.jsx — App shell: sticky topbar, centered main, footer.
 * SECURITY WARNING: This is a demo wallet. Never use with real funds.
 */
export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            <div className="logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L4 8.5V15.5L12 21L20 15.5V8.5L12 3Z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <span className="logo-text">ChainWallet</span>
          </div>
          <span className="topbar-badge">Testnet Only</span>
        </div>
      </header>

      <main className="main">
        <div className="container">{children}</div>
      </main>

      <footer className="footer">
        {/* SECURITY: Remind users this app is for education only */}
        <p className="footer-text">
          For educational purposes only · Never use with real funds · Not production-safe
        </p>
      </footer>
    </div>
  );
}