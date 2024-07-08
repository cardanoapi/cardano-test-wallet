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

const payload =
  "Please sign this message to verify your identity at 19 June 2024 15:18:29";

describe("Signature verification", () => {
  test("Should sign and verify by wallet correctly", async function () {
    const shellyWallet = await ShelleyWallet.generate();

    const payloadHex = Buffer.from(payload).toString("hex");

    const signature = await shellyWallet.paymentKey.signRaw(
      Uint8Array.from(Buffer.from(payloadHex, "hex"))
    );

    const isVerified = await shellyWallet.paymentKey.verify(
      payloadHex,
      Buffer.from(signature).toString("hex")
    );

    expect(isVerified).toBeTruthy();
  });

  test("Should verify signData", async () => {
    const wallet = await mkCip95Wallet(await ShelleyWallet.generate(), {
      networkId: 1,
    });
    const payloadHex = Buffer.from("Hello").toString("hex");
    const changeAddr = await wallet.getChangeAddress();

    const signedData = await wallet.signData(changeAddr, payloadHex);

    // Api logic
    const decoded = COSESign1.from_bytes(
      Buffer.from(signedData.signature, "hex")
    );

    const key = COSEKey.from_bytes(Buffer.from(signedData.key, "hex"));
    const pubKeyBytes = key
      .header(Label.new_int(Int.new_negative(BigNum.from_str("2"))))
      .as_bytes();
    const publicKey = PublicKey.from_bytes(pubKeyBytes);

    const signature = Ed25519Signature.from_bytes(decoded.signature());
    const receivedData = decoded.signed_data().to_bytes();

    const isVerified = publicKey.verify(receivedData, signature);

    expect(isVerified).toBeTruthy();
  });
});
