import fs from "fs";
import { CookieType } from "./types.js";

const saveFile = async (fileName: string, fileData: any) => {
  console.info("✅ Saving file...");
  try {
    let fsStatus = fs.writeFileSync(fileName, fileData);
    console.log("✅ Saved Data");
    console.log("Press ⬆ or ⬇ for selection menu");
    return true;
  } catch (err) {
    console.log("Unable to store file data", err);
    return false;
  }
};

const readFiles = async (fileName: string) => {
  try {
    const fileData = fs.readFileSync(fileName);
    console.info("✅ File read successful");
    return fileData;
  } catch (err) {
    return false;
  }
};
const convertBinaryJSON = async (data: any, type: string) => {
  if (type === "binary") {
    return Buffer.from(JSON.stringify(data));
  }

  if (type === "JSON") {
    return JSON.parse(data.toString());
  }
};

const checkCookieExpiry = async (cookie: CookieType) => {
  if (!Array.isArray(cookie) || cookie.length === 0) {
    return false;
  }
  const currentUnixTimestamp = Math.floor(Date.now() / 1e3);
  let expiry = cookie.every(
    (item) => item.expires && item.expires >= currentUnixTimestamp
  );
  return expiry;
};
export { saveFile, convertBinaryJSON, checkCookieExpiry, readFiles };
