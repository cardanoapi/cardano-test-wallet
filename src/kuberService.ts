import { KuberValue } from "./types";
import fetch, { BodyInit, RequestInit } from "node-fetch";

type KuberBalanceResponse = {
  address: string;
  txin: string;
  value: KuberValue;
};

interface CIPError {
  code: number;
  info: string;
}
const config = {
  apiUrl: window["cardanoTestWallet"]["config"]["kuberApiUrl"],
  apiKey: window["cardanoTestWallet"]["config"]["kuberApiKey"],
};

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
  if (!config.apiUrl) {
    throw Error("Kuber Api Url is missing.");
  }

  if (!config.apiKey) {
    throw Error("Kuber Api key is missing.");
  }

  const url = config.apiUrl + path;

  const headers: Record<string, string> = {
    "api-key": config.apiKey,
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
              info: `KuberApi [Status ${res.status}] : ${
                json.message ? json.message : txt
              }`,
            } as CIPError;
          } else {
            err = {
              code: -1,
              info: `KuberApi [Status ${res.status}] : ${txt}`,
            };
          }
        } catch (e) {
          err = {
            code: -1,
            info: `KuberApi [Status ${res.status}] : ${txt}`,
          };
        }
        err.status = res.status;
        throw err;
      });
    }
  });
}

export default kuberService;
