export default async function objectToLabels(obj: any) {
  const labels: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const v = value[i]
        if (v !== null && typeof v === 'object') {
          labels.push(
            ...(await objectToLabels(v)).map((label) => `${key}[${i}].${label}`),
          )
        } else {
          labels.push(`${key}[${i}]=${v}`)
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      labels.push(
        ...(await objectToLabels(value)).map((label) => `${key}.${label}`),
      )
    } else {
      labels.push(`${key}=${value}`)
    }
  }
  return labels
}
