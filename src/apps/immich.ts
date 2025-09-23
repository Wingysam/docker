import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const IMMICH_VERSION = 'v1.143.1'
const COMMON_ENV = {
  DB_HOSTNAME: 'database',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_DATABASE_NAME: 'immich',
  REDIS_HOSTNAME: 'redis',
}

const app: ComposeSpecification = {}

app.services = {}
app.services['immich-server'] = {
  image: `ghcr.io/immich-app/immich-server:${IMMICH_VERSION}`,
  environment: {
    ...COMMON_ENV,
  },
  volumes: ['/data/.live-data/immich/upload:/usr/src/app/upload'],
  depends_on: ['redis', 'database'],
}
await ingress(app.services['immich-server'], {
  hostname: ['immich.wing.lol', 'immich.ts.wingysam.xyz'],
  entrypoint: 'ts-https',
})

app.services['immich-machine-learning'] = {
  image: `ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}`,
  environment: {
    ...COMMON_ENV,
  },
  volumes: ['/nomad-ssd/immich/model-cache:/cache'],
}

app.services.redis = {
  image:
    'docker.io/valkey/valkey:8-bookworm@sha256:5b8f8c333bef895c925f56629d6ba90aea95a4f7391f62411e625267c600b19c',
}

app.services.database = {
  image: 'ghcr.io/immich-app/postgres:14-vectorchord0.3.0-pgvectors0.2.0',
  environment: {
    POSTGRES_PASSWORD: COMMON_ENV.DB_PASSWORD,
    POSTGRES_USER: COMMON_ENV.DB_USERNAME,
    POSTGRES_DB: COMMON_ENV.DB_DATABASE_NAME,
    DB_STORAGE_TYPE: 'SSD',
  },
  volumes: ['/nomad-ssd/immich/pgdata:/var/lib/postgresql/data'],
}

export const state = await App(app)
