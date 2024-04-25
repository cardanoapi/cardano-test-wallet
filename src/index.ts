// Make cardano wallet extension and make it available in window

import { mkCardanoWalletExtension } from "./cardanoWallet";

(async () => {
  const walletName = window["cardanoTestWallet"]["walletName"];

  if (walletName == null) {
    throw new Error(
      'Please specify the wallet name in the cardanoTestWallet.walletName object. Example: { walletName: "MyWallet" }'
    );
  }

  const extension = await mkCardanoWalletExtension();

  // @ts-ignore
  window.cardano = {
    [walletName]: extension,
  };
})();
