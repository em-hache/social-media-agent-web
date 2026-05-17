import { render, screen } from '@testing-library/react'
import StatusBadge from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders correct Spanish label for "active"', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('activo')).toBeInTheDocument()
  })

  it('renders correct Spanish label for "inactive"', () => {
    render(<StatusBadge status="inactive" />)
    expect(screen.getByText('inactivo')).toBeInTheDocument()
  })

  it('renders correct Spanish label for "sent"', () => {
    render(<StatusBadge status="sent" />)
    expect(screen.getByText('enviado')).toBeInTheDocument()
  })

  it('renders correct Spanish label for "pending"', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('pendiente')).toBeInTheDocument()
  })

  it('renders correct Spanish label for "connected"', () => {
    render(<StatusBadge status="connected" />)
    expect(screen.getByText('conectado')).toBeInTheDocument()
  })

  it('renders correct Spanish label for "pending_approval"', () => {
    render(<StatusBadge status="pending_approval" />)
    expect(screen.getByText('pendiente de aprobación')).toBeInTheDocument()
  })

  it('applies green classes for "active" status', () => {
    render(<StatusBadge status="active" />)
    const badge = screen.getByText('activo')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-700')
  })

  it('applies red classes for "failed" status', () => {
    render(<StatusBadge status="failed" />)
    const badge = screen.getByText('fallido')
    expect(badge.className).toContain('bg-red-100')
    expect(badge.className).toContain('text-red-700')
  })

  it('applies amber classes for "pending" status', () => {
    render(<StatusBadge status="pending" />)
    const badge = screen.getByText('pendiente')
    expect(badge.className).toContain('bg-amber-100')
    expect(badge.className).toContain('text-amber-700')
  })

  it('applies purple classes for "admin" role', () => {
    render(<StatusBadge status="admin" />)
    const badge = screen.getByText('admin')
    expect(badge.className).toContain('bg-purple-100')
    expect(badge.className).toContain('text-purple-700')
  })

  it('falls back to gray for unknown statuses', () => {
    render(<StatusBadge status="unknown_value" />)
    const badge = screen.getByText('unknown value')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-700')
  })

  it('replaces underscores with spaces for unknown statuses', () => {
    render(<StatusBadge status="some_custom_status" />)
    expect(screen.getByText('some custom_status')).toBeInTheDocument()
  })
})
