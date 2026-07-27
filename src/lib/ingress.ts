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

  // Disambiguate routers/services when path routing is used. Traefik
  // recommends hyphens-only resource names; underscores can collide with
  // the Docker provider's internal segment delimiter in some versions.
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

  // Explicit `service:` on every router. When a container declares more than
  // one Traefik service, the Docker provider's auto-linking sees multiple
  // candidates and refuses to bind — the explicit reference disables that
  // guesswork.
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
