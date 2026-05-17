import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QRPanel from '@/components/QRPanel'

describe('QRPanel', () => {
  it('shows placeholder when qr is null', () => {
    render(<QRPanel qr={null} onRefresh={jest.fn()} />)
    expect(screen.getByText('QR no disponible')).toBeInTheDocument()
  })

  it('does not show an image when qr is null', () => {
    render(<QRPanel qr={null} onRefresh={jest.fn()} />)
    expect(
      screen.queryByAltText('Código QR de WhatsApp')
    ).not.toBeInTheDocument()
  })

  it('shows QR image when qr is provided', () => {
    render(
      <QRPanel qr="data:image/png;base64,abc123" onRefresh={jest.fn()} />
    )
    const img = screen.getByAltText('Código QR de WhatsApp')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc123')
  })

  it('hides placeholder when qr is provided', () => {
    render(
      <QRPanel qr="data:image/png;base64,abc123" onRefresh={jest.fn()} />
    )
    expect(screen.queryByText('QR no disponible')).not.toBeInTheDocument()
  })

  it('renders the panel title', () => {
    render(<QRPanel qr={null} onRefresh={jest.fn()} />)
    expect(screen.getByText('Código QR')).toBeInTheDocument()
  })

  it('calls onRefresh when the Actualizar button is clicked', async () => {
    const user = userEvent.setup()
    const onRefresh = jest.fn()
    render(<QRPanel qr={null} onRefresh={onRefresh} />)

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('has an Actualizar button with correct title attribute', () => {
    render(<QRPanel qr={null} onRefresh={jest.fn()} />)
    const btn = screen.getByTitle('Actualizar código QR')
    expect(btn).toBeInTheDocument()
  })
})
