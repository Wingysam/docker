import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'homeassistant/home-assistant:stable',
  network_mode: 'host',
  volumes: ['/nomad-nfs/home-assistant/config:/config'],
}
await ingress(app.services.app, {
  hostname: 'home-assistant.wingysam.xyz',
  entrypoint: 'ts-https',
  port: 8123,
})

export const state = await App(app)
