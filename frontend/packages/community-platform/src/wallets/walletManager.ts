/**
 *  مدیریت کیف پول Web3
 *
 * این ماژول مسئول شناسایی، اتصال و مدیریت کیف پول‌های Web3 است.
 */
import { safeExtensionImport, detectExtension, Extension } from '../utils/chromeExtensionFallback';

// لیست برنامه‌های افزودنی کیف پول رایج
const commonExtensions: Extension[] = [
    { id: 'nkbihfbeogaeaoehlefnkodbefgpgknn', name: 'metamask', detectionFlag: 'isMetaMask' },
    { id: 'mopnmbcafieddcagagdcbnhejhlodfdd', name: 'polkadot', detectionFlag: 'isPolkadot' },
    { id: 'onhogfjeacnfoofkfgppdlbmlmnplgbn', name: 'subwallet', detectionFlag: 'isSubWallet' },
    { id: 'fijngjgcjhjmmpcmkeiomlglpeiijkld', name: 'talisman', detectionFlag: 'isTalisman' },
];

/**
 * 🎯 شناسایی برنامه‌های افزودنی Web3 رایج
 */
export async function detectWeb3Extensions() {
  const results: Record<string, boolean> = {};

  for (const extension of commonExtensions) {
    // Tenta importar um recurso da extensão. Se for bem-sucedido, a extensão está presente.
    const module = await safeExtensionImport(extension.id, 'page.js');
    let isDetected = !!module;

    // Se a importação falhar, use a detecção de fallback
    if (!isDetected) {
      isDetected = await detectExtension(extension);
    }
    
    results[extension.name] = isDetected;
  }

  return results;
}

/**
 * 🔗 به یک کیف پول خاص متصل شوید
 * @param walletName - نام کیف پول برای اتصال
 */
export async function connectToWallet(walletName: string) {
  const extension = commonExtensions.find(ext => ext.name === walletName);
  if (!extension) {
    throw new Error(`کیف پول ${walletName} پشتیبانی نمی‌شود.`);
  }

  const isDetected = await detectExtension(extension);
  if (!isDetected) {
    throw new Error(`برنامه افزودنی کیف پول ${walletName} شناسایی نشد.`);
  }

  // منطق اتصال خاص کیف پول در اینجا قرار می‌گیرد
  // به عنوان مثال، فراخوانی window.ethereum.request({ method: 'eth_requestAccounts' }) برای MetaMask
  console.info(`[WalletManager] در حال اتصال به ${walletName}...`);
  // ... منطق اتصال
}