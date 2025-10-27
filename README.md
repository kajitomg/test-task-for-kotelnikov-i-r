### Запуск магриций

```
$env:PRISMA_MIGRATION_NAME="value"; docker-compose -f docker/docker-compose.migrate.yml --env-file .env up -d --build
```
### Запуск посева данных

```
docker-compose -f docker/docker-compose.seed.yml --env-file .env up -d --build
```

### Запуск и сборка docker в dev режиме

```
$env:NODE_ENV="dev"; docker-compose up -d --build
```

### Запуск и сборка docker в production режиме

```
$env:NODE_ENV="production"; docker-compose up -d --build
```

#### По умолчанию без указания пременной NODE_ENV контейне запустится в production режиме