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
  recipientsApi: {
    search: jest.fn(),
    create: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

import { getServerSession } from 'next-auth'
import { recipientsApi } from '@/lib/api-client'
import { GET, POST } from '@/app/api/recipients/route'
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from '@/app/api/recipients/[id]/route'

const mockSession = { user: { name: 'Admin' } }

// ---------------------------------------------------------------------------
// GET /api/recipients
// ---------------------------------------------------------------------------
describe('GET /api/recipients', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3005/api/recipients')
    const res = await GET(req)

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns recipients list when authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const data = [
      { id: '1', name: 'Juan', phone: '+34600111222', email: null, is_active: true },
    ]
    ;(recipientsApi.search as jest.Mock).mockResolvedValueOnce(data)

    const req = new NextRequest('http://localhost:3005/api/recipients')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(data)
    expect(recipientsApi.search).toHaveBeenCalledWith('')
  })

  it('passes the name search param to the backend', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    ;(recipientsApi.search as jest.Mock).mockResolvedValueOnce([])

    const req = new NextRequest(
      'http://localhost:3005/api/recipients?name=Juan'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(recipientsApi.search).toHaveBeenCalledWith('Juan')
  })

  it('returns 502 when the backend throws', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    ;(recipientsApi.search as jest.Mock).mockRejectedValueOnce(
      new Error('Connection refused')
    )

    const req = new NextRequest('http://localhost:3005/api/recipients')
    const res = await GET(req)

    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('Connection refused')
  })
})

// ---------------------------------------------------------------------------
// POST /api/recipients
// ---------------------------------------------------------------------------
describe('POST /api/recipients', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new Request('http://localhost:3005/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        phone: '+34600000000',
        email: 'test@test.com',
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('creates a recipient and returns 201', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const created = {
      id: '99',
      name: 'Test',
      phone: '+34600000000',
      email: 'test@test.com',
      is_active: true,
    }
    ;(recipientsApi.create as jest.Mock).mockResolvedValueOnce(created)

    const req = new Request('http://localhost:3005/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        phone: '+34600000000',
        email: 'test@test.com',
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual(created)
  })
})

// ---------------------------------------------------------------------------
// GET /api/recipients/[id]
// ---------------------------------------------------------------------------
describe('GET /api/recipients/[id]', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3005/api/recipients/1')
    const res = await GET_BY_ID(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(401)
  })

  it('returns a single recipient', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const recipient = {
      id: '1',
      name: 'Juan',
      phone: '+34600111222',
      email: null,
      is_active: true,
    }
    ;(recipientsApi.getOne as jest.Mock).mockResolvedValueOnce(recipient)

    const req = new NextRequest('http://localhost:3005/api/recipients/1')
    const res = await GET_BY_ID(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(recipient)
    expect(recipientsApi.getOne).toHaveBeenCalledWith('1')
  })
})

// ---------------------------------------------------------------------------
// PUT /api/recipients/[id]
// ---------------------------------------------------------------------------
describe('PUT /api/recipients/[id]', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3005/api/recipients/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    })
    const res = await PUT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(401)
  })

  it('updates a recipient', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    const updated = {
      id: '1',
      name: 'Updated',
      phone: '+34600111222',
      email: 'new@test.com',
      is_active: true,
    }
    ;(recipientsApi.update as jest.Mock).mockResolvedValueOnce(updated)

    const req = new NextRequest('http://localhost:3005/api/recipients/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated',
        phone: '+34600111222',
        email: 'new@test.com',
      }),
    })
    const res = await PUT(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(updated)
    expect(recipientsApi.update).toHaveBeenCalledWith('1', {
      name: 'Updated',
      phone: '+34600111222',
      email: 'new@test.com',
    })
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/recipients/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/recipients/[id]', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3005/api/recipients/1', {
      method: 'DELETE',
    })
    const res = await DELETE(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(401)
  })

  it('deletes a recipient and returns 204', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(mockSession)
    ;(recipientsApi.delete as jest.Mock).mockResolvedValueOnce(undefined)

    const req = new NextRequest('http://localhost:3005/api/recipients/1', {
      method: 'DELETE',
    })
    const res = await DELETE(req, {
      params: Promise.resolve({ id: '1' }),
    })

    expect(res.status).toBe(204)
    expect(recipientsApi.delete).toHaveBeenCalledWith('1')
  })
})
