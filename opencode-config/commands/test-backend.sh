#!/bin/bash

# Script para ejecutar tests del backend

cd "$(dirname "$0")/../../tablebit-backend" || exit 1

echo "======================================"
echo "Ejecutando Tests Backend"
echo "======================================"
echo ""

if [ "$1" = "--filter" ] && [ -n "$2" ]; then
    echo "Filtrando por: $2"
    php artisan test --filter="$2"
else
    php artisan test
fi

echo ""
echo "======================================"
echo "Tests completados"
echo "======================================"