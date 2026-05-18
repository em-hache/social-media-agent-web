import type { User, Recipient, DistributionList, DistributionListSummary, CraftMessageRequest, CraftMessageResponse, OutboxEntry, OutboxStatus } from './types'

const WH_GW = process.env.WHATSAPP_GW_URL!
const MAIN_SERVICE  = process.env.MAIN_SERVICE_URL!

async function request<T>(
  base: string,
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${base}${path}`, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...fetchOptions?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const whatsappApi = {
  getStatus: (token?: string) =>
    request<{ connected: boolean; phone?: string }>(WH_GW, '/status', { token }),
  getQR: (token?: string) =>
    request<{ qr: string }>(WH_GW, '/qr', { token }),
}

export const usersApi = {
  getAll: (token?: string) =>
    request<User[]>(MAIN_SERVICE, '/api/users/all', { token }),
  create: (body: Omit<User, 'id' | 'created_at'>, token?: string) =>
    request<User>(MAIN_SERVICE, '/api/users/create', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
  createFromRecipient: (body: { recipient_id: string; alias: string; email: string; roles?: string[] }, token?: string) =>
    request<User>(MAIN_SERVICE, '/api/users/from-recipient', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
  update: (id: string, body: Partial<User>, token?: string) =>
    request<User>(MAIN_SERVICE, `/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),
  delete: (id: string, token?: string) =>
    request<void>(MAIN_SERVICE, `/api/users/${id}`, { method: 'DELETE', token }),
  deactivate: (id: string, token?: string) =>
    request<User>(MAIN_SERVICE, `/api/users/${id}/deactivate`, { method: 'PUT', token }),
  activate: (id: string, token?: string) =>
    request<User>(MAIN_SERVICE, `/api/users/${id}/activate`, { method: 'PUT', token }),
}

export const recipientsApi = {
  getAll: (token?: string) =>
    request<Recipient[]>(MAIN_SERVICE, '/api/recipients/all', { token }),
  search: (name: string, token?: string) =>
    request<Recipient[]>(MAIN_SERVICE, `/api/recipients/search/?name=${encodeURIComponent(name)}`, { token }),
  getOne: (id: string, token?: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}`, { token }),
  create: (body: { name: string; phone: string; email: string }, token?: string) =>
    request<Recipient>(MAIN_SERVICE, '/api/recipients/', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
  update: (id: string, body: { name: string; phone: string; email: string }, token?: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    }),
  deactivate: (id: string, token?: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}/deactivate`, {
      method: 'PUT',
      token,
    }),
  activate: (id: string, token?: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}/activate`, {
      method: 'PUT',
      token,
    }),
  delete: (id: string, token?: string) =>
    request<void>(MAIN_SERVICE, `/api/recipients/${id}`, { method: 'DELETE', token }),
}

export const listsApi = {
  getAll: (token?: string) =>
    request<DistributionListSummary[]>(MAIN_SERVICE, '/api/distribution-lists/', { token }),
  getByName: (name: string, token?: string) =>
    request<DistributionList>(MAIN_SERVICE, `/api/distribution-lists/${encodeURIComponent(name)}`, { token }),
  update: (id: string, body: { name: string; description: string }, token?: string) =>
    request<DistributionList>(MAIN_SERVICE, `/api/distribution-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    }),
  addRecipient: (listId: string, recipientId: string, token?: string) =>
    request<void>(MAIN_SERVICE, `/api/distribution-lists/${listId}/recipients`, {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId }),
      token,
    }),
  removeRecipient: (listId: string, recipientId: string, token?: string) =>
    request<void>(
      MAIN_SERVICE,
      `/api/distribution-lists/${listId}/recipients/${recipientId}`,
      { method: 'DELETE', token }
    ),
}

export const messagesApi = {
  craft: (body: CraftMessageRequest, token?: string) =>
    request<CraftMessageResponse>(MAIN_SERVICE, '/api/messages/craft', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
}

export const outboxApi = {
  getPending: (token?: string) =>
    request<OutboxEntry[]>(MAIN_SERVICE, '/api/outbox/pending', { token }),
  getSent: (start: string, end: string, token?: string) =>
    request<OutboxEntry[]>(MAIN_SERVICE, `/api/outbox/sent?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, { token }),
  getByRecipient: (phone: string, status?: OutboxStatus, token?: string) => {
    const params = new URLSearchParams({ phone })
    if (status) params.set('status', status)
    return request<OutboxEntry[]>(MAIN_SERVICE, `/api/outbox/by-recipient?${params.toString()}`, { token })
  },
}
