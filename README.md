<div align="center">

# 🏠 CasaFinance

**Smart, private, and proportional household finance management for couples.**  
*Self-hosted • Local-First • WhatsApp & Telegram Bots • AI Vision OCR • Docker Ready*

---

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white&style=flat-square)](https://github.com/IamCarron/CasaFinance)
[![Local-First](https://img.shields.io/badge/Architecture-Local--First-10B981?style=flat-square)](https://github.com/IamCarron/CasaFinance)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-Noncommercial-8B5CF6?style=flat-square)](./LICENSE)
[![Bilingual](https://img.shields.io/badge/Language-ES%20%7C%20EN-F59E0B?style=flat-square)](./docs/README.md)

<br />

<img src="docs/screenshots/dashboard.png" alt="CasaFinance Preview" width="850" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);" />

</div>

<br />

Splitting shared expenses 50/50 when partners have different incomes is often inequitable and tedious to balance. **CasaFinance** automates shared couple finances by calculating fair contributions **proportional to net income**, while providing the flexibility to force 50/50 splits on individual purchases, handle out-of-pocket advances, and track monthly budgets in real-time.

---

## ✨ Key Highlights

- ⚖️ **Equitable Proportional Splitting** — Automatically computes each partner's fair monthly transfer to the joint account based on their net income ratio.
- 💬 **WhatsApp & Telegram Bots** — Log shared expenses instantly from your couple's chat group in natural language (`42.50 Groceries`, `60 Dinner 50/50`, `18 Pharmacy advance` or `!balance`).
- 📸 **AI Receipt Scanner (OCR)** — Snap a photo of any receipt to extract the merchant, total, date, and category automatically (runs 100% locally with Ollama or via OpenAI).
- 💳 **Out-of-Pocket Settlements** — Paid for household items with your personal card? The system tracks advances without inflating household spending and balances debts with one click.
- 📊 **Dynamic & Variable Incomes** — Seamlessly adjust for bonuses, freelance months, or overtime without modifying your baseline budget.
- 🎯 **Shared Savings Goals** — Create visual savings pots (vacation, emergency fund, home renovations) with progress bars and allocation logs.
- 🔒 **100% Local-First & Private** — All data is stored in your own SQLite database (`./data/casafinance.db`). Zero tracking, zero telemetry.
- 📱 **Mobile PWA Ready** — Installable on iOS Safari and Android Chrome with a responsive native bottom-dock layout.

---

## ⚡ Quick Start

Deploy on your home server, NAS, Raspberry Pi, or VPS in under a minute:

```bash
# 1. Clone repository
git clone https://github.com/iamcarron/CasaFinance.git
cd CasaFinance

# 2. Launch with Docker Compose
docker compose up -d
```

Open your browser at `http://localhost:3000` (or `http://<YOUR-SERVER-IP>:3000`).

---

## 📚 Documentation & Wiki

Detailed guides and financial methodology are available in the **[`docs/`](./docs/README.md)** directory:

| 🇪🇸 Guías en Español | 🇬🇧 English Guides |
| :--- | :--- |
| 📖 [01. Filosofía & El Modelo de 3 Cuentas](./docs/es/01-filosofia-y-metodologia.md) | 📖 [01. Philosophy & The 3-Account Model](./docs/en/01-philosophy-and-methodology.md) |
| 📊 [02. Cómo Definir el Presupuesto](./docs/es/02-como-definir-tu-presupuesto.md) | 📊 [02. How to Define Your Household Budget](./docs/en/02-how-to-define-your-budget.md) |
| 💬 [03. Guía de Bots (WhatsApp & Telegram)](./docs/es/03-guia-bot-whatsapp-y-telegram.md) | 💬 [03. WhatsApp & Telegram Bot Guide](./docs/en/03-whatsapp-and-telegram-bot-guide.md) |
| 🐳 [04. Autoalojamiento, Docker & Backups](./docs/es/04-autoalojamiento-y-docker.md) | 🐳 [04. Self-Hosting, Docker & Backups](./docs/en/04-self-hosting-and-docker.md) |
| ❓ [05. Preguntas Frecuentes (FAQ)](./docs/es/05-preguntas-frecuentes.md) | ❓ [05. Frequently Asked Questions (FAQ)](./docs/en/05-frequently-asked-questions.md) |

---

## 🔄 Updates & Maintenance

CasaFinance includes a hardened auto-update script that creates SQLite backups and updates your containers without closing your bot session:

```bash
./update.sh
```

---

## 📄 License & Commercial Use

This project is licensed under the **PolyForm Noncommercial License 1.0.0** (See [`LICENSE`](./LICENSE)).

- ✅ **Personal & Domestic Use**: 100% Free and open for self-hosting.
- 💼 **Commercial & SaaS Use**: Commercial exploitation, monetization, or hosted services require a commercial license. Contact the author for inquiries.

---

<div align="center">

Made with ♥ by [IamCarron](https://github.com/IamCarron)

</div>
