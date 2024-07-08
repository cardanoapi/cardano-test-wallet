import { CardanoTestWalletConfig } from "../types";
import { addTestWalletConfig, loadTestExtension } from "./utils/wallet";

const WALLET_NAME = "test";

describe("Configuration overrides", () => {
  test("Should use default configurations if not provided", async () => {
    const extension = await loadTestExtension(WALLET_NAME);
    const walletApi = await extension.enable();

    const networkId = await walletApi.getNetworkId();
    expect(networkId).toBe(0);
    expect(extension.name).toBe(WALLET_NAME);
    expect(extension.supportedExtensions).toEqual([{ cip: 95 }]);
  });

  test("Should override default configuration", async () => {
    const overrides: CardanoTestWalletConfig = {
      networkId: 1,
    };

    const config: CardanoTestWalletConfig = { networkId: overrides.networkId };
    const extension = await loadTestExtension(WALLET_NAME, []);

    // overriding config
    addTestWalletConfig(config);

    const walletApi = await extension.enable();

    expect(await walletApi.getNetworkId()).toBe(overrides.networkId);
    expect(extension.supportedExtensions).toEqual([]);
  });
});
