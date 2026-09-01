#!/usr/bin/env bash

# ==========================================================
# 🏠 CasaFinance Bulletproof Auto-Update Script
# ==========================================================

set -e
START_TIME=$(date +%s)

# Colors for modern terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Detect language (Spanish or English based on system LANG or argument)
IS_ES=0
if [[ "$LANG" == es* || "$LANG" == ES* || "$1" == "--es" ]] && [[ "$1" != "--en" ]]; then
    IS_ES=1
fi

echo -e "\n${BLUE}==============================================${NC}"
echo -e "${BLUE}${BOLD}        🏠 CasaFinance Updater                ${NC}"
echo -e "${BLUE}==============================================${NC}\n"

# 1. Check prerequisites (git & docker)
if ! command -v git &> /dev/null; then
    [ $IS_ES -eq 1 ] && echo -e "${RED}❌ Git no está instalado. Por favor instálalo primero.${NC}" || echo -e "${RED}❌ Git is not installed. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    [ $IS_ES -eq 1 ] && echo -e "${RED}❌ Docker no está instalado.${NC}" || echo -e "${RED}❌ Docker is not installed.${NC}"
    exit 1
fi

# 2. Auto-detect if sudo is required for Docker
DOCKER_CMD="docker"
if ! docker info &> /dev/null; then
    if sudo docker info &> /dev/null; then
        DOCKER_CMD="sudo docker"
        [ $IS_ES -eq 1 ] && echo -e "${CYAN}🔑 Detectado entorno con permisos de root (usando sudo para Docker).${NC}" || echo -e "${CYAN}🔑 Root permissions detected (using sudo for Docker).${NC}"
    else
        [ $IS_ES -eq 1 ] && echo -e "${RED}❌ No se puede comunicar con Docker. Verifica permisos o servicio.${NC}" || echo -e "${RED}❌ Cannot communicate with Docker daemon. Check permissions or service.${NC}"
        exit 1
    fi
fi

# 3. Determine Docker Compose command syntax
if $DOCKER_CMD compose version &> /dev/null; then
    COMPOSE_CMD="$DOCKER_CMD compose"
else
    COMPOSE_CMD="sudo docker-compose"
fi

# 4. Safe SQLite WAL Database Backup (with retention policy)
[ $IS_ES -eq 1 ] && echo -e "${YELLOW}📦 Creando copia de seguridad de la base de datos...${NC}" || echo -e "${YELLOW}📦 Creating database backup...${NC}"
mkdir -p data/backups
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -f data/casafinance.db ]; then
    # Copy main db and any active WAL / SHM journal files
    cp -f data/casafinance.db "data/backups/casafinance_${BACKUP_TIMESTAMP}.db"
    [ -f data/casafinance.db-wal ] && cp -f data/casafinance.db-wal "data/backups/casafinance_${BACKUP_TIMESTAMP}.db-wal" || true
    [ -f data/casafinance.db-shm ] && cp -f data/casafinance.db-shm "data/backups/casafinance_${BACKUP_TIMESTAMP}.db-shm" || true
    
    [ $IS_ES -eq 1 ] && echo -e "${GREEN}✅ Copia de seguridad guardada: data/backups/casafinance_${BACKUP_TIMESTAMP}.db${NC}" || echo -e "${GREEN}✅ Backup saved to: data/backups/casafinance_${BACKUP_TIMESTAMP}.db${NC}"

    # Auto-cleanup: keep only the last 10 backups to prevent disk bloat
    (cd data/backups && ls -tp casafinance_*.db 2>/dev/null | grep -v '/$' | tail -n +11 | xargs -I {} rm -- {} 2>/dev/null || true)
else
    [ $IS_ES -eq 1 ] && echo -e "${BLUE}ℹ️ No se detectó base de datos previa (instalación limpia).${NC}" || echo -e "${BLUE}ℹ️ No previous database detected (clean installation).${NC}"
fi

# 5. Pull latest code from GitHub
[ $IS_ES -eq 1 ] && echo -e "\n${YELLOW}⬇️ Descargando la última versión desde GitHub...${NC}" || echo -e "\n${YELLOW}⬇️ Pulling latest version from GitHub...${NC}"
git stash > /dev/null 2>&1 || true
git pull origin main

# 6. Rebuild and start Docker containers
[ $IS_ES -eq 1 ] && echo -e "\n${YELLOW}🔨 Reconstruyendo y actualizando contenedores...${NC}" || echo -e "\n${YELLOW}🔨 Rebuilding and updating containers...${NC}"
$COMPOSE_CMD up -d --build

# 7. Post-update Health Check
[ $IS_ES -eq 1 ] && echo -e "\n${YELLOW}🩺 Verificando estado del servicio...${NC}" || echo -e "\n${YELLOW}🩺 Verifying service health...${NC}"
sleep 3

if $COMPOSE_CMD ps | grep -q "casafinance"; then
    [ $IS_ES -eq 1 ] && echo -e "${GREEN}✅ Contenedores activos y en ejecución.${NC}" || echo -e "${GREEN}✅ Containers active and running.${NC}"
else
    [ $IS_ES -eq 1 ] && echo -e "${RED}⚠️ Advertencia: No se pudo verificar el estado del contenedor. Revisa 'docker compose logs'.${NC}" || echo -e "${RED}⚠️ Warning: Could not verify container status. Check 'docker compose logs'.${NC}"
fi

# 8. Clean up unused images (free disk space)
[ $IS_ES -eq 1 ] && echo -e "\n${YELLOW}🧹 Limpiando imágenes y capas obsoletas...${NC}" || echo -e "\n${YELLOW}🧹 Cleaning up obsolete images and build cache...${NC}"
$DOCKER_CMD image prune -f > /dev/null 2>&1 || true

# 9. Extract current version from package.json
NEW_VERSION="v$(grep '"version"' package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g')"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${GREEN}==============================================${NC}"
if [ $IS_ES -eq 1 ]; then
    echo -e "${GREEN}${BOLD}  🎉 ¡CasaFinance actualizado a ${NEW_VERSION} con éxito! ${NC}"
    echo -e "${GREEN}  ⏱️ Tiempo total: ${DURATION}s | Accede en http://localhost:3000${NC}"
else
    echo -e "${GREEN}${BOLD}  🎉 CasaFinance successfully updated to ${NEW_VERSION}! ${NC}"
    echo -e "${GREEN}  ⏱️ Total time: ${DURATION}s | Open at http://localhost:3000${NC}"
fi
echo -e "${GREEN}==============================================${NC}\n"
