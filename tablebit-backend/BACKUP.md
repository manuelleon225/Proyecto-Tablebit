# TableBit — Estrategia de Backups

## Base de Datos

### Backup manual
```bash
mysqldump -u root -p tablebit_prod > backups/tablebit_$(date +%Y%m%d_%H%M%S).sql
```

### Restore
```bash
mysql -u root -p tablebit_prod < backups/tablebit_20260513_120000.sql
```

### Backup automatizado (cron diario)
```bash
# /etc/cron.daily/tablebit-backup
#!/bin/bash
BACKUP_DIR="/var/backups/tablebit"
mkdir -p $BACKUP_DIR
mysqldump --single-transaction -u root -p'password' tablebit_prod | gzip > $BACKUP_DIR/tablebit_$(date +%Y%m%d).sql.gz
# Rotación: mantener últimos 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

## Archivos

```bash
# Storage (imágenes subidas)
tar -czf backups/storage_$(date +%Y%m%d).tar.gz tablebit-backend/storage/app/public

# .env (sensible)
cp tablebit-backend/.env backups/env_$(date +%Y%m%d).backup
```

## Rotación

| Tipo | Frecuencia | Retención |
|------|-----------|-----------|
| DB (completo) | Diaria | 30 días |
| Storage | Semanal | 90 días |
| .env | Por cambio | Indefinido |

## Verificación

```bash
# Probar restore en entorno de staging
mysql -u root -p tablebit_staging < backups/tablebit_20260513.sql
php artisan migrate --force
php artisan test
```
