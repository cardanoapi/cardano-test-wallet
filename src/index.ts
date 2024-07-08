// Make cardano wallet extension and make it available in window

import { CardanoTestWallet, CardanoTestWalletConfig } from "../types";
import { mkCardanoWalletExtension } from "./cardanoWallet";

(async () => {
  const cardanoTestWallet: CardanoTestWallet | undefined =
    window["cardanoTestWallet"];
  const walletName = cardanoTestWallet?.walletName;

  if (!walletName) {
    throw new Error(
      'Please specify the wallet name in the cardanoTestWallet.walletName object. Example: { walletName: "MyWallet" }',
    );
  }

  const extension = await mkCardanoWalletExtension(
    walletName,
    cardanoTestWallet.supportedExtensions,
  );

  // @ts-ignore
  window.cardano = {
    [walletName]: extension,
  };
})();
