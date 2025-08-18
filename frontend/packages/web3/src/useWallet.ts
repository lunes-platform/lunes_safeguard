import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    connect: () => connect({ connector: injected() }),
    disconnect,
    isActive: isConnected,
    isActivating: isConnecting,
    account: address,
    // Outras propriedades como provider, chainId, etc.,
    // podem ser obtidas com outros hooks do wagmi, como useChainId, usePublicClient, etc.
  };
}