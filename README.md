## Cardano Test Wallet

This JavaScript library injects a simulated Cardano wallet into your web application for testing purposes.

**Features:**

- Provides optional configuration for the wallet, including network ID, staking options, and Kuber API details.
- Creates a test Cardano wallet object for interacting with the Cardano testnet.

**Usage:**

1. **Include the Library:** Inject the `cardanoTestWallet` library into your web application.
2. **Optional Configuration:** Set the desired configuration using `window.cardanoTestWallet.config`.
   - `networkId` (optional): The network ID for the Cardano testnet you want to use. (Default 0)
   - `enableStakeSigning` (optional): Enables stake signing functionality. (Defaults false)
   - `extraRegisteredPubStakeKeys` (optional): Additional public stake keys for the wallet.
   - `extraRewardAddresses` (optional): Additional reward addresses for the wallet.
   - `kuberApiUrl`: URL for the Kuber API endpoint (node interface).
   - `kuberApiKey`: API key for the Kuber API (optional).

**Wallet name is required**
Initialize this before injecting the script.

```javascript
window.cardanoTestWallet.walletName = "MyTestWallet";
```

If you wish to create your own wallet, include it in window.cardanoTestWallet.wallet with the following structure:

```json
{
  payment: {
    private: string;
    public: string;
    pkh: string;
  };
  stake: {
    private: string;
    public: string;
    pkh: string;
  }
}
```

**Networks:**

- <span style="color:white">0 ➔ Testnet</span>
- <span style="color:red">1 ➔ Mainnet</span>

**Example:**

```javascript
window.cardanoTestWallet.walletName = "MyTestWallet";
// Inject the library (replace 'path/to/script.js' with the actual path)
<script src="path/to/script.js"></script>;

// Configure the wallet
window.cardanoTestWallet.config = {
  kuberApiUrl: "https://prepod.kuber.cardanoapi.io",
  kuberApiKey: "your-api-key",
};

// Access the wallet after injection
const wallet = window.cardano.MyTestWallet;
// Use wallet functionalities here
```

**Kuber API:**

This library utilizes the Kuber API, a node interface similar to Blockfrost, for interacting with the Cardano testnet blockchain. You can generate a Kuber API key [here](https://kuberide.com/kuber/settings/api-keys/).

**Security Note:**

Test wallets are for development and testing purposes only. Avoid using them in production environments due to security risks.

**Available Kuber URLs:**

- Prepod: [https://prepod.kuber.cardanoapi.io](https://prepod.kuber.cardanoapi.io)
- Preview: [https://preview.kuber.cardanoapi.io](https://preview.kuber.cardanoapi.io)
- Sanchonet: [https://sanchonet.kuber.cardanoapi.io](https://sanchonet.kuber.cardanoapi.io)
