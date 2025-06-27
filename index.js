const config = require("./settings.js");
const {
  default: coffeeConnect,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const chalk = require("chalk");
const path = require("path");
const Jimp = require("jimp");
const readline = require("readline");
const NodeCache = require('node-cache');
const msgRetryCounterCache = new NodeCache();
const _0x27adec = {
  "input": process.stdin,
  "output": process.stdout
};
const rl = readline.createInterface(_0x27adec);
const question = _0x538f42 => new Promise(_0xfde36f => {
  if (rl.closed) {
    _0xfde36f('');
  } else {
    rl.question(_0x538f42, _0xfde36f);
  }
});
let store = null;
global.phoneNumber = null;
global.countryCode = null;
module.exports = async function startCoffee() {
  try {
    if (!config.auth || !config.sessionFile) {
      console.log("Invalid config in settings.js!");
      process.exit(0x1);
    }
    const _0x5063e8 = config.auth.toLowerCase() === "pairing";
    const _0x3d1e59 = config.auth.toLowerCase() === 'qr';
    if (_0x5063e8 && !global.phoneNumber) {
      for (let _0x48cd6a = 0x0; _0x48cd6a < 0x3; _0x48cd6a++) {
        let _0x76dd56 = await question(chalk.cyan("Enter your country code (e.g., 91 for India): "));
        _0x76dd56 = _0x76dd56.trim().replace(/\D/g, '');
        if (!_0x76dd56 || _0x76dd56.length < 0x1 || _0x76dd56.length > 0x4) {
          console.log(chalk.redBright("Invalid country code! Try again."));
          continue;
        }
        global.countryCode = _0x76dd56;
        let _0x3afe3f = await question(chalk.cyan("Enter your phone number (without country code): "));
        _0x3afe3f = _0x3afe3f.trim().replace(/\D/g, '');
        if (!_0x3afe3f || _0x3afe3f.length < 0x6 || _0x3afe3f.length > 0xf) {
          console.log(chalk.redBright("Invalid phone number! Try again."));
          continue;
        }
        global.phoneNumber = '+' + _0x76dd56 + _0x3afe3f;
        console.log(chalk.green(''));
        break;
      }
      if (!global.phoneNumber) {
        console.log(chalk.redBright("Tried 3 times, exiting!"));
        process.exit(0x1);
      }
      if (!rl.closed) {
        rl.close();
      }
    }
    const {
      state: _0x5aa693,
      saveCreds: _0x49b327
    } = await useMultiFileAuthState(config.sessionFile);
    const _0x4ce37e = {
      level: "silent"
    };
    store = makeCacheableSignalKeyStore(_0x5aa693.keys, pino(_0x4ce37e));
    const {
      version: _0x26c70a,
      isLatest: _0x473f0b
    } = await fetchLatestBaileysVersion();
    console.log("Using WhatsApp v" + _0x26c70a.join('.') + ", isLatest: " + _0x473f0b);
    const _0x224a1d = {
      'level': 'silent'
    };
    const _0x12d270 = {
      "creds": _0x5aa693.creds,
      "keys": store
    };
    const _0x571e8e = coffeeConnect({
      'version': _0x26c70a,
      'logger': pino(_0x224a1d),
      'auth': _0x12d270,
      'patchMessageBeforeSending': _0x589673 => _0x589673,
      'msgRetryCounterCache': msgRetryCounterCache
    });
    _0x571e8e.ev.on("creds.update", _0x49b327);
    if (_0x5063e8 && !_0x571e8e.authState.creds.registered) {
      const _0x2382bb = global.phoneNumber.replace(/[^0-9]/g, '');
      setTimeout(async () => {
        const _0x141456 = await _0x571e8e.requestPairingCode(_0x2382bb);
        const _0x4bbede = _0x141456.match(/.{1,4}/g)?.['join']('-') || _0x141456;
        console.log(chalk.greenBright("Your pairing code: "), _0x4bbede);
      }, 0xbb8);
    }
    if (_0x3d1e59) {
      _0x571e8e.ev.on("connection.update", async _0xfb5fde => {
        const {
          qr: _0x13f928
        } = _0xfb5fde;
        if (_0x13f928) {
          console.log(chalk.green("Scan this QR code in WhatsApp: " + _0x13f928));
        }
      });
    }
    _0x571e8e.ev.on("connection.update", async _0x18fd8e => {
      const {
        connection: _0x5e3bd4,
        lastDisconnect: _0x519748
      } = _0x18fd8e;
      if (_0x5e3bd4 === "close") {
        const _0x359036 = _0x519748?.["error"]?.["output"]?.["statusCode"] || 0x0;
        const _0x1520d6 = [DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.restartRequired, DisconnectReason.timedOut, 0x203];
        if (_0x359036 === DisconnectReason.badSession) {
          console.log("Session corrupted, delete and re-authenticate!");
          await cleanSessionFiles();
          process.exit(0x1);
        } else {
          if (_0x359036 === DisconnectReason.connectionReplaced) {
            console.log("New session opened elsewhere. Close it first!");
            await cleanSessionFiles();
            process.exit(0x1);
          } else {
            if (_0x359036 === DisconnectReason.loggedOut) {
              console.log("Device logged out. Cleaning session...");
              await cleanSessionFiles();
              global.phoneNumber = null;
              process.exit(0x1);
            } else if (_0x1520d6.includes(_0x359036)) {
              console.log("Connection closed, retrying...");
              setTimeout(() => startCoffee(), 0x1388);
            } else {
              console.log("Unknown error: " + _0x359036);
              process.exit(0x1);
            }
          }
        }
      } else {
        if (_0x5e3bd4 === "open") {
          const _0x2d9439 = _0x571e8e.user.name || config.BotName || 'Bot';
          const _0x4cc430 = _0x571e8e.user.id.split(':')[0x0];
          console.log("==========================");
          console.log(chalk.cyan("• User Info"));
          console.log(chalk.cyan("- Name: " + _0x2d9439));
          console.log(chalk.cyan("- Number: " + _0x4cc430));
          console.log(chalk.cyan("- Status: Connected"));
          console.log("==========================");
          try {
            const _0x158bac = {
              "text": "Thanks for using this bot!\nHave a great day!\nㅤㅤㅤㅤㅤㅤㅤㅤㅤ~ Aeon"
            };
            await _0x571e8e.sendMessage(_0x4cc430 + '@s.whatsapp.net', _0x158bac);
          } catch (_0x25108c) {
            console.error("Failed to send self-message:", _0x25108c);
          }
          await setProfilePicture(_0x571e8e);
          console.log(chalk.greenBright("Profile picture set successfully!"));
          await _0x571e8e.logout();
          console.log(chalk.yellowBright("Logged out successfully!"));
          await cleanSessionFiles();
          console.log(chalk.greenBright("Done! Exiting now..."));
          process.exit(0x0);
        }
      }
    });
  } catch (_0x3838a5) {
    console.error("Something went wrong:", _0x3838a5);
    if (!rl.closed) {
      rl.close();
    }
    process.exit(0x1);
  }
};
async function setProfilePicture(_0x3bd8b6) {
  try {
    if (!fs.existsSync("./profile")) {
      console.error("Profile folder not found!");
      process.exit(0x1);
    }
    const _0x563743 = fs.readdirSync("./profile");
    const _0x494767 = _0x563743.filter(_0x45d66e => ['.jpg', '.jpeg', ".png"].includes(path.extname(_0x45d66e).toLowerCase()));
    if (_0x494767.length === 0x0) {
      console.error("No images found in profile folder!");
      process.exit(0x1);
    }
    const _0x1a626f = path.join("./profile", _0x494767[0x0]);
    console.log(chalk.greenBright("Profile picture selected: " + _0x494767[0x0]));
    const _0x459a3e = await Jimp.read(_0x1a626f);
    const _0x3cc31a = _0x459a3e.crop(0x0, 0x0, _0x459a3e.getWidth(), _0x459a3e.getHeight());
    const _0x6087a = await _0x3cc31a.scaleToFit(0x2d0, 0x2d0);
    const _0x1356bc = await _0x6087a.getBufferAsync(Jimp.MIME_JPEG);
    const _0x698f84 = {
      to: 's.whatsapp.net',
      type: "set",
      xmlns: 'w:profile:picture'
    };
    const _0x3f5b90 = {
      type: "image"
    };
    const _0xd33475 = {
      tag: 'picture',
      "attrs": _0x3f5b90,
      "content": _0x1356bc
    };
    const _0x4a24a4 = {
      "tag": 'iq',
      "attrs": _0x698f84,
      content: [_0xd33475]
    };
    await _0x3bd8b6.query(_0x4a24a4);
  } catch (_0x1c9a5a) {
    console.error("Error setting profile picture:", _0x1c9a5a);
  }
}
const cleanSessionFiles = async () => {
  try {
    if (fs.existsSync("./Session")) {
      const _0x1889cd = {
        "recursive": true,
        "force": true
      };
      fs.rmSync("./Session", _0x1889cd);
      console.log(chalk.greenBright("Session folder deleted successfully!"));
    }
  } catch (_0x52c646) {
    console.error("Error cleaning session files:", _0x52c646);
  }
};
