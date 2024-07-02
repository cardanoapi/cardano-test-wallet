import { serializeData } from "./utils";
import { Header } from "@emurgo/cardano-serialization-lib-nodejs";
import { COSESign } from "@emurgo/cardano-message-signing-nodejs";

export enum AlgorithmId {
  EDSA = -8,
}

export enum KeyType {
  OKP = 1,
}

type SignatureContext = "Signature1";

type ProtectedSerialized = Uint8Array;

// Class representing header map with methods for setting, getting, and serialization
export class HeaderMap {
  private readonly map: Map<any, any>;

  constructor() {
    this.map = new Map();
  }

  setAlgorithmId(value: AlgorithmId) {
    this.map.set(1, value);
  }

  setHeader(key: any, value: any) {
    this.map.set(key, value);
  }

  serialize(): Uint8Array {
    return serializeData(this.map);
  }

  getData() {
    return this.map;
  }
}

// Class representing the structure of a signature
export class SigStructure {
  private readonly structureData: any[];

  constructor(
    private readonly context: SignatureContext,
    private readonly protectedSerialized: ProtectedSerialized,
    private readonly externalAad: Buffer,
    private readonly payload: Buffer,
  ) {
    this.structureData = [context, protectedSerialized, externalAad, payload];
  }

  toBytes(): Uint8Array {
    return serializeData(this.structureData);
  }
}

// Class representing headers with protected and unprotected parts
export class Headers {
  constructor(
    readonly protectedHeaders: ProtectedSerialized,
    readonly unprotectedHeaders: HeaderMap,
  ) {}
}

export class COSESign1 {
  constructor(
    private readonly headers: Headers,
    private readonly payload: Buffer,
    private readonly signedSigStructure: Buffer,
  ) {}

  toBytes(): Uint8Array {
    const data = [
      this.headers.protectedHeaders,
      this.headers.unprotectedHeaders.getData(),
      this.payload,
      this.signedSigStructure,
    ];

    return serializeData(data);
  }
}
// Builder class for COSE_Sign1 structure
export class COSESign1Builder {
  constructor(
    private readonly headers: Headers,
    private readonly payload: Buffer,
  ) {}

  // Create SigStructure instance for signing
  makeDataToSign(): SigStructure {
    return new SigStructure(
      "Signature1",
      this.headers.protectedHeaders,
      Buffer.from(new Uint8Array(0)),
      this.payload,
    );
  }

  build(signedSignatureStruc: Uint8Array) {
    return new COSESign1(
      this.headers,
      this.payload,
      Buffer.from(signedSignatureStruc),
    );
  }
}

// class for COSE_KEY structure
export class COSEKey {
  private readonly keyMap: Map<any, any>;

  constructor(keyType: KeyType) {
    this.keyMap = new Map();
    this.keyMap.set(1, keyType);
  }

  setAlgorithmId(value: AlgorithmId) {
    this.keyMap.set(3, value);
  }
  setHeader(key: any, value: any) {
    this.keyMap.set(key, value);
  }

  toBytes(): Uint8Array {
    return serializeData(this.keyMap);
  }
}
