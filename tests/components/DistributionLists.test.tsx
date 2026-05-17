import { render, screen, waitFor } from '@testing-library/react'
import ListsPage from '@/app/(dashboard)/dashboard/lists/page'

const mockLists = [
  { id: '1', name: 'Marketing', description: 'Lista de marketing', recipient_count: 5 },
  { id: '2', name: 'Ventas', description: 'Lista de ventas', recipient_count: 12 },
  { id: '3', name: 'Soporte', description: 'Lista de soporte técnico', recipient_count: 0 },
]

function mockFetchListsOk(data = mockLists) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  })
}

describe('ListsPage', () => {
  beforeEach(() => {
    mockFetchListsOk()
  })

  it('renders the page title', () => {
    render(<ListsPage />)
    expect(
      screen.getByRole('heading', { name: 'Listas de distribución' })
    ).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<ListsPage />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renders all list cards after loading', async () => {
    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })
    expect(screen.getByText('Ventas')).toBeInTheDocument()
    expect(screen.getByText('Soporte')).toBeInTheDocument()
  })

  it('shows list descriptions', async () => {
    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Lista de marketing')).toBeInTheDocument()
    })
    expect(screen.getByText('Lista de ventas')).toBeInTheDocument()
    expect(screen.getByText('Lista de soporte técnico')).toBeInTheDocument()
  })

  it('shows recipient counts per list', async () => {
    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('5 destinatarios')).toBeInTheDocument()
    })
    expect(screen.getByText('12 destinatarios')).toBeInTheDocument()
    expect(screen.getByText('0 destinatarios')).toBeInTheDocument()
  })

  it('shows total list count', async () => {
    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('3 listas')).toBeInTheDocument()
    })
  })

  it('renders "Ver" links pointing to the correct detail pages', async () => {
    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })

    const viewLinks = screen.getAllByText('Ver')
    expect(viewLinks).toHaveLength(3)

    expect(viewLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/dashboard/lists/Marketing'
    )
    expect(viewLinks[1].closest('a')).toHaveAttribute(
      'href',
      '/dashboard/lists/Ventas'
    )
    expect(viewLinks[2].closest('a')).toHaveAttribute(
      'href',
      '/dashboard/lists/Soporte'
    )
  })

  it('shows error message when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false })

    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch lists')).toBeInTheDocument()
    })
  })

  it('renders empty grid when no lists exist', async () => {
    ;(global.fetch as jest.Mock).mockReset()
    mockFetchListsOk([])

    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('0 listas')).toBeInTheDocument()
    })
    expect(screen.queryByText('Ver')).not.toBeInTheDocument()
  })

  it('fetches from /api/lists on mount', async () => {
    render(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/lists')
  })
})
