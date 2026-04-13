# Crypto Wallet

A multi-chain cryptocurrency wallet application built with React and Vite, supporting Ethereum and Solana blockchains. This project provides a secure interface for managing digital assets through industry-standard mnemonic generation and key derivation.

## Features

- Mnemonic Generation: Secure generation of 12-word seed phrases using the BIP39 standard.
- Ethereum Wallet Integration: Support for Ethereum account creation and management using Ethers.js.
- Solana Wallet Integration: Support for Solana account creation and management using Solana Web3.js.
- Multi-Chain Support: Simultaneous management of assets across different blockchain networks.
- Persistent State: Efficient handling of wallet data within the React application lifecycle.
- Modern UI: Responsive and interactive user interface designed with glassmorphism aesthetics.

## Technology Stack

- Frontend Framework: React 19
- Build Tool: Vite 8
- Blockchain Libraries: Ethers.js v6, @solana/web3.js
- Cryptography: BIP39, Ed25519-HD-Key, TweetNaCl
- Styling: Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd crypto-wallet
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Development

To launch the application in development mode with hot-module replacement:
```bash
npm run dev
```
The application will be accessible at the URL provided in your terminal (typically http://localhost:5173).

### Production Build

To generate an optimized build for production:
```bash
npm run build
```
The production-ready files will be located in the `dist/` directory.

## Security Considerations

This application handles sensitive cryptographic information.
- Mnemonics and private keys are processed locally.
- Ensure that the environment is secure before generating seed phrases.
- Never share your recovery phrase or private keys with third parties.

## License

This project is for educational purposes. Refer to the package.json for specific dependency licensing.