<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Описание проекта

Цифровая образовательно - коммуникационная среда для собственников бизнеса  
Внутрення дока в корне docs/typedoc, открывать через index.html

## Стек проекта

- Node.js v18+ (лучше всего LTS)
- npm v11+
- Docker
- Docker compose

В контейнерах запускается БД (PostgreSQL), Redis, RabbitMQ, Nginx exporter (для экспортера нужна аппка для трекинга ошибок и состояния сервера: как настроить prometheus + grafana https://habr.com/ru/companies/doubletapp/articles/736602/) и главная аппка 

## Подготовка проекта

1. Клонирование репозиторий и установка зависимостей:
```bash
$ git clone https://github.com/valerchikUwU/good-management

$ npm install
```

2. В src/config создать файл users.acl (пример для этого файла в этой же папке example_users.txt) - это файл для создания кастомного юзера в Redis с паролем

3. Создать .env в корне (пример лежит в корне .env_example.txt)

4. Создать папку uploads в корне (криво игнор изначально написал)

5. Прописать свои секреты в .github/workflows/deploy.yml

## Команды для проекта

```bash
# запуск
$ docker compose up --build -d

# запуск только контейнера с app 
$ docker compose up -d --no-deps --build app

# запустить без докера
$ npm run start:dev

# логи
$ docker logs [container_name] -f

# закрыть контейнеры
$ docker compose down
```

## Структура проекта

```
src/
├── application/
│   ├── modules/          # Модули NestJS (.module.ts)
│   └── services/        # Сервисы приложения
│       └── {domain}/    # Доменные сервисы (с папкой repository)
│
├── config/              # Конфигурационные файлы
│
├── constants/
│   ├── extraTypes/      # Дополнительные типы
│   └── swaggerExamples/ # Примеры ответов API
│
├── contracts/           # DTO и контракты
│   └── {domain}/       # Доменные DTO (create/read/update)
│
├── controllers/         # Контроллеры API
├── decorators/          # Кастомные декораторы (для ролей и доступа)
├── domains/             # Доменные сущности (.entity.ts)
├── gateways/            # socket.io gateways (.gateway.ts)
├── guards/              # Guards (.guard.ts)
│
├── helpersFunc/         # Вспомогательные функции
├── middleware/          # Middleware (логгер)
├── migrations/          # Миграции TypeORM
├── utils/               # Утилиты
│
└── validators/          # Валидация
    ├── pipes/           # Кастомные pipes
    └── {domain}.validator.ts  # Кастомные декораторы для DTO
```


## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
