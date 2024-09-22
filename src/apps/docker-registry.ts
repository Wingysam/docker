import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'registry:2',
  volumes: ['/nomad-nfs/registry/registry:/var/lib/registry'],
}
await ingress(app.services.app, {
  hostname: ['registry.ts.wingysam.xyz', 'registry.wg.wingysam.xyz'],
  entrypoint: 'ts-https',
})

export const state = await App(app)
