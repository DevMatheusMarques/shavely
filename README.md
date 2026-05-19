# Shavely API

API REST para **agendamento em barbearia**, construída em **Node.js + TypeScript** com **Fastify**, **MySQL (TypeORM)** e arquitetura orientada a eventos com **RabbitMQ**. Inclui autenticação JWT com papéis **ADMIN**, **BARBER** e **CLIENT**, regras de negócio de marcação (disponibilidade, anti-sobreposição, cancelamento com antecedência mínima), **Outbox** para consistência entre base de dados e mensagens, workers para notificações push (Firebase), analytics (Novu) e lembretes, além de integração com links **WhatsApp** (`wa.me`).

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript |
| Framework HTTP | Fastify |
| Base de dados | MySQL 8 |
| ORM | TypeORM (migrações incluídas) |
| Validação | Zod |
| Mensagens | RabbitMQ (exchange tópico, filas, DLQ) |
| Auth | JWT (`Authorization: Bearer`) |
| Push | Firebase Admin (FCM), opcional via env |
| Documentação | OpenAPI 3 / Swagger UI |

---

## Arquitetura

O projeto segue **Clean Architecture** e **DDD** em camadas:

- **`src/domain`** — entidades, objetos de valor, erros de domínio e regras puras.
- **`src/application`** — casos de uso, portas (interfaces) e DTOs.
- **`src/infrastructure`** — TypeORM, RabbitMQ, FCM, Novo, JWT, relógio, etc.
- **`src/interfaces/http`** — rotas Fastify, plugins e contratos OpenAPI.
- **`src/shared`** — contratos de eventos e helpers partilhados.
- **`src/workers`** — processamento assíncrono (outbox, notificações, analytics, lembretes).

---

## Como executar

### Requisitos

- Node.js 20+
- MySQL 8 e RabbitMQ (ou apenas Docker / Docker Compose)

### Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP (ex.: 3000) |
| `MYSQL_*` | Host, porta, utilizador, palavra-passe e nome da base |
| `RABBITMQ_URL` | URL AMQP (ex.: `amqp://guest:guest@localhost:5672`) |
| `JWT_SECRET` | Segredo para assinar JWT (obrigatório em produção) |
| `JWT_EXPIRES_IN` | Expiração do token (ex.: `7d`) |
| `FCM_SERVICE_ACCOUNT_JSON` | JSON da conta de serviço Firebase (opcional; sem isto o push não envia) |
| `NOVU_API_KEY` | Chave Novu para analytics (opcional) |
| `NOVU_BACKEND_URL` | URL da API Novu (predefinição: cloud) |
| `REMINDER_*` / `OUTBOX_*` | Parâmetros dos workers (ver `.env.example`) |

### Desenvolvimento local

```bash
npm install
cp .env.example .env
# Garanta MySQL e RabbitMQ a correr e base criada
npm run migration:run
npm run start:dev
```

A API fica em `http://localhost:3000` (ou na `PORT` definida).

### Docker Compose

Na raiz do projeto:

```bash
docker compose build
docker compose up -d
```

- **API:** `http://localhost:3000`
- **MySQL (host):** porta mapeada **3307** → 3306 no contentor (ver `docker-compose.yml`)
- **RabbitMQ Management:** `http://localhost:15672` (guest / guest)
- O serviço **`migrate`** executa as migrações TypeORM antes dos restantes contentores

Utilizador **admin** criado pela migração inicial:

- **E-mail:** `admin@shavely.local`
- **Palavra-passe:** `Admin123!`

(Troque em produção.)

---

## Documentação da API (OpenAPI / Swagger)

| Recurso | URL |
|---------|-----|
| Swagger UI (browser) | `http://localhost:3000/docs` |
| OpenAPI JSON (gerado por `@fastify/swagger`) | `http://localhost:3000/docs/json` |
| OpenAPI JSON (alias na app) | `http://localhost:3000/openapi.json` |

Na UI (`/docs`), use **Authorize** e o token devolvido por `POST /auth/login` para testar rotas protegidas.

### Importar no Insomnia, Postman ou outras ferramentas

