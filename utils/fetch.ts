import puppeteer from "puppeteer";
import { generateCheckCode } from "./checkcode.js";
import { TokenPayloadType, UserType, CookieType } from "./types.js";

import {
  saveFile,
  convertBinaryJSON,
  checkCookieExpiry,
  readFiles,
} from "./extra.js";

const fileName = "users.json";
const cookieFileName = "auth.bin";

const showLoading = () => {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let index = 0;

  return setInterval(() => {
    process.stdout.write(`  \r${frames[index++ % frames.length]}   `);
  }, 100);
};

const ExtractUserAccountInfo = async (accessTokenPayload: TokenPayloadType) => {
  const header = new Headers();

  header.append("Content-Type", "application/json");

  const headerData = {
    method: "POST",
    headers: header,
    body: JSON.stringify(accessTokenPayload),
  };
  try {
    const response = await fetch(
      "https://api.challenge.sunvoy.com/api/settings",
      headerData
    );

    if (!response.ok) {
      return;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Something went wrong");
    return;
  }
};

const LogOut = async () => {
  try {
    const checkCookie = await readFiles(cookieFileName);
    if (checkCookie && checkCookie.length === 0) {
      console.table({ "Login Status  ": "Already logout " });
      return;
    }
    const fileStatus = await saveFile("auth.bin", "");

    if (fileStatus) {
      console.table({ "Login Status  ": "Log out successful" });
    }
  } catch (err) {
    console.log("Failed to logout");
  }
};

const CheckLoginStatus = async () => {
  let isValidCookie = false;
  let storedCookieData = null;
  try {
    const storedCookieBinary = await readFiles(cookieFileName);
    if (storedCookieBinary && storedCookieBinary.length !== 0) {
      storedCookieData = await convertBinaryJSON(storedCookieBinary, "JSON");
      isValidCookie = await checkCookieExpiry(storedCookieData);
    }
    if (!storedCookieBinary || !isValidCookie) {
      console.table({ "Login Status  ": "LoggedOut" });
      return;
    }

    if (isValidCookie) {
      console.table({ "Login Status  ": "LoggedIn" });
      console.log(
        "\n\n:::::::::::::::::::::::: Cookie ::::::::::::::::::::::::"
      );

      let reformat = storedCookieData.reduce((acc: any, cur: any) => {
        acc.push({
          name: cur.name,
          value: cur.value.substring(0, 5) + "...",
          domain: cur.domain,
          expires: new Date(cur.expires),
        });
        return acc;
      }, []);
      console.table(reformat);
      return;
    }
    console.table({ "Login Status  ": "LoggedOut" });
  } catch (err) {
    console.log("Failed to access log status", err);
  }
};
const ExtractUserData = async (userLogCredentials: {
  username: string;
  password: string;
}) => {
  const { username, password } = userLogCredentials;

  let rawCookie = null;
  let isValidCookie = false;

  if ((!username && !password) || username === "" || password === "") {
    console.log("Please provide login crediantials");
    return;
  }

  const loader = showLoading();
  const storedCookieBinary = await readFiles(cookieFileName);

  if (storedCookieBinary && storedCookieBinary.length !== 0) {
    const storedCookieData = await convertBinaryJSON(
      storedCookieBinary,
      "JSON"
    );
    isValidCookie = await checkCookieExpiry(storedCookieData);
    if (isValidCookie) {
      rawCookie = storedCookieData;
    }
  }

  if (!isValidCookie) {
    rawCookie = await ExtractSessionCookie(username, password);

    if (!rawCookie || (Array.isArray(rawCookie) && rawCookie.length === 0)) {
      clearInterval(loader);
      console.log("\n\n");
      console.table({ "Failed ": "Invalid user name or password" });
      console.log("Press ⬆ or ⬇ for selection menu");
      return;
    }
    const AuthBinaryData = await convertBinaryJSON(rawCookie, "binary");

    console.log("\n\n✅ Saving session...");
    saveFile("auth.bin", AuthBinaryData);
  }

  if (!rawCookie) {
    console.log("Failed to extract data");
    return;
  }

  const cookies = rawCookie
    .map((cookie: CookieType) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const accessTokenPayload = await ExtractAccessToken(rawCookie);

  const userAccountInfo = await ExtractUserAccountInfo(accessTokenPayload);

  const header = new Headers();
  header.append("Cookie", cookies);
  const headerData = {
    method: "POST",
    headers: header,
  };
  try {
    const response = await fetch(
      "https://challenge.sunvoy.com/api/users",
      headerData
    );

    if (!response.ok) {
      console.log("Failed to connect to server");
      return;
    }

    const data = await response.json();
    let userData = { users: [...data], LoggedUserAccount: userAccountInfo };
    clearInterval(loader);
    console.log(
      "\n\n::::::::::::::::::::::::Fetched User Data::::::::::::::::::::::::"
    );
    console.table(data);
    console.table(userAccountInfo);
    saveFile(fileName, JSON.stringify(userData));
  } catch (err) {
    console.log("ERROR", err);
  } finally {
    clearInterval(loader);
  }
};

const Account = async () => {
  try {
    const storedUserData: any = await readFiles(fileName);

    if (!storedUserData || storedUserData.length === 0) {
      console.table({ "Login Status  ": "Please login to fetch account info" });
      return;
    }

    const userData = JSON.parse(storedUserData);

    if (userData && userData.length !== 0) {
      console.log(
        "\n\n:::::::::::::::::::::::: Account ::::::::::::::::::::::::"
      );
      console.table(userData.LoggedUserAccount);
      return;
    }
  } catch (err) {
    console.log("Failed to access log status", err);
  }
};

const Users = async () => {
  try {
    const storedUserData: any = await readFiles(fileName);
    if (!storedUserData || storedUserData.length === 0) {
      console.table({ "Login Status  ": "Please login to fetch user info" });
      return;
    }

    const userData = JSON.parse(storedUserData);
    if (userData.length !== 0) {
      console.log(
        "\n\n:::::::::::::::::::::::: Users ::::::::::::::::::::::::"
      );
      console.table(userData.users);
      return;
    }
  } catch (err) {
    console.log("Failed to access log status", err);
  }
};

const ExtractSessionCookie = async (username: string, password: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://challenge.sunvoy.com/login");
    await page.waitForSelector('input[name="nonce"]');

    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const cookies = await page.cookies();
    if (!cookies) {
      console.log("Invalid username and password");

      return;
    }
    console.log("\n\n📶 Connection successful");
    return cookies;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "TimeoutError") {
        console.log("\n\n📶 Connection successful");
        // console.log("Invalid username or password");
      }
    }
  } finally {
    await browser.close();
  }
  return null;
};

const ExtractAccessToken = async (cookie: any) => {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  await page.setCookie(...cookie);
  await page.goto("https://challenge.sunvoy.com/settings/tokens", {
    waitUntil: "networkidle2",
  });
  let AccessTokenPayload;
  AccessTokenPayload = await page.evaluate(() => {
    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    const payload: Record<string, any> = {};

    hiddenInputs.forEach((input) => {
      payload[(input as HTMLInputElement).id] = (
        input as HTMLInputElement
      ).value;
    });
    return payload;
  });

  AccessTokenPayload = {
    ...AccessTokenPayload,
    timestamp: Math.floor(new Date().getTime() / 1e3),
  };
  await browser.close();

  let { checkcode } = generateCheckCode(AccessTokenPayload);

  return { ...AccessTokenPayload, checkcode: checkcode };
};

export {
  ExtractUserData,
  CheckLoginStatus,
  ExtractSessionCookie,
  Account,
  Users,
  LogOut,
  ExtractAccessToken,
};
