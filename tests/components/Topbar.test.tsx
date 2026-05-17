import { render, screen } from '@testing-library/react'
import Topbar from '@/components/Topbar'

describe('Topbar', () => {
  it('renders the title as a heading', () => {
    render(<Topbar title="Destinatarios" />)
    expect(
      screen.getByRole('heading', { name: 'Destinatarios' })
    ).toBeInTheDocument()
  })

  it('renders inside a header element', () => {
    render(<Topbar title="Test" />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('updates when the title prop changes', () => {
    const { rerender } = render(<Topbar title="Listas" />)
    expect(screen.getByText('Listas')).toBeInTheDocument()

    rerender(<Topbar title="Usuarios" />)
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
    expect(screen.queryByText('Listas')).not.toBeInTheDocument()
  })
})
