import type { DefinitionsService } from 'composepilot/compose-spec'
import objectToLabels from 'lib/objectToLabels'

type Options = {
  hostname: string | string[]
  path?: string
  stripPrefix?: boolean // Strip `path` before forwarding to the upstream
  port?: number
  entrypoint?: string
  certResolver?: string
  scheme?: string
  insecureSkipVerify?: boolean
}

export default async function ingress(
  service: DefinitionsService,
  options: Options,
) {
  const { hostname, path, stripPrefix, port, entrypoint, scheme, insecureSkipVerify } = options
  const hostnames = Array.isArray(hostname) ? hostname : [hostname]

  // Disambiguate routers/services when path routing is used, so the same
  // host can serve multiple upstreams under different path prefixes.
  const pathSlug = path
    ? path.replace(/[^A-z0-9]/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
    : ''
  const routerName =
    hostnames
      .map((h) => h.replace(/[^A-z0-9]/g, '-').toLowerCase())
      .join('_') + (pathSlug ? `_${pathSlug}` : '')

  const hostRule = hostnames.map((h) => `Host(\`${h}\`)`).join(' || ')
  const rule = path ? `(${hostRule}) && PathPrefix(\`${path}\`)` : hostRule

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
              rule,
              tls: 'true',
              'tls.certresolver': options.certResolver,
              entrypoints: entrypoint,
              // StripPrefix middleware needs to be wired onto this router
              // before the service forward if `stripPrefix` is set.
              middlewares: stripPrefix ? [`${routerName}-stripprefix`] : undefined,
              service: routerName,
            },
          },
          middlewares: stripPrefix
            ? {
                [`${routerName}-stripprefix`]: {
                  stripprefix: {
                    prefixes: [path],
                  },
                },
              }
            : undefined,
          services: {
            [routerName]: {
              loadbalancer: {
                server: {
                  port,
                  scheme,
                },
                serverstransport: insecureSkipVerify
                  ? 'insecure@file'
                  : undefined,
              },
            },
          },
        },
      },
    })),
  )
}
