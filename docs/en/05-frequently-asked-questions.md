# ❓ 05. Frequently Asked Questions (FAQ)

Answers to common questions about day-to-day household finances with CasaFinance.

---

### 1. What happens if there is money left over in the joint account at month-end?
**Nothing, leave it in the joint account!**
The surplus rolls over and acts as a financial shock absorber for high-cost months (e.g., quarterly water bills, yearly property tax, or home repairs). You can also periodically transfer surplus funds into a **Savings Goal** (e.g. "Summer Vacation Pot").

---

### 2. What happens if the joint account runs out of money before month-end?
If household spending exceeds expectations in a given month:
1. **One-Off:** Make a small top-up transfer to the joint account split by your normal ratios (e.g., 60%/40%).
2. **Structural:** If you consistently run out of funds, your *Groceries* or *Utilities* allocations in the **Budget** tab are underestimated. Adjust the budget numbers so monthly allocations match reality.

---

### 3. How does "Balance & Settlements" work?
When either partner pays for a household expense with their personal card (rather than the joint account debit card), they have **advanced personal funds**.
- CasaFinance does not count this advance as money drawn from the joint account.
- In the **Balance** tab, the app calculates the exact reimbursement the other partner owes to settle out-of-pocket expenses.
- Clicking **"Record settlement / Mark as settled"** balances the ledger back to zero and logs the settlement transaction.

---

### 4. One of us is a freelancer or has variable income. How should we handle this?
In **Settings > Couple Profiles**, set that partner's income mode to **"Variable"**.
At the beginning of each month, a prompt will appear on the Dashboard asking to enter the actual net earnings for that month, instantly recalculating the split ratio without altering base settings.

---

### 5. Why use SQLite instead of PostgreSQL or MySQL?
SQLite is blazing fast, uses virtually zero RAM on lightweight home servers (Raspberry Pi, NAS, Umbrel), and stores everything in a single portable file (`./data/casafinance.db`), making backups and server migrations as simple as copying a single file.
