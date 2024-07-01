import { describe, expect, test } from "@jest/globals";
import { mkCip95Wallet } from "../src/cardanoWallet";
import { ShelleyWallet } from "../src/crypto";

import {
  COSESign1,
  COSEKey,
  BigNum,
  Label,
  Int,
} from "@emurgo/cardano-message-signing-nodejs";

import {
  Ed25519Signature,
  PublicKey,
} from "@emurgo/cardano-serialization-lib-nodejs";

const eternalPayload = {
  signature:
    "845846a2012767616464726573735839006633e41eab3ae02578d1c2a6d1cc2e4d36b6a34b0a12e3e7995745313d234915a60cc51671e72aaa296f3b194f458d313d9fa9cfca4bb066a166686173686564f4587d546f2070726f636565642c20706c65617365207369676e2074686973206461746120746f2076657269667920796f7572206964656e746974792e205468697320656e737572657320746861742074686520616374696f6e2069732073656375726520616e6420636f6e6669726d7320796f7572206964656e746974792e58405e4bc8590794b7e91abe883af40a567380a5f3127ec2c0ce7aacf972b1a9257f9ec65e3ecc4b9e41e7070fc883b67cf12665dc101d8024b6b19129b849a80201",
  key: "a4010103272006215820136679540c10b97f80eebaf2ce53a68013604873de43cc4c4a985e056aee2fe8",
};

const namiPayload = {
  signature:
    "845846a201276761646472657373583900e0e25162dfe622841a7474876450334ee5eb5153e42262ed14f938d0ddf9d2eb6b1237420f9d717a7ffc2e58ecf9ffede6466974b0e84c80a166686173686564f4587d546f2070726f636565642c20706c65617365207369676e2074686973206461746120746f2076657269667920796f7572206964656e746974792e205468697320656e737572657320746861742074686520616374696f6e2069732073656375726520616e6420636f6e6669726d7320796f7572206964656e746974792e5840bf6da9eaa71c73ccc7a19c3d59809c5e1d8df752f4ce7d89ccaee14dec61cb94f5841915818e3d11160a8dd8d607895eaa2e072f4525e5206a410735e91c9209",
  key: "a40101032720062158204bc34b49ad3b8bb2db48245f2785c5f12095774a7a06faecd77c557f74f36c0c",
};

const testPayload = "Hello";

const payload =
  "Please sign this message to verify your identity at 19 June 2024 15:18:29";

describe("Signature verification", () => {
  test("Should sign and verify by wallet correctly", async function () {
    const shellyWallet = await ShelleyWallet.generate();

    const payloadHex = Buffer.from(payload).toString("hex");

    const signature = await shellyWallet.paymentKey.signRaw(
      Uint8Array.from(Buffer.from(payloadHex, "hex")),
    );

    const isVerified = await shellyWallet.paymentKey.verify(
      payloadHex,
      Buffer.from(signature).toString("hex"),
    );

    expect(isVerified).toBeTruthy();
  });

  test("Should verify signData", async () => {
    const shellyWallet = await ShelleyWallet.generate();
    const wallet = await mkCip95Wallet(shellyWallet, {});
    const payloadHex = Buffer.from(testPayload).toString("hex");

    const changeAddr = await wallet.getChangeAddress();
    console.log(payloadHex);
    const signedData = await wallet.signData(changeAddr, "48656c6c6f");

    // const signedData = eternalPayload;

    const decoded = COSESign1.from_bytes(
      Buffer.from(signedData.signature, "hex"),
    );
    const key = COSEKey.from_bytes(Buffer.from(signedData.key, "hex"));

    const pubKeyBytes = key
      .header(Label.new_int(Int.new_negative(BigNum.from_str("2"))))
      .as_bytes();

    const publicKey = PublicKey.from_bytes(pubKeyBytes);

    const actualPubKey = PublicKey.from_bytes(
      Buffer.from(shellyWallet.paymentKey.public),
    );

    const signature = Ed25519Signature.from_bytes(decoded.signature());

    console.log({
      signature: signedData,
    });
    const receivedData = decoded.signed_data().to_bytes();

    console.log(Buffer.from(receivedData).toString("hex"));

    // const isVerified = shellyWallet.paymentKey.verify(
    //   Buffer.from(receivedData).toString("hex"),
    //   Buffer.from(decoded.signature()).toString("hex"),
    // );
    const isVerified = publicKey.verify(receivedData, signature);

    expect(isVerified).toBeTruthy();
  });
});
