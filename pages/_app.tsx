// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'STAKE Leaderboard',
  projectId: 'a58b5fa89fb3b4e2ec0433f637abb08a', // <-- 실제 값으로 교체!
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ✅ chains prop 없이 RainbowKitProvider만! */}
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
