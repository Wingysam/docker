import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import secrets from 'lib/secrets.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.server = {
  // renovate: datasource=docker depName=yooooomi/your_spotify_server
  image: 'yooooomi/your_spotify_server:latest',
  depends_on: ['mongo'],
  environment: {
    API_ENDPOINT: 'https://spotify-api.wing.lol',
    CLIENT_ENDPOINT: 'https://spotify.wing.lol',
    SPOTIFY_PUBLIC: secrets.yourspotify_clientId,
    SPOTIFY_SECRET: secrets.yourspotify_clientSecret,
  },
}
await ingress(app.services.server, {
  hostname: 'spotify-api.wing.lol',
  port: 8080,
  entrypoint: 'ts-https',
})

app.services.web = {
  // renovate: datasource=docker depName=yooooomi/your_spotify_client
  image: 'yooooomi/your_spotify_client:latest',
  environment: {
    API_ENDPOINT: 'https://spotify-api.wing.lol',
  },
}
await ingress(app.services.web, {
  hostname: 'spotify.wing.lol',
  port: 3000,
  entrypoint: 'ts-https',
})

app.services.mongo = {
  // renovate: datasource=docker depName=mongo
  image: 'mongo:6',
  volumes: ['/nomad-ssd/yourspotify/db:/data/db'],
}

export const state = await App(app)
