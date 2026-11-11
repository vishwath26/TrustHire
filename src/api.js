export async function request(path, options) {
  const response = await fetch(path, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = data.detail
    const message = typeof detail === 'string'
      ? detail
      : 'The TrustHire API could not complete that request.'
    throw new Error(message)
  }

  return data
}

export function listInvestigations() {
  return request('/api/investigations')
}

export function getInvestigation(publicId) {
  return request(`/api/investigations/${publicId}`)
}

export function getGraph(publicId) {
  return request(`/api/investigations/${publicId}/graph`)
}

export function getThreatIntelligence() {
  return request('/api/threat-intelligence')
}

export function createInvestigation(formData) {
  return request('/api/investigations', {
    method: 'POST',
    body: formData,
  })
}
