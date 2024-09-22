import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'wingysam/christmas-community',
  environment: {
    MARKDOWN: 'true',
  },
  volumes: ['/nomad-nfs/christmas-community/wing:/data'],
}
await ingress(app.services.app, {
  hostname: 'christmas.wing.lol',
  certResolver: 'myresolver',
})

export const state = await App(app)
