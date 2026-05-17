/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))
jest.mock('@/lib/api-client', () => ({
  listsApi: {
    getAll: jest.fn(),
    getByName: jest.fn(),
    update: jest.fn(),
    addRecipient: jest.fn(),
    removeRecipient: jest.fn(),
  },
}))

import { getServerSession } from 'next-auth'
import { listsApi } from '@/lib/api-client'
import { GET } from '@/app/api/lists/route'
import {
  GET as GET_BY_ID,
  PUT,
} from '@/app/api/lists/[id]/route'
import {
  POST as ADD_RECIPIENT,
  DELETE as REMOVE_RECIPIENT,
} from '@/app/api/lists/[id]/recipients/route'

const mockSession = { user: { name: 'Admin' } }

// ---------------------------------------------------------------------------
// GET /api/lists
// ---------------------------------------------------------------------------
describe('GET /api/lists', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const res = await GET()

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns all lists when authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const data = [
      { id: '1', name: 'Marketing', description: 'Desc', recipient_count: 5 },
    ]
    ;(listsApi.getAll as jest.Mock).mockResolvedValueOnce(data)

    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(data)
  })

  it('returns 502 when the backend fails', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    ;(listsApi.getAll as jest.Mock).mockRejectedValueOnce(
      new Error('Timeout')
    )

    const res = await GET()

    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('Timeout')
  })
})

// ---------------------------------------------------------------------------
// GET /api/lists/[id]
// ---------------------------------------------------------------------------
describe('GET /api/lists/[id]', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3005/api/lists/Marketing')
    const res = await GET_BY_ID(req, {
      params: Promise.resolve({ id: 'Marketing' }),
    })

    expect(res.status).toBe(401)
  })

  it('returns a single list by name', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const list = {
      id: '1',
      name: 'Marketing',
      description: 'Desc',
      recipients: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }
    ;(listsApi.getByName as jest.Mock).mockResolvedValueOnce(list)

    const req = new NextRequest('http://localhost:3005/api/lists/Marketing')
    const res = await GET_BY_ID(req, {
      params: Promise.resolve({ id: 'Marketing' }),
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(list)
    expect(listsApi.getByName).toHaveBeenCalledWith('Marketing')
  })
})

// ---------------------------------------------------------------------------
// PUT /api/lists/[id]
// ---------------------------------------------------------------------------
describe('PUT /api/lists/[id]', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3005/api/lists/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated', description: 'New desc' }),
    })
    const res = await PUT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(401)
  })

  it('updates a list', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const updated = {
      id: '1',
      name: 'Updated',
      description: 'New desc',
      recipients: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    }
    ;(listsApi.update as jest.Mock).mockResolvedValueOnce(updated)

    const req = new NextRequest('http://localhost:3005/api/lists/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated', description: 'New desc' }),
    })
    const res = await PUT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(updated)
    expect(listsApi.update).toHaveBeenCalledWith('1', {
      name: 'Updated',
      description: 'New desc',
    })
  })
})

// ---------------------------------------------------------------------------
// POST /api/lists/[id]/recipients  (add recipient)
// ---------------------------------------------------------------------------
describe('POST /api/lists/[id]/recipients', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest(
      'http://localhost:3005/api/lists/1/recipients',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: 'r1' }),
      }
    )
    const res = await ADD_RECIPIENT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(401)
  })

  it('adds a recipient to the list and returns 204', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    ;(listsApi.addRecipient as jest.Mock).mockResolvedValueOnce(undefined)

    const req = new NextRequest(
      'http://localhost:3005/api/lists/1/recipients',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: 'r1' }),
      }
    )
    const res = await ADD_RECIPIENT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(204)
    expect(listsApi.addRecipient).toHaveBeenCalledWith('1', 'r1')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/lists/[id]/recipients  (remove recipient)
// ---------------------------------------------------------------------------
describe('DELETE /api/lists/[id]/recipients', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest(
      'http://localhost:3005/api/lists/1/recipients',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: 'r1' }),
      }
    )
    const res = await REMOVE_RECIPIENT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(401)
  })

  it('removes a recipient from the list and returns 204', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    ;(listsApi.removeRecipient as jest.Mock).mockResolvedValueOnce(undefined)

    const req = new NextRequest(
      'http://localhost:3005/api/lists/1/recipients',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: 'r1' }),
      }
    )
    const res = await REMOVE_RECIPIENT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(204)
    expect(listsApi.removeRecipient).toHaveBeenCalledWith('1', 'r1')
  })
})
