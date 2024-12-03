## Cardano Test Wallet

This JavaScript library injects a simulated Cardano wallet into your web application for testing purposes.

### Features

- Provides optional configuration for the wallet, including network ID, staking options, and Kuber API details.
- Creates a test Cardano wallet object for interacting with the Cardano testnet.

### Usage

1. **Load Extension:**<br>
   Use the `loadExtension` function to inject the wallet extension into your web application.

   ```ts
   import { loadExtension } from "cardano-test-wallet";
   loadExtension("myTestWallet");
   ```

2. **Import Test Wallet:**<br>
   If you wish to import your own custom wallet, use the `importTestWallet` `function.

   ```ts
   import { importTestWallet } from "cardano-test-wallet";
   importTestWallet(CustomWallet);
   ```

3. **Add wallet config:**<br>
   Set optional configurations for the wallet using the `addTestWalletConfig` function.

   ```ts
   import { addTestWalletConfig } from "cardano-test-wallet";

   addTestWalletConfig({
     kuberApiUrl: "https://prepod.kuber.cardanoapi.io",
     kuberApiKey: "your-api-key",
     blockfrostApiUrl: "https://cardano-preprod.blockfrost.io/api",
     blockfrostApiKey: "your-api-key",
   });
   ```

**Networks:**

- <span style="color:white">0 ➔ Testnet</span>
- <span style="color:red">1 ➔ Mainnet</span>

**Example:**

```ts
import {
  loadExtension,
  addTestWalletConfig,
  importTestWallet,
} from "cardano-test-wallet";
loadExtension("MyTestWallet");

importTestWallet(CustomWallet);

addTestWalletConfig({
  kuberApiUrl: "https://prepod.kuber.cardanoapi.io",
  kuberApiKey: "your-api-key",
  blockfrostApiUrl: "https://cardano-preprod.blockfrost.io/api",
  blockfrostApiKey: "your-api-key",
});

// Access the wallet after injection
const wallet = window.cardano.MyTestWallet;
// Use wallet functionalities here
```

**Kuber API:**

This library utilizes the Kuber API, a node interface similar to Blockfrost, for interacting with the Cardano testnet blockchain. You can generate a Kuber API key [here](https://kuberide.com/kuber/settings/api-keys/).

**Blockfrost API:**

This library utilizes the Blockfrost API to interact with the Cardano testnet blockchain. The Blockfrost API is used to submit transactions, especially since the Kuber API transaction submission takes longer than expected. You can generate a Blockfrost API key [here](https://blockfrost.io/dashboard).

**Security Note:**

Test wallets are for development and testing purposes only. Avoid using them in production environments due to security risks.

**Available Kuber URLs:**

- Prepod: [https://prepod.kuber.cardanoapi.io](https://prepod.kuber.cardanoapi.io)
- Preview: [https://preview.kuber.cardanoapi.io](https://preview.kuber.cardanoapi.io)
- Sanchonet: [https://sanchonet.kuber.cardanoapi.io](https://sanchonet.kuber.cardanoapi.io)
