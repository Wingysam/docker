import type { ComposeSpecification } from 'composepilot/compose-spec.ts'
import ingress from 'lib/ingress.ts'
import App from 'lib/App.ts'

const app: ComposeSpecification = {}

app.services = {}
app.services.app = {
  image: 'homeassistant/home-assistant:stable',
  networks: {
    vlan: {
      ipv4_address: '192.168.1.101',
    },
  },
  volumes: ['/nomad-nfs/home-assistant/config:/config'],
}
await ingress(app.services.app, {
  hostname: 'home-assistant.wingysam.xyz',
  entrypoint: 'ts-https',
  port: 80,
})

app.networks = {
  vlan: {
    driver: 'ipvlan',
    driver_opts: {
      parent: 'br0',
      ipvlan_mode: 'l3',
    },
    ipam: {
      config: [
        {
          subnet: '192.168.1.0/24',
          ip_range: '192.168.1.101/32',
          gateway: '192.168.1.1',
        },
      ],
    },
  },
}

export const state = await App(app)
