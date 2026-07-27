import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import App from 'lib/App.ts'
import secrets from 'lib/secrets'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  // renovate: datasource=docker depName=traefik
  image: 'traefik:v3.7.8',
  network_mode: 'host',
  environment: {
    CF_DNS_API_TOKEN: secrets.traefik_cloudflare_token,
  },
  volumes: [
    '/nomad-ssd/traefik/traefik.toml:/etc/traefik/traefik.toml',
    '/nomad-ssd/traefik/dynamic.toml:/etc/traefik/dynamic.toml',
    '/nomad-ssd/traefik/acme:/etc/traefik/acme',
    '/nomad-ssd/traefik/logs:/logs',
    '/var/run/docker.sock:/var/run/docker.sock',
  ],
}

export const state = await App(app)
