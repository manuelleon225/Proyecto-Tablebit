#!/bin/bash
# Script de despliegue para TableBit - Producción
# Uso: bash deploy.sh [environment]
#   environment: "production" (default) | "staging"

set -euo pipefail

ENVIRONMENT="${1:-production}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "============================================"
echo "  TableBit Deploy - ${ENVIRONMENT}"
echo "  Started: $(date)"
echo "============================================"

# === Frontend Build ===
echo ""
echo "[1/7] Building frontend..."
cd tablebit-frontend
npm ci --omit=dev
npm run build
echo "  Frontend build complete. Output: dist/"

# === Backend Dependencies ===
echo ""
echo "[2/7] Installing backend dependencies..."
cd ../tablebit-backend
composer install --optimize-autoloader --no-dev --no-interaction
echo "  Backend dependencies installed."

# === Environment ===
echo ""
echo "[3/7] Setting up environment..."
if [ ! -f .env ]; then
    cp .env.production .env
    echo "  WARNING: .env created from .env.production"
    echo "  ACTION REQUIRED: Update APP_KEY and DB credentials in .env"
fi

# === Cache ===
echo ""
echo "[4/7] Caching routes, config, and views..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
echo "  Cache built successfully."

# === Migrations ===
echo ""
echo "[5/7] Running migrations..."
php artisan migrate --force
echo "  Migrations up to date."

# === Storage ===
echo ""
echo "[6/7] Linking storage..."
php artisan storage:link --force 2>/dev/null || true
echo "  Storage linked."

# === Pulse (if enabled) ===
echo ""
echo "[7/7] Pulse status..."
if [ "${PULSE_ENABLED:-false}" = "true" ]; then
    echo "  Pulse is enabled. Dashboard at /pulse"
else
    echo "  Pulse is disabled. Set PULSE_ENABLED=true to enable."
fi

echo ""
echo "============================================"
echo "  Deploy complete: ${TIMESTAMP}"
echo "  Environment: ${ENVIRONMENT}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Restart queue worker: php artisan queue:restart"
echo "  2. Verify health: curl https://tu-dominio.com/api/health"
echo "  3. Check Pulse: https://tu-dominio.com/pulse (admin only)"
echo ""
