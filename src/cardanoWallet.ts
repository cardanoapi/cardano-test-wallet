import * as blake from "blakejs";
import { blake2bHex } from "blakejs";
import { Buffer } from "buffer";
import { addExtension, Decoder, Encoder } from "cbor-x";
import {
  CardanoTestWallet,
  CardanoTestWalletConfig,
  CIP30Provider,
  Cip95Instance,
  KuberValue,
} from "../types";
import { ShelleyWallet } from "./crypto";
import kuberService from "./kuberService";
import * as SignatureBuilder from "./signatureBuilder";
import { KeyType } from "./signatureBuilder";

const cborxEncoder = new Encoder({
  mapsAsObjects: false,
  useRecords: false,
});

const cborxDecoder = new Decoder({ mapsAsObjects: false });

function computeTxHash(tx: string) {
  let decodedTx = cborxDecoder.decode(Buffer.from(tx, "hex"));
  const txBody = Uint8Array.from(cborxEncoder.encode(decodedTx[0]));
  return blake2bHex(txBody, undefined, 32);
}

class AuxData {
  value: any;

  constructor(value: any) {
    this.value = value;
  }
}

// this is required to override default behavior of AuxData
addExtension({
  Class: AuxData,
  tag: 259, // register our own extension code for 259 tag
  encode(instance, encode) {
    return encode(instance.value);
  },
  decode(data: any) {
    return new AuxData(data);
  },
});

/**
 * Creates a CIP-30  and CIP-95 compliant wallet instance.
 *
 * @param {ShelleyWallet=} wallet - The Shelley wallet to use. If not provided, a new wallet will be generated.
 * @param config
 * @returns {Promise<Cip95Instance>} A promise that resolves when the CIP-95 wallet is created.
 */

export async function mkCip95Wallet(
  wallet: ShelleyWallet,
  config?: CardanoTestWalletConfig,
) {
  const networkId = config?.networkId ?? 0; // Defaults to testnet

  const walletAddress = wallet.addressBech32(networkId);
  const walletAddressRaw = Buffer.from(wallet.addressRawBytes(networkId));
  const walletAddressHex = walletAddressRaw.toString("hex");

  const rewardAddr = Buffer.from(
    wallet.rewardAddressRawBytes(networkId),
  ).toString("hex");
  const stakePublicKey = Buffer.from(wallet.stakeKey.public).toString("hex");
  const walletInstance: Cip95Instance & {
    experimental: Record<string, CallableFunction>;
    address: string;
  } = {
    address: walletAddressHex,
    getBalance: async () => {
      return "0";
    },

    submitTx: async (tx) => {
      return await kuberService.submitTransaction(tx).then(async (res) => {
        return computeTxHash(tx);
      });
    },
    getUtxos: (p1, p2) =>
      getUtxosKuber(walletAddress, walletAddressRaw, p1, p2),
    getUsedAddresses: async () => [walletAddressHex],
    getUnusedAddresses: async () => [walletAddressHex],
    getChangeAddress: async () => walletAddressHex,
    getRewardAddresses: async () => [
      rewardAddr,
      ...(config.extraRewardAddresses ?? []),
    ],
    getNetworkId: async () => networkId,
    experimental: {
      on: (eventName, callback) => {
        return;
      },
      off: (eventName, callback) => {
        return;
      },
      getCollateral: () => {
        return "";
      },
    },
    cip95: {
      getPubDRepKey: async () => stakePublicKey,
      getUnregisteredPubStakeKeys: async () => [stakePublicKey],
      getRegisteredPubStakeKeys: async () => [
        stakePublicKey,
        ...(config.extraRegisteredPubStakeKeys ?? []),
      ],
    },
    // CIP-95 -----------------------------
    getActivePubStakeKeys: async () => [rewardAddr],

    signTx: async (tx, partialSign) => {
      // decode transaction body and calculate hash
      let decodedTx = cborxDecoder.decode(Buffer.from(tx, "hex"));
      const reEncodedTx = Buffer.from(cborxEncoder.encode(decodedTx)).toString(
        "hex",
      );

      if (tx != reEncodedTx) {
        console.warn("[CardanoTestWallet] Re-encoded tx is not same");
        console.warn("[CardanoTestWallet]   Starting Tx", tx);
        console.warn("[CardanoTestWallet] Re-Encoded Tx", reEncodedTx);
      }

      const txbody = Uint8Array.from(cborxEncoder.encode(decodedTx[0]));
      const txHash = blake.blake2b(txbody, undefined, 32);
      console.debug(
        "[CardanoTestWallet] Signing Tx hash=" +
          Buffer.from(txHash).toString("hex"),
      );

      // sign the transaction hash with payment key
      const paymentKeySig = await wallet.paymentKey.signRaw(txHash);

      // create witness set object
      const witness = new Map();
      const vkeyWitnesses = [[wallet.paymentKey.public, paymentKeySig]];

      if (config.enableStakeSigning ?? false) {
        console.debug("Signing stake key...");
        const stakeKeySig = await wallet.stakeKey.signRaw(txHash);
        vkeyWitnesses.push([wallet.stakeKey.public, stakeKeySig]);
      }

      witness.set(0, vkeyWitnesses);

      return Buffer.from(cborxEncoder.encode(witness)).toString("hex");
    },

    signData: async (address, payload) => {
      const accountKey = wallet.paymentKey;

      const protectedHeaders = new SignatureBuilder.HeaderMap();
      protectedHeaders.setAlgorithmId(SignatureBuilder.AlgorithmId.EDSA);
      protectedHeaders.setHeader("address", Buffer.from(address, "hex"));
      const protectedSerialized = protectedHeaders.serialize();

      const unprotectedHeaders = new SignatureBuilder.HeaderMap();
      unprotectedHeaders.setHeader("hashed", false);

      const headers = new SignatureBuilder.Headers(
        protectedSerialized,
        unprotectedHeaders,
      );

      const builder = new SignatureBuilder.COSESign1Builder(
        headers,
        Buffer.from(payload, "hex"),
      );

      const toSign = builder.makeDataToSign().toBytes();
      const signedSigStruc = await accountKey.signRaw(toSign);
      const coseSign1 = builder.build(signedSigStruc);

      const key = new SignatureBuilder.COSEKey(KeyType.OKP);
      key.setAlgorithmId(SignatureBuilder.AlgorithmId.EDSA);
      key.setHeader(-1, 6);
      key.setHeader(-2, Buffer.from(wallet.paymentKey.public));

      return {
        signature: Buffer.from(coseSign1.toBytes()).toString("hex"),
        key: Buffer.from(key.toBytes()).toString("hex"),
      };
    },

    getExtensions: () => [{ cip: 95 }],
  };
  return walletInstance;
}

