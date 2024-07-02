import { Encoder } from "cbor-x";

const cborxEncoder = new Encoder({
  mapsAsObjects: false,
  useRecords: false,
});

export function serializeData(data: any) {
  return cborxEncoder.encode(data);
}
