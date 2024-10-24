# Orderna

> main ← dev ← feature_branch
> Infrastructure guide is [here](./documentation//INDEX.md)

## Technology

- Backend - Nest.js + Fastify
- Database - Postgres 16
- Cache Database - Redis

## Kick start

- This repository is fully Dockerized and includes a `docker-compose.yaml` file. It defines the following services under one network:
  - Backend API
  - PostgreSQL Database
  - pgAdmin Client
  - Redis
- By simply running the command `docker compose up -d`, all the required containers will be spin up inside Docker, making it easy to get your development environment up and running quickly.

### Notes

> - Please ensure that port bindings for services defined in `docker-compose.yaml` do not conflict with ports already in use by other applications on your local machine. You may adjust the exposed ports as necessary to avoid any conflicts.
> - For internal services like PostgreSQL, pgAdmin, and Redis, the connections remain internal within the Docker network. Therefore, any changes to the exposed ports will not affect the internal communication between these services.

## Environments

- This application has 4 environments

### development

- Used for local development. This environment is configured to provide more detailed logging and has database synchronization enabled.

### test

- Dedicated to running test cases across the application. It is isolated to ensure a controlled testing environment.

### docker

- Utilized for internal Docker infrastructure connections without SSL. This environment mirrors the development environment in terms of functionality.

### production

- Configured for production deployment. It includes informative logging suitable for monitoring and diagnostics in a live environment.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# speeds up development by building 20x faster
$ npm run start -- -b swc

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test:watch

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Generating files

```bash
# Module
nest generate module <name_of_module>

# Controller

# without directory
nest generate controller <folder>/<name_of_controller> --flat

# with <name_of_controller> directory
nest generate controller <folder>/<name_of_controller>


## DB Migrations

# Generate: automatically generates SQL based on entity changes
npm run migration:generate <src/db/migrations>/<name-of-migration>

# Create: creates an empty migration file
npm run migration:create <src/db/migrations>/<name-of-migration>

# Show
npm run migration:show

# Run
npm run migration:run

# Rever
npm run migration:revert
```

## API Usage

See [API.md](API.md)

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
