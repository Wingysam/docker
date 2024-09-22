import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.forgejo = {
  image: 'codeberg.org/forgejo/forgejo:1.18.2-1',
  environment: {
    TZ: 'America/New_York',
    USER_UID: '1000',
    USER_GID: '1000',
    ROOT_URL: '/Applications/gitea',
  },
  volumes: [
    '/nomad-nfs/forgejo/gitea:/data',
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
  image: 'postgres:9.6',
  environment: {
    POSTGRES_USER: 'gitea',
    POSTGRES_DB: 'gitea',
    POSTGRES_PASSWORD: 'gitea',
  },
  volumes: ['/nomad-ssd/forgejo/postgres:/var/lib/postgresql/data'],
}

export const state = await App(app)
