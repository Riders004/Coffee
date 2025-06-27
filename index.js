const config = require("./settings.js");
const {
  default: coffeeConnect,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) =>
  new Promise((resolve) => {
    if (rl.closed) return resolve('');
    rl.question(q, resolve);
  });

global.phoneNumber = null;
global.countryCode = null;

module.exports = async function startCoffee() {
  try {
    if (!config.auth || !config.sessionFile) {
      console.log("Invalid config in settings.js!");
      process.exit(1);
    }

    const isPairing = config.auth.toLowerCase() === "pairing";
    const isQR = config.auth.toLowerCase() === "qr";

    if (isPairing && !global.phoneNumber) {
      for (let i = 0; i < 3; i++) {
        let code = await ask(chalk.cyan("Enter your country code (e.g., 91 for India): "));
        code = code.trim().replace(/\D/g, '');

        if (!code || code.length < 1 || code.length > 4) {
          console.log(chalk.redBright("Invalid country code! Try again."));
          continue;
        }

        global.countryCode = code;

        let number = await ask(chalk.cyan("Enter your phone number (without country code): "));
        number = number.trim().replace(/\D/g, '');

        if (!number || number.length < 6 || number.length > 15) {
          console.log(chalk.redBright("Invalid phone number! Try again."));
          continue;
        }

        global.phoneNumber = '+' + code + number;
        console.log(chalk.green(''));
        break;
      }

      if (!global.phoneNumber) {
        console.log(chalk.redBright("Tried 3 times, exiting!"));
        process.exit(1);
      }

      if (!rl.closed) rl.close();
    }

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionFile);
    const store = makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }));

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

    const socket = coffeeConnect({
      version,
      logger: pino({ level: "silent" }),
      auth: { creds: state.creds, keys: store },
      patchMessageBeforeSending: msg => msg,
    });

    socket.ev.on("creds.update", saveCreds);

    if (isPairing && !socket.authState.creds.registered) {
      const digits = global.phoneNumber.replace(/\D/g, '');
      setTimeout(async () => {
        const pairingCode = await socket.requestPairingCode(digits);
        const formatted = pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode;
        console.log(chalk.greenBright("Your pairing code:"), formatted);
      }, 3000);
    }

    if (isQR) {
      socket.ev.on("connection.update", async ({ qr }) => {
        if (qr) console.log(chalk.green("Scan this QR code in WhatsApp:"), qr);
      });
    }

    socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode || 0;
        const retryable = [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.restartRequired,
          DisconnectReason.timedOut,
          403
        ];

        switch (code) {
          case DisconnectReason.badSession:
            console.log("Bad session, delete and re-authenticate.");
            await cleanSessionFiles();
            process.exit(1);
          case DisconnectReason.connectionReplaced:
            console.log("Session replaced. Close other instances.");
            await cleanSessionFiles();
            process.exit(1);
          case DisconnectReason.loggedOut:
            console.log("Logged out. Cleaning session...");
            await cleanSessionFiles();
            process.exit(1);
          default:
            if (retryable.includes(code)) {
              console.log("Retrying connection...");
              setTimeout(() => startCoffee(), 5000);
            } else {
              console.log("Unknown disconnect reason:", code);
              process.exit(1);
            }
        }
      } else if (connection === "open") {
        const name = socket.user.name || config.BotName || "Bot";
        const number = socket.user.id.split(":")[0];

        console.log("==========================");
        console.log(chalk.cyan("• User Info"));
        console.log(chalk.cyan("- Name: " + name));
        console.log(chalk.cyan("- Number: " + number));
        console.log(chalk.cyan("- Status: Connected"));
        console.log("==========================");

        try {
          await socket.sendMessage(number + "@s.whatsapp.net", {
            text: "Thanks for using this bot!\nHave a great day!\n~ Aeon"
          });
        } catch (err) {
          console.error("Send message failed:", err);
        }

        await setProfilePicture(socket);
        console.log(chalk.greenBright("Profile picture set!"));

        await socket.logout();
        console.log(chalk.yellowBright("Logged out."));

        await cleanSessionFiles();
        console.log(chalk.greenBright("Done! Exiting."));
        process.exit(0);
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    if (!rl.closed) rl.close();
    process.exit(1);
  }
};

async function setProfilePicture(sock) {
  const imagePath = path.join(__dirname, "profile", "profile.jpg");
  if (!fs.existsSync(imagePath)) {
    console.error("No profile picture uploaded.");
    return;
  }

  const buffer = fs.readFileSync(imagePath);

  await sock.query({
    tag: "iq",
    attrs: {
      to: "s.whatsapp.net",
      type: "set",
      xmlns: "w:profile:picture",
    },
    content: [{
      tag: "picture",
      attrs: { type: "image" },
      content: buffer
    }]
  });
}

async function cleanSessionFiles() {
  try {
    if (fs.existsSync("./Session")) {
      fs.rmSync("./Session", { recursive: true, force: true });
      console.log(chalk.greenBright("Session deleted."));
    }
  } catch (err) {
    console.error("Failed to clean session:", err);
  }
}