- Para **importar a especificação OpenAPI**, use o URL do **JSON**, por exemplo `http://localhost:3000/openapi.json` ou `http://localhost:3000/docs/json`.
- **Não** use apenas `/docs`: esse caminho devolve **HTML** da interface Swagger; clientes que esperam JSON daí mostram erros como *“does not specify a valid version field”* porque estão a tentar interpretar HTML como OpenAPI.

---

## Workers (Docker ou scripts)

| Processo | Função |
|----------|--------|
| `outbox-dispatcher` | Lê a tabela outbox e publica eventos no RabbitMQ |
| `notifications` | Consome fila de notificações, idempotência, FCM |
| `analytics` | Consome fila de analytics, Novu |
| `reminder-scheduler` | Agenda lembretes e publica eventos de lembrete |

---

## Resumo das rotas HTTP

Em todas as rotas protegidas, envie o cabeçalho **`Authorization: Bearer <JWT>`** exceto onde é indicado “público” ou “só body”.

### Sistema e documentação

| Método | Rota | Função | Body |
|--------|------|--------|------|
| **GET** | `/health` | Verifica se o processo HTTP responde | Sem body |
| **GET** | `/docs` | Interface Swagger UI | — |
| **GET** | `/openapi.json` | Especificação OpenAPI em JSON | — |

### Autenticação

| Método | Rota | Função | Body (JSON) |
|--------|------|--------|-------------|
| **POST** | `/auth/register` | Regista utilizador com papel **CLIENT** | `email`, `password` (mín. 8 caracteres), `name` (2–120 caracteres); opcional `phoneE164` em formato E.164 (ex.: `+5511999999999`) |
| **POST** | `/auth/login` | Login; devolve `accessToken` (JWT) | `email`, `password` |

### Admin (JWT + papel **ADMIN**)

| Método | Rota | Função | Body (JSON) |
|--------|------|--------|-------------|
| **POST** | `/admin/barbers` | Cria utilizador **BARBER** e registo na tabela `barbers` | `email`, `password` (≥8), `name` (2–120); opcional `phoneE164` (E.164, útil para links WhatsApp) |

### Barbeiro (JWT + papel **BARBER** nas duas primeiras)

| Método | Rota | Função | Body (JSON) |
|--------|------|--------|-------------|
| **POST** | `/barbers/me/services` | Cria um serviço para o barbeiro autenticado | `name` (2–120), `durationMinutes` (inteiro 15–480), `priceCents` (inteiro ≥ 0) |
| **POST** | `/barbers/me/availability` | Substitui os intervalos de disponibilidade do barbeiro | `slots`: array com pelo menos um objeto `{ weekday` (0–6), `startMinutes`, `endMinutes` } (minutos desde meia-noite; modelo atual em UTC) |

### Qualquer utilizador autenticado

| Método | Rota | Função | Body (JSON) |
|--------|------|--------|-------------|
| **POST** | `/me/device-tokens` | Regista token FCM para notificações push | `token` (mín. 10 caracteres), `platform`: `"ios"` \| `"android"` \| `"web"` |

### Agendamentos (JWT obrigatório)

| Método | Rota | Função | Body / query |
|--------|------|--------|--------------|
| **POST** | `/appointments` | Cria agendamento (regra de negócio: apenas **CLIENT**) | **Body:** `barberId` (UUID), `serviceId` (UUID), `startsAt` (string ISO 8601 / datetime) |
| **GET** | `/appointments` | Lista agendamentos (filtros dependem do papel: admin vê com filtros; cliente só os seus; barbeiro só os do seu perfil) | **Sem body.** Query opcional: `barberId`, `clientId` (UUIDs), `from`, `to` (datas) |
| **PATCH** | `/appointments/:id/cancel` | Cancela agendamento (cliente dono, barbeiro do slot ou admin); política mínima de 2h antes | **Sem body.** O id vai na URL (`:id`) |

### Público (sem JWT)

| Método | Rota | Função | Body |
|--------|------|--------|------|
| **GET** | `/barbers/:barberId/services` | Lista serviços de um barbeiro (UUID na URL) | Sem body |

---

## Scripts npm úteis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Arranca `node dist/main.js` |
| `npm run start:dev` | Modo desenvolvimento com reload (`tsx`) |
| `npm run migration:run` | Executa migrações TypeORM (requer `.env`) |
| `npm run migration:revert` | Reverte última migração |
