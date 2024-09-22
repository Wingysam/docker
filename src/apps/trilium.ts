import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'zadam/trilium:0.63.7',
  environment: {
    NODE_PATH:
      '/home/node/trilium-data/npm/node_modules:/home/node/trilium-data/npm/custom_modules',
  },
  volumes: [
    '/nomad-ssd/trilium:/home/node/trilium-data',
    '/nomad-ssd/trilium/sessions:/tmp/trilium-sessions',
  ],
}
await ingress(app.services.app, {
  hostname: 'trilium.wing.lol',
  entrypoint: 'ts-https',
})

export const state = await App(app)
