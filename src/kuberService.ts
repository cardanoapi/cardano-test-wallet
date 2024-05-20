import fetch, { BodyInit, RequestInit } from "node-fetch";
import { KuberValue } from "../types";

type KuberBalanceResponse = {
  address: string;
  txin: string;
  value: KuberValue;
};

interface CIPError {
  code: number;
  info: string;
}

const kuberService = {
  submitTransaction(tx: any) {
    return callKuber(
      "/api/v1/tx/submit",
      "POST",
      JSON.stringify({
        tx: {
          description: "",
          type: "Tx ConwayEra",
          cborHex: tx,
        },
      })
    );
  },

  queryUtxos(address: string): Promise<[KuberBalanceResponse]> {
    return callKuber("/api/v3/utxo?address=" + address) as Promise<
      [KuberBalanceResponse]
    >;
  },
};
async function callKuber(
  path: any,
  method: "GET" | "POST" = "GET",
  body?: BodyInit,
  contentType = "application/json"
) {
  // @ts-ignore
  const apiUrl = window.cardanoTestWallet.config.kuberApiUrl;
  // @ts-ignore
  const apiKey = window.cardanoTestWallet.config.kuberApiKey;

  if (!apiUrl) {
    throw Error("Kuber Api Url is missing.");
  }

  const url = apiUrl + path;

  const headers: Record<string, string> = {
    "api-key": apiKey,
  };
  if (contentType) {
    headers["content-type"] = contentType;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (method === "POST") {
    if (body) options.body = body;
  }

  return fetch(url, options).then(async (res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return res.text().then((txt) => {
        let err;
        let json: any;
        try {
          json = JSON.parse(txt);
          if (json) {
            err = {
              code: -1,
              info: `Tx Submission [Status ${res.status}] : ${
                json.message ? json.message : txt
              }`,
            } as CIPError;
          } else {
            err = {
              code: -1,
              info: `Tx Submission [Status ${res.status}] : ${txt}`,
            } as CIPError;
          }
        } catch (e) {
          err = {
            code: -1,
            info: `Tx Submission [Status ${res.status}] : ${txt}`,
          } as CIPError;
        }
        err.status = res.status;
        throw err;
      });
    }
  });
}

export default kuberService;
