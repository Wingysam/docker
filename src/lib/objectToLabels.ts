export default async function objectToLabels(obj: any) {
  const labels: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      labels.push(
        ...(await objectToLabels(value)).map((label) => `${key}.${label}`),
      )
    } else {
      labels.push(`${key}=${value}`)
    }
  }
  return labels
}
