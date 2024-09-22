import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import App from 'lib/App.ts'
import secrets from 'lib/secrets'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'traefik:v2.4.11',
  network_mode: 'host',
  environment: {
    CF_DNS_API_TOKEN: secrets.traefik_cloudflare_token,
  },
  volumes: [
    '/nomad-nfs/traefik/traefik.toml:/etc/traefik/traefik.toml',
    '/nomad-nfs/traefik/dynamic.toml:/etc/traefik/dynamic.toml',
    '/nomad-nfs/traefik/acme:/etc/traefik/acme',
    '/nomad-nfs/traefik/logs:/logs',
    '/var/run/docker.sock:/var/run/docker.sock',
  ],
}

export const state = await App(app)
