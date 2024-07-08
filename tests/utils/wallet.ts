// test only

import { CardanoTestWalletConfig, CardanoTestWalletJson } from "../../types";
import { JSDOM } from "jsdom";
import { mkCardanoWalletExtension } from "../../src/cardanoWallet";

const dom = new JSDOM();
(global as any).window = dom.window;

export async function loadTestExtension(
  walletName: string,
  supportedExtensions?: Record<string, number>[],
) {
  // @ts-ignore
  window.cardanoTestWallet = {
    walletName: walletName,
    supportedExtensions: supportedExtensions,
  };

  return mkCardanoWalletExtension(walletName, supportedExtensions);
}

export function importTestWallet(wallet: CardanoTestWalletJson) {
  // @ts-ignore
  window.cardanoTestWallet = wallet;
}

export function addTestWalletConfig(config: CardanoTestWalletConfig) {
  // @ts-ignore
  window.cardanoTestWallet.config = config;
}
