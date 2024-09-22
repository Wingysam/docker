import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'jellyfin/jellyfin',
  network_mode: 'host',
  volumes: [
    '/nomad-nfs/jellyfin/config:/config',
    '/nomad-nfs/jellyfin/cache:/cache',
    '/nomad-nfs/jellyfin/Media/Movies:/media/movies',
    '/nomad-nfs/jellyfin/Media/TV:/media/tv',
    '/nomad-nfs/jellyfin/Media/School:/media/school',
    '/nomad-nfs/jellyfin/Media/Home:/media/home',
    '/nomad-nfs/jellyfin/Media/TV (Kids):/media/tv-kids',
    '/nomad-nfs/jellyfin/Media/Books:/media/books',
    '/nomad-nfs/jellyfin/Media/Education:/media/education',
    '/nomad-nfs/jellyfin/Media/Dashcam:/media/dashcam',
  ],
}
await ingress(app.services.app, {
  hostname: 'jellyfin.wing.lol',
  entrypoint: 'ts-https',
})

export const state = await App(app)
