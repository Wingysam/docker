import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.forgejo = {
  image: 'codeberg.org/forgejo/forgejo:15.0.2',
  environment: {
    TZ: 'America/New_York',
    USER_UID: '1000',
    USER_GID: '1000',
    ROOT_URL: 'https://git.wing.lol',
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
