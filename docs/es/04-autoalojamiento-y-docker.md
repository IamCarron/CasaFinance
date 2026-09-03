# 🐳 04. Autoalojamiento, Docker & Mantenimiento

CasaFinance es una aplicación **Local-First**, diseñada para ejecutarse bajo tu propio control en servidores domésticos, NAS, Umbrel, Raspberry Pi o VPS sin dependencias externas obligatorias.

---

## 🚀 1. Despliegue con Docker Compose

La forma recomendada de instalar y ejecutar CasaFinance es mediante `docker-compose.yml`:

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

### Iniciar el servicio:
```bash
docker compose up -d
```
Accede a la interfaz web en `http://tu-servidor-ip:3000`.

---

## 💾 2. Copias de Seguridad (Backup de SQLite)

Toda la información del sistema (ajustes, categorías, presupuestos, gastos y metas) reside en un único archivo SQLite:
`./data/casafinance.db` (y sus diarios temporales `casafinance.db-wal` y `casafinance.db-shm`).

### A) Copia manual desde la Web
Ve a **Ajustes > Copias de Seguridad** y pulsa en **"Descargar Copia de Seguridad"** para obtener un archivo `.db` al instante.

### B) Copia desde la terminal
```bash
cp data/casafinance.db data/casafinance_backup_$(date +%Y%m%d).db
```

---

## 🔄 3. Actualizaciones con `update.sh`

El proyecto incluye un script de actualización inteligente que realiza copias de seguridad preventivas automáticas y rota los últimos 10 respaldos antes de compilar la nueva versión:

```bash
./update.sh
```

El script detecta automáticamente si tu terminal está en español o en inglés (`$LANG`) o puedes forzar el idioma con:
- `./update.sh --es` (Modo español)
- `./update.sh --en` (English mode)
