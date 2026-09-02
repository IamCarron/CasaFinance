# 💬 03. WhatsApp & Telegram Bot Guide

The number one reason people abandon expense tracking is the **friction of opening an app for every single minor grocery trip**.

CasaFinance integrates lightweight bots for **WhatsApp** and **Telegram** so that logging an expense is as fast as sending a quick text in your couple's chat group.

---

## 🚀 1. Quick Setup

### A) WhatsApp Bot (100% Local with Baileys)
1. In CasaFinance, go to **Settings > Messaging Platform** and choose **WhatsApp**.
2. Type the exact title of your WhatsApp couple group (e.g. `House Expenses` or `Home & Life`).
3. Click **"Link WhatsApp / Show QR Code"**.
4. Open WhatsApp on your phone -> **Settings > Linked Devices > Link a Device** and scan the QR code.
5. Done! The bot will strictly listen to messages inside that specific group.

### B) Telegram Bot
1. Create a bot on Telegram via [@BotFather](https://t.me/botfather) (`/newbot`) and copy your **Bot Token**.
2. Paste the token in **Settings > Telegram** in CasaFinance.
3. Add the bot to your Telegram group and set it as an administrator.

---

## 📝 2. Natural Language Syntax

The bot features a built-in Natural Language Processing (NLP) parser with **over 750 keywords in English and Spanish**.

### A) Standard Joint Account Expenses (Default)
Simply send the amount and merchant/description:
- `42.50 Groceries Whole Foods` -> Saves $42.50 under *Food & Groceries* paid from Joint Account.
- `18.90 Shell Gas Station` -> Saves $18.90 under *Transport & Gas*.
- `32 Dinner Italian Bistro` -> Saves $32.00 under *Dining & Leisure*.
- `12.99 Netflix` -> Saves $12.99 under *Subscriptions*.

### B) Out-of-Pocket Advances (Paid from Personal Cards)
If you are out and pay for a household item using your personal card:
- `15 Pharmacy advance` (or `15 Pharmacy paid by me`) -> Records an out-of-pocket advance for the message sender.
- `60 Costco paid by Alex` -> Records the advance in Alex's name.

### C) Forcing a 50/50 Split
To split an individual purchase equally:
- `85 Special Dinner 50/50` (or `half and half`).

---

## 🤖 3. Useful Commands

Check your household financial health anytime by sending these commands in your group chat:

| Command | Description |
| :--- | :--- |
| `!balance` or `/balance` | Shows who owes money to whom for out-of-pocket advances this month. |
| `!summary` or `/summary` | Monthly recap: Total spent, joint account spending, and transaction count. |
| `!expenses` or `/expenses` | Lists the last 5 expenses recorded this month. |
| `!help` or `/help` | Displays command cheat sheet and syntax examples. |

---

## 🛡️ 4. Anti-Spam & Zero-Cloud Privacy
- **Zero Spam:** Normal conversation in the group (`"What time are you home?"`) is completely ignored by the bot.
- **100% Local:** No chat messages are ever sent to third-party cloud servers or AI APIs; text parsing runs directly on your own machine.
