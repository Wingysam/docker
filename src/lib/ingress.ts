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
  const {
    hostname,
    path,
    stripPrefix,
    port,
    entrypoint,
    scheme,
    insecureSkipVerify,
  } = options
  const hostnames = Array.isArray(hostname) ? hostname : [hostname]

  // Each hostname slug uses `[^A-z0-9]+` collapsed to a single hyphen, so a
  // single-host slug can never contain `--`. Hostnames are then joined with
  // `--`, which uniquely marks hostname boundaries — that's why
  // (domain.example, example) and (domain.example.example) produce different
  // names (`domain-example--example` vs `domain-example-example`). Both
  // properties preserve the collision-resistance of the previous underscore
  // separator while using only Traefik-legal name characters.
  const pathSlug = path
    ? path.replace(/[^A-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
    : ''
  const routerName =
    hostnames
      .map((h) => h.replace(/[^A-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase())
      .join('--') + (pathSlug ? `-${pathSlug}` : '')

  const hostRule = hostnames.map((h) => `Host(\`${h}\`)`).join(' || ')
  const rule = path ? `(${hostRule}) && PathPrefix(\`${path}\`)` : hostRule

  service.labels = service.labels ?? []
  if (!Array.isArray(service.labels))
    throw new Error('service.labels must be an array')

  const middlewareName = stripPrefix ? `${routerName}-stripprefix` : undefined

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
              service: routerName,
              middlewares: middlewareName,
            },
          },
          middlewares: stripPrefix
            ? {
                [middlewareName!]: {
                  stripprefix: {
                    prefixes: path,
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
