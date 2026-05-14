import type { User, Recipient, DistributionList, DistributionListSummary, CraftMessageRequest, CraftMessageResponse, OutboxEntry, OutboxStatus } from './types'

const WH_GW = process.env.WHATSAPP_GW_URL!
const MAIN_SERVICE  = process.env.MAIN_SERVICE_URL!

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
    request<{ connected: boolean; phone?: string }>(WH_GW, '/status'),
  getQR: () =>
    request<{ qr: string }>(WH_GW, '/qr'),
}

export const usersApi = {
  getAll: () =>
    request<User[]>(MAIN_SERVICE, '/users/all'),
  create: (body: Omit<User, 'id' | 'created_at'>) =>
    request<User>(MAIN_SERVICE, '/users/create', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createFromRecipient: (body: { recipient_id: string; alias: string; email: string; roles?: string[] }) =>
    request<User>(MAIN_SERVICE, '/users/from-recipient', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<User>) =>
    request<User>(MAIN_SERVICE, `/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request<void>(MAIN_SERVICE, `/users/${id}`, { method: 'DELETE' }),
  deactivate: (id: string) =>
    request<User>(MAIN_SERVICE, `/users/${id}/deactivate`, { method: 'PUT' }),
  activate: (id: string) =>
    request<User>(MAIN_SERVICE, `/users/${id}/activate`, { method: 'PUT' }),
}

export const recipientsApi = {
  getAll: () =>
    request<Recipient[]>(MAIN_SERVICE, '/api/recipients/all'),
  search: (name: string) =>
    request<Recipient[]>(MAIN_SERVICE, `/api/recipients/search/?name=${encodeURIComponent(name)}`),
  getOne: (id: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}`),
  create: (body: { name: string; phone: string; email: string }) =>
    request<Recipient>(MAIN_SERVICE, '/api/recipients/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { name: string; phone: string; email: string }) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deactivate: (id: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}/deactivate`, {
      method: 'PUT',
    }),
  activate: (id: string) =>
    request<Recipient>(MAIN_SERVICE, `/api/recipients/${id}/activate`, {
      method: 'PUT',
    }),
  delete: (id: string) =>
    request<void>(MAIN_SERVICE, `/api/recipients/${id}`, { method: 'DELETE' }),
}

export const listsApi = {
  getAll: () =>
    request<DistributionListSummary[]>(MAIN_SERVICE, '/api/distribution-lists/'),
  getByName: (name: string) =>
    request<DistributionList>(MAIN_SERVICE, `/api/distribution-lists/${encodeURIComponent(name)}`),
  update: (id: string, body: { name: string; description: string }) =>
    request<DistributionList>(MAIN_SERVICE, `/api/distribution-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  addRecipient: (listId: string, recipientId: string) =>
    request<void>(MAIN_SERVICE, `/api/distribution-lists/${listId}/recipients`, {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId }),
    }),
  removeRecipient: (listId: string, recipientId: string) =>
    request<void>(
      MAIN_SERVICE,
      `/api/distribution-lists/${listId}/recipients/${recipientId}`,
      { method: 'DELETE' }
    ),
}

export const messagesApi = {
  craft: (body: CraftMessageRequest) =>
    request<CraftMessageResponse>(MAIN_SERVICE, '/api/messages/craft', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

export const outboxApi = {
  getPending: () =>
    request<OutboxEntry[]>(MAIN_SERVICE, '/api/outbox/pending'),
  getSent: (start: string, end: string) =>
    request<OutboxEntry[]>(MAIN_SERVICE, `/api/outbox/sent?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
  getByRecipient: (phone: string, status?: OutboxStatus) => {
    const params = new URLSearchParams({ phone })
    if (status) params.set('status', status)
    return request<OutboxEntry[]>(MAIN_SERVICE, `/api/outbox/by-recipient?${params.toString()}`)
  },
}
