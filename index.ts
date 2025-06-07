import {
  ExtractUserData,
  CheckLoginStatus,
  Account,
  Users,
  LogOut,
} from "./utils/fetch.js";

import inquirer from "inquirer";

const inq = inquirer.createPromptModule();
let exit = false;

process.on("SIGINT", () => {
  exit = true;
  console.log("Exiting program...");
  process.exit(0);
});
const getUserData = async () => {
  try {
    const inputs = await inq([
      { type: "input", name: "username", message: "Enter user name for login" },
      { type: "password", name: "password", message: "Enter password" },
    ]);
    ExtractUserData({ username: inputs.username, password: inputs.password });
  } catch (err) {
    console.log("Faild to extract data");
  }
};

const getUserEmailPassword = async () => {
  while (!exit) {
    const select = await inq([
      {
        type: "list",
        name: "choice",
        message: "\n\nSelect from menu",
        choices: ["Login", "Account", "User", "Log Status", "Logout", "exit"],
      },
    ]);

    switch (select.choice) {
      case "Login":
        await getUserData();
        break;
      case "User":
        await Users();
        break;
      case "Log Status":
        await CheckLoginStatus();
        break;
      case "Account":
        await Account();
        break;
      case "Logout":
        await LogOut();
        break;
      case "exit":
        exit = true;
        break;
    }
  }
};

getUserEmailPassword();
