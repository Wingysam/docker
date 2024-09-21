import type { ComposeSpecification } from 'composepilot/compose-spec'

// This function provides some defaults for the ComposeSpecification
export default async function App(
  spec: ComposeSpecification,
): Promise<ComposeSpecification> {
  spec.version = spec.version ?? '3'

  if (typeof spec.services !== 'undefined') {
    for (const [_name, service] of Object.entries(spec.services)) {
      service.restart = service.restart ?? 'always'
    }
  }

  return spec
}
