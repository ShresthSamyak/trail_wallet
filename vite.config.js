import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Polyfills are required because bip39, @solana/web3.js, and ed25519-hd-key
// use Node.js built-ins (buffer, crypto, stream) that browsers don't have natively.
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Polyfill Buffer globally — required by bip39 and @solana/web3.js
      globals: { Buffer: true, global: true, process: true },
      // Polyfill these Node built-ins in the browser
      protocolImports: true,
    }),
  ],
})
