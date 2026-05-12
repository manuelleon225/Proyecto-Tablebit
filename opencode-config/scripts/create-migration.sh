#!/bin/bash

# Script para crear migración con naming consistente

if [ -z "$1" ]; then
    echo "Uso: ./create-migration.sh nombre_descripcion"
    echo "Ejemplo: ./create-migration.sh add_rating_to_resenas"
    exit 1
fi

TIMESTAMP=$(date +%Y_%m_%d_%H%M%S)
FILENAME="${TIMESTAMP}_${1}.php"

cd "$(dirname "$0")/../../tablebit-backend" || exit 1

php artisan make:migration "$1"

echo ""
echo "Migration creada: database/migrations/${FILENAME}"
echo ""
echo "Recuerda:"
echo "  - Usar timestamps únicos si es la migración del día"
echo "  - Verificar columnas con Schema::hasColumn() antes de modificar"
echo "  - Proteger código MySQL con DB::getDriverName() === 'mysql'"