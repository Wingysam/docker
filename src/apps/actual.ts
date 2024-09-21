import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import secrets from 'lib/secrets.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'ghcr.io/actualbudget/actual-server:24.7.0-alpine',
  volumes: ['/nomad-nfs/actual:/data'],
}
await ingress(app.services.app, {
  hostname: 'actual.wing.lol',
  port: 5006,
  entrypoint: 'ts-https',
})

export const state = await App(app)
