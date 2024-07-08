import { CardanoTestWalletConfig, CardanoTestWalletJson } from "./types";
import { JSDOM } from "jsdom";

const dom = new JSDOM();
(global as any).window = dom.window;

export function loadExtension(walletName: string) {
  // @ts-ignore
  window.cardanoTestWallet = {
    walletName: walletName,
  };
}

export function importTestWallet(wallet: CardanoTestWalletJson) {
  // @ts-ignore
  window.cardanoTestWallet = wallet;
}

export function addTestWalletConfig(config: CardanoTestWalletConfig) {
  // @ts-ignore
  window.cardanoTestWallet.config = config;
}
