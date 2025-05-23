# ☕ **Coffee Bot**

## What is Coffee Bot?
**Coffee Bot** is a lightweight **WhatsApp Bot** written in **Node.js** that automatically updates your WhatsApp profile picture. It supports **custom sizes**.

## 🚀 **Features**

- **Sets WhatsApp DP** from `profile/` folder.
- **Secure login** using pairing codes.
- **Cleans up** session files like `Session/` after completion.
- Works on **Windows**, **Mac**, and **Linux**.

## ⚙️ **Requirements**

- **Internet connection**
- **Node.js**: v21.x or higher
- **npm**: Included with Node.js
- **WhatsApp account**: Valid phone number (e.g., `+91629717594x`)
- **Profile picture**: JPG/PNG in `profile/` folder (e.g., `profile.jpg`)

## 📥 **Setup**

### 🔧 **Install Node.js, npm, and Git**

<details>
  <summary><strong>🪟 Install for Windows</strong></summary>

#### 1. Install Node.js
- Download and install Node.js from: [https://nodejs.org](https://nodejs.org)

#### 2. Install Git (Optional, if you don't have Git installed)
- Download and install Git from: [https://git-scm.com/downloads](https://git-scm.com/downloads)

#### 3. Verify Installation
```bash
node -v
npm -v
git --version
```

#### 4. Clone the Repository
```bash
git clone https://github.com/Aeon-San/Coffee.git
cd Coffee
```

#### 5. Install Dependencies
```bash
npm install
```

#### 6. Configure Settings
Create or edit the `settings.js` file with the following content:
```javascript
module.exports = {
  auth: "pairing",
  sessionFile: "./Session",
  BotName: "Coffee Bot",
  additionalConfig: { proxy: null, retryCount: 5 },
};
```

#### 7. Add Profile Picture
Place a JPG or PNG file inside the `profile/` folder (e.g. `profile.jpg`).

#### 8. Start the Bot
```bash
npm start
```
</details>

<details>
  <summary><strong>🍏 Install for macOS</strong></summary>

#### 1. Install Node.js
- Install Node.js using Homebrew:
  ```bash
  brew install node
  ```
  Or download from: [https://nodejs.org](https://nodejs.org)

#### 2. Install Git (Optional, if you don't have Git installed)
- Install Git using Homebrew:
  ```bash
  brew install git
  ```

#### 3. Verify Installation
```bash
node -v
npm -v
git --version
```

#### 4. Clone the Repository
```bash
git clone https://github.com/Aeon-San/Coffee.git
cd Coffee
```

#### 5. Install Dependencies
```bash
npm install
```

#### 6. Configure Settings
Create or edit the `settings.js` file with the following content:
```javascript
module.exports = {
  auth: "pairing",
  sessionFile: "./Session",
  BotName: "Coffee Bot",
  additionalConfig: { proxy: null, retryCount: 5 },
};
```

#### 7. Add Profile Picture
Place a JPG or PNG file inside the `profile/` folder (e.g. `profile.jpg`).

#### 8. Start the Bot
```bash
npm start
```
</details>

<details>
  <summary><strong>🐧 Install for Linux (Ubuntu/Debian)</strong></summary>

#### 1. Install Node.js & npm
```bash
sudo apt update
sudo apt install nodejs npm
```
Or install via NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 16
```

#### 2. Install Git (Optional, if you don't have Git installed)
```bash
sudo apt install git
```

#### 3. Verify Installation
```bash
node -v
npm -v
git --version
```

#### 4. Clone the Repository
```bash
git clone https://github.com/Aeon-San/Coffee.git
cd Coffee
```

#### 5. Install Dependencies
```bash
npm install
```

#### 6. Configure Settings
Create or edit the `settings.js` file with the following content:
```javascript
module.exports = {
  auth: "pairing",
  sessionFile: "./Session",
  BotName: "Coffee",
  additionalConfig: { proxy: null, retryCount: 5 },
};
```

#### 7. Add Profile Picture
Place a JPG or PNG file inside the `profile/` folder (e.g. `profile.jpg`).

#### 8. Start the Bot
```bash
npm start
```
</details>

## 🔑 **Pairing Instructions**

```text
1. Enter your phone number (e.g., 91629717594x)
2. Open WhatsApp → Settings → Linked Devices → Link with phone number
3. Enter the pairing code shown in the terminal
```

## ⚠️ **Notes**

- The bot **exits automatically** after setting the DP.
- A **new pairing code** is required each time.
- Ensure your profile image is **correctly named** and placed inside the `profile/` folder.


## ☕ **Support**
**Developed by [Aeon San](https://github.com/Aeon-San)**
If you found this Coffee Bot useful and want to support further development, you can buy me a coffee! ❤️

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20Coffee&emoji=☕&slug=aeonsan&button_colour=BD5FFF&font_colour=ffffff&font_family=Comic&outline_colour=000000&coffee_colour=FFDD00)](https://www.buymeacoffee.com/aeonsan)


## 🛠️ Thanks To

- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web Reverse-Engineering Library.


## 📝 **License**

This project is **Unlicensed** — for **personal use only**.



