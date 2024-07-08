import { mkCardanoWalletExtension } from "../src/cardanoWallet";
import { CardanoTestWallet, CardanoTestWalletConfig } from "../types";

describe("Configuration overrides", () => {
  test("Should use default configurations if not provided", async () => {
    const walletName = "test";
    const cardanoTestWallet: CardanoTestWallet = { walletName };

    const extension = await mkCardanoWalletExtension(cardanoTestWallet);
    const walletApi = await extension.enable();

    const networkId = await walletApi.getNetworkId();
    expect(networkId).toBe(0);
    expect(extension.name).toBe(walletName);
  });

  test("Should override default configuration", async () => {
    const overrides: CardanoTestWalletConfig = {
      networkId: 1,
    };

    const config: CardanoTestWalletConfig = { networkId: overrides.networkId };
    const cardanoTestWallet = { walletName: "test", config };

    const extension = await mkCardanoWalletExtension(cardanoTestWallet);
    const walletApi = await extension.enable();

    expect(await walletApi.getNetworkId()).toBe(overrides.networkId);
  });
});
