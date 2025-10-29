# Запуск приложения
_Перед запуском необходимо установить и запустить docker + docker-compose_

## Инициализация
Запустите в корневой директории скрипт:
```
docker compose -f docker/docker-compose.deploy.yml --env-file .env up --abort-on-container-exit
```

### Запуск и сборка docker в dev режиме
Чтобы собрать и запустить docker для разработки запустите в корневой директории скрипт:
```
$env:NODE_ENV="dev"; docker compose up -d --build
```

### Запуск и сборка docker в production режиме
Чтобы собрать и запустить docker в production режиме запустите в корневой директории скрипт:
```
$env:NODE_ENV="production"; docker compose up -d --build
```
_По умолчанию без указания переменной NODE_ENV контейнер запустится в production режиме_

### Разработка в server container
После запуска docker в режиме разработки запустите в корневой директории скрипт:
```
docker compose exec server sh
```

### Посев данных
Для посева начальных данных в БД, находясь в server container выполните следующие команды:
```
npm run prisma:seed
```

### Тестирование
Для выполнения тестов, находясь в server container выполните следующие команды:
```
npm run test
```

