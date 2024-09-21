import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import secrets from 'lib/secrets.ts'
import App from 'lib/App.ts'

export default async () => {
  const app: ComposeSpecification = {}

  app.services = {}
  app.services.app = {
    image: 'ghcr.io/actualbudget/actual-server:24.7.0-alpine',
    environment: {
      TZ: 'America/New_York',
      SIGNUPS_ALLOWED: 'false',
      ADMIN_TOKEN: secrets.actual_admin_token,
    },
    volumes: ['/nomad-nfs/actual:/data'],
  }
  await ingress(app.services.app, {
    hostname: 'actual.wing.lol',
    port: 5006,
    entrypoint: 'ts-https',
  })

  return App(app)
}
