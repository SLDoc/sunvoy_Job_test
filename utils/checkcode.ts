import crypto from "crypto";
import { TokenPayloadType } from "./types.js";
function generateCheckCode(data: TokenPayloadType) {
  const secretKey = "mys3cr3t";
  const sortedData = Object.keys(data)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(data[key])}`)
    .join("&");

  const hash = crypto
    .createHmac("sha1", secretKey)
    .update(sortedData)
    .digest("hex")
    .toUpperCase();

  return {
    payload: sortedData,
    checkcode: hash,
    fullPayload: `${sortedData}&checkcode=${hash}`,
  };
}

export { generateCheckCode };
