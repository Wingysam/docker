import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'ghcr.io/triliumnext/notes:stable',
  environment: {
    NODE_PATH:
      '/home/node/trilium-data/npm/node_modules:/home/node/trilium-data/npm/custom_modules',
  },
  volumes: [
    '/nomad-ssd/trilium:/home/node/trilium-data',
    '/nomad-ssd/trilium/sessions:/tmp/trilium-sessions',
    '/nomad-ssd/trilium/node_modules_symlink:/node_modules',
  ],
}
await ingress(app.services.app, {
  hostname: 'trilium.wing.lol',
  entrypoint: 'ts-https',
})

export const state = await App(app)
