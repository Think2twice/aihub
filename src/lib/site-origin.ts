function normalizeOrigin(value?: string | null) {
  if (!value) return ''

  try {
    const url = new URL(value)
    return url.origin
  } catch {
    return ''
  }
}

function normalizeHost(value?: string | null) {
  if (!value) return ''
  const trimmed = value.trim()

  try {
    return new URL(trimmed).host.toLowerCase()
  } catch {
    return trimmed.toLowerCase()
  }
}

function configuredOrigins() {
  const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...extraOrigins,
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
}

export function getAllowedOrigins(currentOrigin?: string | null) {
  const origins = new Set(configuredOrigins())
  const normalizedCurrentOrigin = normalizeOrigin(currentOrigin)
  if (normalizedCurrentOrigin) origins.add(normalizedCurrentOrigin)
  return origins
}

export function getAllowedHosts(currentHost?: string | null) {
  const hosts = new Set<string>()
  for (const origin of Array.from(getAllowedOrigins())) {
    const host = normalizeHost(origin)
    if (host) hosts.add(host)
  }

  const normalizedCurrentHost = normalizeHost(currentHost)
  if (normalizedCurrentHost) hosts.add(normalizedCurrentHost)
  return hosts
}

export function isAllowedRequestOrigin(params: {
  origin?: string | null
  host?: string | null
}) {
  const originHost = normalizeHost(params.origin)
  if (!originHost) return true

  const allowedHosts = getAllowedHosts(params.host)
  return allowedHosts.has(originHost)
}

export function getCorsHeaders(params: {
  origin?: string | null
  currentOrigin?: string | null
}) {
  const allowedOrigins = getAllowedOrigins(params.currentOrigin)
  const requestOrigin = normalizeOrigin(params.origin)
  const fallbackOrigin = normalizeOrigin(params.currentOrigin)
  const allowOrigin = requestOrigin && allowedOrigins.has(requestOrigin)
    ? requestOrigin
    : fallbackOrigin || Array.from(allowedOrigins)[0] || '*'

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  }
}
