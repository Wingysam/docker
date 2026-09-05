import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.forgejo = {
  image: 'codeberg.org/forgejo/forgejo:16.0.3',
  environment: {
    TZ: 'America/New_York',
    USER_UID: '1000',
    USER_GID: '1000',
    ROOT_URL: 'https://git.wing.lol',
    FORGEJO__actions__ENABLED: 'true',
  },
  volumes: [
    '/nomad-nfs/forgejo/data:/data',
    '/etc/timezone:/etc/timezone:ro',
    '/etc/localtime:/etc/localtime:ro',
  ],
}
await ingress(app.services.forgejo, {
  hostname: ['git.wing.lol', 'git.ts.wingysam.xyz'],
  entrypoint: 'ts-https',
  port: 3000,
})

app.services.runner = {
  // renovate: datasource=docker depName=data.forgejo.org/forgejo/runner
  image: 'data.forgejo.org/forgejo/runner:13',
  user: '1000:1000',
  working_dir: '/data',
  environment: {
    TZ: 'America/New_York',
    DOCKER_HOST: 'tcp://runner-docker:2375',
  },
  volumes: ['/nomad-ssd/forgejo/runner:/data'],
  command: ['forgejo-runner', 'daemon', '--config', '/data/config.yml'],
  depends_on: {
    forgejo: { condition: 'service_started' },
    'runner-docker': { condition: 'service_healthy' },
  },
  networks: ['default', 'runner-docker'],
}

app.services['runner-docker'] = {
  // renovate: datasource=docker depName=docker
  image: 'docker:28-dind',
  privileged: true,
  environment: { DOCKER_TLS_CERTDIR: '' },
  command: ['dockerd', '-H', 'tcp://0.0.0.0:2375', '--tls=false'],
  volumes: ['/nomad-ssd/forgejo/runner-docker:/var/lib/docker'],
  healthcheck: {
    test: ['CMD', 'docker', '-H', 'tcp://localhost:2375', 'info'],
    interval: '10s',
    timeout: '5s',
    retries: 12,
    start_period: '20s',
  },
  networks: ['runner-docker'],
}

app.networks = { default: {}, 'runner-docker': {} }

app.services.postgres = {
  // renovate: datasource=docker depName=postgres
  image: 'postgres:18',
  environment: {
    POSTGRES_USER: 'gitea',
    POSTGRES_DB: 'gitea',
    POSTGRES_PASSWORD: 'gitea',
  },
  volumes: ['/nomad-ssd/forgejo/postgres:/var/lib/postgresql'],
}

export const state = await App(app)
