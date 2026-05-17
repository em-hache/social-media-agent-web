import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipientsPage from '@/app/(dashboard)/dashboard/recipients/page'

const mockRecipients = [
  { id: '1', name: 'Juan García', phone: '+34600111222', email: 'juan@test.com', is_active: true },
  { id: '2', name: 'María López', phone: '+34600333444', email: 'maria@test.com', is_active: false },
  { id: '3', name: 'Pedro Sánchez', phone: '+34600555666', email: null, is_active: true },
]

function mockFetchRecipientsOk(data = mockRecipients) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  })
}

describe('RecipientsPage', () => {
  beforeEach(() => {
    mockFetchRecipientsOk()
  })

  it('renders the page title "Destinatarios"', () => {
    render(<RecipientsPage />)
    expect(screen.getByRole('heading', { name: 'Destinatarios' })).toBeInTheDocument()
  })

  it('shows loading indicator initially', () => {
    render(<RecipientsPage />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renders the recipients table after loading', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })
    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.getByText('Pedro Sánchez')).toBeInTheDocument()
  })

  it('renders table column headers', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('Nombre')).toBeInTheDocument()
    })
    expect(screen.getByText('Teléfono')).toBeInTheDocument()
    expect(screen.getByText('Correo')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('renders phone numbers in the table', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('+34600111222')).toBeInTheDocument()
    })
    expect(screen.getByText('+34600333444')).toBeInTheDocument()
  })

  it('shows dash for recipients without email', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('Pedro Sánchez')).toBeInTheDocument()
    })
    // Pedro has no email → shows "—"
    const cells = screen.getAllByText('—')
    expect(cells.length).toBeGreaterThanOrEqual(1)
  })

  it('shows status badges for active and inactive recipients', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })
    // Juan and Pedro are active, María is inactive
    expect(screen.getAllByText('activo')).toHaveLength(2)
    expect(screen.getByText('inactivo')).toBeInTheDocument()
  })

  it('filters recipients by name when typing in search', async () => {
    const user = userEvent.setup()
    render(<RecipientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'Filtrar por nombre, teléfono o correo...'
    )
    await user.type(searchInput, 'María')

    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.queryByText('Juan García')).not.toBeInTheDocument()
    expect(screen.queryByText('Pedro Sánchez')).not.toBeInTheDocument()
  })

  it('filters recipients by phone number', async () => {
    const user = userEvent.setup()
    render(<RecipientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'Filtrar por nombre, teléfono o correo...'
    )
    await user.type(searchInput, '600333')

    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.queryByText('Juan García')).not.toBeInTheDocument()
  })

  it('shows "no matches" message when filter returns nothing', async () => {
    const user = userEvent.setup()
    render(<RecipientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'Filtrar por nombre, teléfono o correo...'
    )
    await user.type(searchInput, 'zzz_no_match')

    expect(
      screen.getByText('Ningún destinatario coincide con tu filtro.')
    ).toBeInTheDocument()
  })

  it('shows pagination info', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })
    expect(screen.getByText(/Mostrando 1–3 de 3/)).toBeInTheDocument()
  })

  it('disables "Anterior" button on first page', async () => {
    render(<RecipientsPage />)
    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })
    expect(screen.getByTitle('Página anterior')).toBeDisabled()
  })

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<RecipientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })

    // Find the first row's edit tooltip and click its button
    const editTooltips = screen.getAllByText('Editar')
    const editWrapper = editTooltips[0].parentElement!
    const editButton = editWrapper.querySelector('button')!
    await user.click(editButton)

    expect(screen.getByText('Editar destinatario')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Juan García')).toBeInTheDocument()
  })

  it('closes edit modal when Cancelar is clicked', async () => {
    const user = userEvent.setup()
    render(<RecipientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })

    const editTooltips = screen.getAllByText('Editar')
    const editWrapper = editTooltips[0].parentElement!
    await user.click(editWrapper.querySelector('button')!)

    expect(screen.getByText('Editar destinatario')).toBeInTheDocument()

    await user.click(screen.getByTitle('Cancelar edición'))

    expect(screen.queryByText('Editar destinatario')).not.toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false })

    render(<RecipientsPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch recipients')
      ).toBeInTheDocument()
    })
  })

  it('shows empty state when there are no recipients', async () => {
    ;(global.fetch as jest.Mock).mockReset()
    mockFetchRecipientsOk([])

    render(<RecipientsPage />)

    await waitFor(() => {
      expect(
        screen.getByText('No se encontraron destinatarios.')
      ).toBeInTheDocument()
    })
  })

  it('calls toggle active endpoint when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<RecipientsPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })

    // Mock the toggle response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockRecipients[0], is_active: false }),
    })

    // Click deactivate on the first active recipient
    const deactivateTooltips = screen.getAllByText('Desactivar')
    const toggleWrapper = deactivateTooltips[0].parentElement!
    await user.click(toggleWrapper.querySelector('button')!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/recipients/1/deactivate',
        { method: 'PUT' }
      )
    })
  })
})
