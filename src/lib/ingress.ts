import type { DefinitionsService } from 'composepilot/compose-spec'
import objectToLabels from 'lib/objectToLabels'

type Options = {
  hostname: string | string[]
  port?: number
  entrypoint?: string
}

export default async function ingress(
  service: DefinitionsService,
  options: Options,
) {
  const { hostname, port, entrypoint } = options
  const hostnames = Array.isArray(hostname) ? hostname : [hostname]

  const routerName = hostnames
    .map((hostname) => hostname.replace(/[^A-z0-9]/g, '-').toLowerCase())
    .join('_')

  service.labels = service.labels ?? []
  if (!Array.isArray(service.labels))
    throw new Error('service.labels must be an array')

  service.labels.push(
    ...(await objectToLabels({
      traefik: {
        enable: true,
        http: {
          routers: {
            [routerName]: {
              rule: hostnames
                .map((hostname) => `Host(\`${hostname}\`)`)
                .join(' || '),
              tls: 'true',
              entryPoints: entrypoint,
            },
          },
          services: {
            [routerName]: {
              loadbalancer: {
                server: {
                  port,
                },
              },
            },
          },
        },
      },
    })),
  )
}