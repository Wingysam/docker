import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import secrets from 'lib/secrets.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'vaultwarden/server:1.32.0',
  environment: {
    SIGNUPS_ALLOWED: 'false',
    ADMIN_TOKEN: secrets.bitwarden_admin_token,
  },
  volumes: ['/nomad-nfs/bitwarden:/data'],
}
await ingress(app.services.app, {
  hostname: ['bitwarden.wing.lol', 'bitwarden.ts.wingysam.xyz'],
  entrypoint: 'ts-https',
})

export const state = await App(app)
