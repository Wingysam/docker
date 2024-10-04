import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'
import secrets from 'lib/secrets'

const app: ComposeSpecification = {}

app.services = {}

app.services.postiz = {
  image: 'ghcr.io/gitroomhq/postiz-app:latest',
  environment: {
    MAIN_URL: 'https://postiz.wing.lol',
    FRONTEND_URL: 'https://postiz.wing.lol',
    NEXT_PUBLIC_BACKEND_URL: 'https://postiz.wing.lol/api',
    JWT_SECRET: secrets.postiz_jwt_secret,
    DATABASE_URL: 'postgresql://postiz:postiz@postgres:5432/postiz-db-local',
    REDIS_URL: 'redis://redis:6379',
    BACKEND_INTERNAL_URL: 'http://localhost:3000',
    IS_GENERAL: 'true',
  },
  volumes: ['postiz-config:/config/'],
  ports: ['5000:5000'],
  networks: ['postiz-network'],
  depends_on: {
    'postiz-postgres': {
      condition: 'service_healthy',
    },
    'postiz-redis': {
      condition: 'service_healthy',
    },
  },
}
await ingress(app.services.postiz, {
  hostname: 'postiz.wing.lol',
  port: 5000,
  entrypoint: 'ts-https',
})

app.services.postgres = {
  image: 'postgres:17',
  container_name: 'postgres',
  restart: 'always',
  environment: {
    POSTGRES_PASSWORD: 'postiz',
    POSTGRES_USER: 'postiz',
    POSTGRES_DB: 'postiz-db-local',
  },
  volumes: ['/nomad-nfs/postiz/pg:/var/lib/postgresql/data'],
  healthcheck: {
    test: 'pg_isready -U postiz -d postiz-db-local',
    interval: '10s',
    timeout: '3s',
    retries: 3,
  },
}

app.services.redis = {
  image: 'redis:7.4',
  restart: 'always',
  healthcheck: {
    test: 'redis-cli ping',
    interval: '10s',
    timeout: '3s',
    retries: 3,
  },
  volumes: ['/nomad-nfs/postiz/redis:/data'],
}

export const state = await App(app)
