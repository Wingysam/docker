import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

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
  // renovate: datasource=docker depName=ghcr.io/immich-app/immich-server
  image: 'ghcr.io/immich-app/immich-server:v3.0.0',
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
  // renovate: datasource=docker depName=ghcr.io/immich-app/immich-machine-learning
  image: 'ghcr.io/immich-app/immich-machine-learning:v3.0.0',
  environment: {
    ...COMMON_ENV,
  },
  volumes: ['/nomad-ssd/immich/model-cache:/cache'],
}

app.services.redis = {
  // renovate: datasource=docker depName=docker.io/valkey/valkey
  image:
    'docker.io/valkey/valkey:8-bookworm@sha256:fea8b3e67b15729d4bb70589eb03367bab9ad1ee89c876f54327fc7c6e618571',
}

app.services.database = {
  // renovate: datasource=docker depName=ghcr.io/immich-app/postgres
  image: 'ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0',
  environment: {
    POSTGRES_PASSWORD: COMMON_ENV.DB_PASSWORD,
    POSTGRES_USER: COMMON_ENV.DB_USERNAME,
    POSTGRES_DB: COMMON_ENV.DB_DATABASE_NAME,
    DB_STORAGE_TYPE: 'SSD',
  },
  volumes: ['/nomad-ssd/immich/pgdata:/var/lib/postgresql/data'],
}

export const state = await App(app)
