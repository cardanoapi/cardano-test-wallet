import { CardanoTestWallet, CardanoTestWalletConfig } from "./types";

export function loadExtension(walletName: string) {
  // @ts-ignore
  window.cardanoTestWallet = {
    walletName: walletName,
  };

  require("./script.js");
}

export function importTestWallet(wallet: CardanoTestWallet) {
  // @ts-ignore
  window.cardanoTestWallet = wallet;
}

export function addTestWalletConfig(config: CardanoTestWalletConfig) {
  // @ts-ignore
  window.cardanoTestWallet.config = config;
}
