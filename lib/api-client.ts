import type { User, Recipient, DistributionList, DistributionListSummary, CraftMessageRequest, CraftMessageResponse, OutboxEntry, OutboxStatus } from './types'

const NODE_API = process.env.NODE_API_URL!
const FASTAPI  = process.env.FASTAPI_URL!

async function request<T>(
  base: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
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
  getStatus: () =>
    request<{ connected: boolean; phone?: string }>(NODE_API, '/status'),
  getQR: () =>
    request<{ qr: string }>(NODE_API, '/qr'),
}

export const usersApi = {
  getAll: () =>
    request<User[]>(FASTAPI, '/users/all'),
  create: (body: Omit<User, 'id' | 'created_at'>) =>
    request<User>(FASTAPI, '/users/create', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createFromRecipient: (body: { recipient_id: string; alias: string; email: string; roles?: string[] }) =>
    request<User>(FASTAPI, '/users/from-recipient', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<User>) =>
    request<User>(FASTAPI, `/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request<void>(FASTAPI, `/users/${id}`, { method: 'DELETE' }),
  deactivate: (id: string) =>
    request<User>(FASTAPI, `/users/${id}/deactivate`, { method: 'PUT' }),
  activate: (id: string) =>
    request<User>(FASTAPI, `/users/${id}/activate`, { method: 'PUT' }),
}

export const recipientsApi = {
  getAll: () =>
    request<Recipient[]>(FASTAPI, '/api/recipients/all'),
  search: (name: string) =>
    request<Recipient[]>(FASTAPI, `/api/recipients/search/?name=${encodeURIComponent(name)}`),
  getOne: (id: string) =>
    request<Recipient>(FASTAPI, `/api/recipients/${id}`),
  create: (body: { name: string; phone: string; email: string }) =>
    request<Recipient>(FASTAPI, '/api/recipients/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { name: string; phone: string; email: string }) =>
    request<Recipient>(FASTAPI, `/api/recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deactivate: (id: string) =>
    request<Recipient>(FASTAPI, `/api/recipients/${id}/deactivate`, {
      method: 'PUT',
    }),
  activate: (id: string) =>
    request<Recipient>(FASTAPI, `/api/recipients/${id}/activate`, {
      method: 'PUT',
    }),
  delete: (id: string) =>
    request<void>(FASTAPI, `/api/recipients/${id}`, { method: 'DELETE' }),
}

export const listsApi = {
  getAll: () =>
    request<DistributionListSummary[]>(FASTAPI, '/api/distribution-lists/'),
  getByName: (name: string) =>
    request<DistributionList>(FASTAPI, `/api/distribution-lists/${encodeURIComponent(name)}`),
  update: (id: string, body: { name: string; description: string }) =>
    request<DistributionList>(FASTAPI, `/api/distribution-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  addRecipient: (listId: string, recipientId: string) =>
    request<void>(FASTAPI, `/api/distribution-lists/${listId}/recipients`, {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId }),
    }),
  removeRecipient: (listId: string, recipientId: string) =>
    request<void>(
      FASTAPI,
      `/api/distribution-lists/${listId}/recipients/${recipientId}`,
      { method: 'DELETE' }
    ),
}

export const messagesApi = {
  craft: (body: CraftMessageRequest) =>
    request<CraftMessageResponse>(FASTAPI, '/api/messages/craft', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

export const outboxApi = {
  getPending: () =>
    request<OutboxEntry[]>(FASTAPI, '/api/outbox/pending'),
  getSent: (start: string, end: string) =>
    request<OutboxEntry[]>(FASTAPI, `/api/outbox/sent?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
  getByRecipient: (phone: string, status?: OutboxStatus) => {
    const params = new URLSearchParams({ phone })
    if (status) params.set('status', status)
    return request<OutboxEntry[]>(FASTAPI, `/api/outbox/by-recipient?${params.toString()}`)
  },
}
