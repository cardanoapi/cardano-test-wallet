import { Encoder } from "cbor-x";
import { ShelleyWallet } from "./crypto";
import * as SignatureBuilder from "./signatureBuilder";
import { KeyType } from "./signatureBuilder";

const cborxEncoder = new Encoder({
  mapsAsObjects: false,
  useRecords: false,
});

export function serializeData(data: any) {
  return cborxEncoder.encode(data);
}

export async function signData(
  wallet: ShelleyWallet,
  address: string,
  payload: string
) {
  const accountKey = wallet.stakeKey;

  const protectedHeaders = new SignatureBuilder.HeaderMap();
  protectedHeaders.setAlgorithmId(SignatureBuilder.AlgorithmId.EDSA);
  protectedHeaders.setHeader("address", Buffer.from(address, "hex"));
  const protectedSerialized = protectedHeaders.serialize();

  const unprotectedHeaders = new SignatureBuilder.HeaderMap();
  unprotectedHeaders.setHeader("hashed", false);

  const headers = new SignatureBuilder.Headers(
    protectedSerialized,
    unprotectedHeaders
  );

  const builder = new SignatureBuilder.COSESign1Builder(
    headers,
    Buffer.from(payload, "hex")
  );

  const toSign = builder.makeDataToSign().toBytes();
  const signedSigStruc = await accountKey.signRaw(toSign);
  const coseSign1 = builder.build(signedSigStruc);

  const key = new SignatureBuilder.COSEKey(KeyType.OKP);
  key.setAlgorithmId(SignatureBuilder.AlgorithmId.EDSA);
  key.setHeader(-1, 6);
  key.setHeader(-2, Buffer.from(wallet.stakeKey.public));

  return {
    signature: Buffer.from(coseSign1.toBytes()).toString("hex"),
    key: Buffer.from(key.toBytes()).toString("hex"),
  };
}
