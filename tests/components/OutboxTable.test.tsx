import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OutboxPage from '@/app/(dashboard)/dashboard/outbox/page'

const mockPendingEntries = [
  {
    id: '1',
    message_body: 'Hola mundo',
    recipient_phone: '+34600111222',
    recipient_name: 'Juan García',
    status: 'pending' as const,
    created_at: '2024-01-15T10:00:00Z',
    completed_at: null,
  },
]

const mockSentEntries = [
  {
    id: '2',
    message_body: 'Mensaje enviado',
    recipient_phone: '+34600333444',
    recipient_name: 'María López',
    status: 'sent' as const,
    created_at: '2024-01-14T09:00:00Z',
    completed_at: '2024-01-14T09:01:00Z',
  },
]

const mockRecipients = [
  { id: '1', name: 'Juan García', phone: '+34600111222', email: 'juan@test.com', is_active: true },
]

/** Set up fetch mock to respond to the initial mount (recipients + pending tab). */
function mockInitialLoad(
  recipients = mockRecipients,
  pending = mockPendingEntries
) {
  const fetchMock = global.fetch as jest.Mock
  // First call: recipients list (useEffect on mount)
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => recipients,
  })
  // Second call: pending entries (default tab)
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => pending,
  })
}

describe('OutboxPage', () => {
  it('renders the page title', () => {
    mockInitialLoad()
    render(<OutboxPage />)
    expect(
      screen.getByRole('heading', { name: 'Historial de mensajes' })
    ).toBeInTheDocument()
  })

  it('renders the three tab buttons', () => {
    mockInitialLoad()
    render(<OutboxPage />)
    expect(screen.getByText('Pendientes')).toBeInTheDocument()
    expect(screen.getByText('Enviados')).toBeInTheDocument()
    expect(screen.getByText('Por destinatario')).toBeInTheDocument()
  })

  it('loads and displays pending entries by default', async () => {
    mockInitialLoad()
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument()
    })
    expect(screen.getByText('+34600111222')).toBeInTheDocument()
    expect(screen.getByText('pendiente')).toBeInTheDocument()
  })

  it('shows message count', async () => {
    mockInitialLoad()
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.getByText('1 mensaje')).toBeInTheDocument()
    })
  })

  it('shows "no messages" when empty', async () => {
    mockInitialLoad(mockRecipients, [])
    render(<OutboxPage />)

    await waitFor(() => {
      expect(
        screen.getByText('No se encontraron mensajes.')
      ).toBeInTheDocument()
    })
  })

  it('renders table headers for entries', async () => {
    mockInitialLoad()
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.getByText('Fecha')).toBeInTheDocument()
    })
    expect(screen.getByText('Destinatario')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Enviado el')).toBeInTheDocument()
  })

  it('renders a "Detalles" link per entry', async () => {
    mockInitialLoad()
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.getByText('Detalles')).toBeInTheDocument()
    })
  })

  it('opens detail modal when Detalles is clicked', async () => {
    const user = userEvent.setup()
    mockInitialLoad()
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.getByText('Detalles')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Detalles'))

    expect(screen.getByText('Detalles del mensaje')).toBeInTheDocument()
    expect(screen.getByText('Hola mundo')).toBeInTheDocument()
  })

  it('shows date filters when switching to the Enviados tab', async () => {
    const user = userEvent.setup()
    mockInitialLoad()
    render(<OutboxPage />)

    // Wait for initial load to finish
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
    })

    // Mock the sent-tab fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSentEntries,
    })

    await user.click(screen.getByText('Enviados'))

    await waitFor(() => {
      expect(screen.getByText('Desde')).toBeInTheDocument()
    })
    expect(screen.getByText('Hasta')).toBeInTheDocument()
  })

  it('shows status filter when switching to the Por destinatario tab', async () => {
    const user = userEvent.setup()
    mockInitialLoad()
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByText('Por destinatario'))

    expect(screen.getByText('Todos los estados')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Buscar destinatario...')
    ).toBeInTheDocument()
  })

  it('shows plural "mensajes" for multiple entries', async () => {
    const twoEntries = [...mockPendingEntries, { ...mockPendingEntries[0], id: '99' }]
    mockInitialLoad(mockRecipients, twoEntries)
    render(<OutboxPage />)

    await waitFor(() => {
      expect(screen.getByText('2 mensajes')).toBeInTheDocument()
    })
  })
})
