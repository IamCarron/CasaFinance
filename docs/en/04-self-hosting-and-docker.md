# 🐳 04. Self-Hosting, Docker & Maintenance

CasaFinance is a **Local-First** application designed to run on your own hardware (Home Server, NAS, Umbrel, Raspberry Pi, or VPS) with zero mandatory cloud dependencies.

---

## 🚀 1. Deployment with Docker Compose

The recommended way to deploy CasaFinance is using `docker-compose.yml`:

```yaml
version: '3.8'

services:
  casafinance:
    image: node:22-alpine
    container_name: casafinance
    working_dir: /app
    volumes:
      - ./:/app
      - casafinance-data:/app/data
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    command: ["sh", "-c", "npm install && npm run build && npm run start"]

  casafinance-whatsapp-bot:
    image: node:22-alpine
    container_name: casafinance-whatsapp-bot
    working_dir: /app
    volumes:
      - ./whatsapp-bot:/app
      - casafinance-whatsapp-auth:/app/auth_info_baileys
    environment:
      - NODE_ENV=production
      - CASAFINANCE_API_URL=http://casafinance:3000/api/bot
      - AUTH_DIR=/app/auth_info_baileys
    depends_on:
      - casafinance
    restart: unless-stopped
    command: ["sh", "-c", "npm install && node bot.js"]

volumes:
  casafinance-data:
  casafinance-whatsapp-auth:
```

### Start the containers:
```bash
docker compose up -d
```
Access the web app at `http://your-server-ip:3000`.

---

## 💾 2. Backups (SQLite Storage)

All application data (settings, categories, budgets, expenses, and savings goals) lives inside a single SQLite database:
`./data/casafinance.db` (along with its WAL files `casafinance.db-wal` and `casafinance.db-shm`).

### A) Manual Backup via Web UI
Go to **Settings > Backups** and click **"Download Backup"** to get a `.db` file instantly.

### B) Terminal Backup
```bash
cp data/casafinance.db data/casafinance_backup_$(date +%Y%m%d).db
```

---

## 🔄 3. Updates with `update.sh`

The repository includes a hardened auto-updater that creates automatic backups, keeps the last 10 versions, and rebuilds the containers:

```bash
./update.sh
```

Flags:
- `./update.sh --en` (Force English)
- `./update.sh --es` (Force Spanish)