/**
 * Creates a Cardano Wallet Extension with CIP-95 compliance and optional overrides.
 * the returned object can be injected to `window.cardano.demos` for testing wallet extension feature.
 *
 * @returns {Promise<CIP30Provider>} A promise that resolves with the created CIP-30 provider.
 */

export async function mkCardanoWalletExtension(
  cardanoTestWallet: CardanoTestWallet,
): Promise<CIP30Provider> {
  let enabled = false;

  return {
    apiVersion: "1.3.1",
    icon: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='309.36' y='12.441' width='121.115' height='472.347' style='fill: rgb(128  177  211)%3B'/%3E%3Cellipse style='fill: rgb(128  177  211)%3B' cx='231.272' cy='320.966' rx='171.791' ry='137.051'/%3E%3C/svg%3E",

    enable: async function () {
      enabled = true;
      const walletJson =
        cardanoTestWallet.wallet || (await ShelleyWallet.generate()).json();

      return await mkCip95Wallet(
        ShelleyWallet.fromJson(walletJson),
        cardanoTestWallet.config,
      );
    },

    isEnabled: async function () {
      return enabled;
    },

    name: cardanoTestWallet.walletName,
    supportedExtensions: cardanoTestWallet.supportedExtensions || [{ cip: 95 }],
  };
}

const getUtxosKuber = async (
  walletAddress,
  walletAddressRaw,
  amount,
  paginate,
) => {
  function kuberValuetoObject(
    value: KuberValue,
  ): [bigint, Map<Buffer, Map<Buffer, bigint>>] | bigint {
    const lovelace = BigInt(value.lovelace as bigint | number | string);
    let assets: Map<Buffer, Map<Buffer, bigint>> = new Map();
    for (let policy in value) {
      const assetMap = value[policy] as Record<string, bigint | number>;
      const policyBuffer = Buffer.from(policy, "hex");
      for (let tokenName in assetMap) {
        const tokenNameBuffer = Buffer.from(tokenName, "hex");
        if (assets.has(policyBuffer)) {
          assets
            .get(policyBuffer)
            .set(tokenNameBuffer, BigInt(assetMap[tokenName]));
        } else {
          let quantityMap = new Map();
          quantityMap.set(tokenNameBuffer, BigInt(assetMap[tokenName]));
          assets.set(policyBuffer, quantityMap);
        }
      }
    }

    if (assets.size > 0) {
      return [lovelace, assets];
    } else {
      return lovelace;
    }
  }

  const apiResponse = await kuberService.queryUtxos(walletAddress);
  return apiResponse.map((utxo) => {
    const txin = utxo.txin.split("#");
    return Buffer.from(
      cborxEncoder.encode([
        [Buffer.from(txin[0], "hex"), BigInt(txin[1])],
        [walletAddressRaw, kuberValuetoObject(utxo.value)],
      ]),
    ).toString("hex");
  });
};
