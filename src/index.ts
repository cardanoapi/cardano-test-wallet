// Make cardano wallet extension and make it available in window

import { CardanoTestWalletConfig } from "../types";
import { mkCardanoWalletExtension } from "./cardanoWallet";

(async () => {
  const walletName = window["cardanoTestWallet"]["walletName"];
  const config: CardanoTestWalletConfig = window["cardanoTestWallet"]["config"];

  if (walletName == null) {
    throw new Error(
      'Please specify the wallet name in the cardanoTestWallet.walletName object. Example: { walletName: "MyWallet" }'
    );
  }

  const extension = await mkCardanoWalletExtension(
    walletName,
    config.supportedExtensions
  );

  // @ts-ignore
  window.cardano = {
    [walletName]: extension,
  };
})();
