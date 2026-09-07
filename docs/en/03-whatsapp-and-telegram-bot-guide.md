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

## ⚡ 3. Advanced Interactivity (Delete, Correct & Buttons)

### 🟢 On WhatsApp:
1. **Delete with Emoji Reaction (`🗑️` or `❌`):**
   - Long-press the bot confirmation message and react with **`🗑️`** or **`❌`**. The bot will delete the expense immediately from the database and refresh all balances.
2. **Delete by replying:**
   - Swipe right to reply to the expense message and type: `delete`, `undo`, or `/undo`.
3. **Edit by replying:**
   - Swipe right to reply and specify corrections in natural language:
     - `it was 35€` or `35€` -> Updates amount.
     - `paid by Sam` -> Updates payer.
     - `category Groceries` -> Updates category.
     - `50/50` -> Forces equal split.
4. **Quick Undo Command (`/undo`):**
   - Send `/undo` or `/deshacer` without quoting to cancel the last recorded expense.

### 🔵 On Telegram:
- **Buttons on each expense:** Each recorded expense includes quick-action inline buttons:
  - `[ 🗑️ Delete ]` (removes the expense with 1 tap)
  - `[ ⚖️ Force 50/50 ]` (sets split to equal halves)
- **Button on balance:** When asking for `/balance`, if pending debts exist:
  - `[ 💸 Mark as Settled ]` (clears the debt in the database)

---

## 🤖 4. Complete Command Catalog

Interact with the bot anytime by sending these commands to your group:

| Command | Description |
| :--- | :--- |
| **`/help`** | Full visual cheat sheet with formatting examples and syntax. |
| **`/balance`** | Shows who owes money to whom for out-of-pocket advances. |
| **`/settle`** | Marks debts as settled and logs the compensation. |
| **`/summary`** | Total spent, joint account balance, and remaining budget. |
| **`/expenses`** | Lists the last 5 recorded expenses with payer and category. |
| **`/undo`** | Immediately undoes the most recently recorded expense. |
| **`/goals`** | Savings pots progress with visual ASCII bars `[██████░░░░]`. |
| **`/goal [name] [amount]`** | Adds a contribution to a pot (e.g. `/goal trip 50`). |
| **`/categories`** | Lists all active categories in your household. |

---

## ⚠️ 5. Real-Time Budget Alerts

When an expense pushes a category to **80%** or exceeds **100%** of its monthly budget, the bot appends a warning to the confirmation:
> *⚠️ **Notice:** Reached 85% of Groceries (425.00 € / 500.00 €)*

---

## 🛡️ 6. Anti-Spam & Zero-Cloud Privacy
- **Zero Spam:** Normal conversation in the group (`"What time are you home?"`) is completely ignored by the bot.
- **100% Local:** No chat messages are ever sent to third-party cloud servers or AI APIs; text parsing runs directly on your own machine.

