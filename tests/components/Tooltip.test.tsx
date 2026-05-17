import { render, screen } from '@testing-library/react'
import Tooltip from '@/components/Tooltip'

describe('Tooltip', () => {
  it('renders children content', () => {
    render(
      <Tooltip text="Ayuda">
        <button>Clic aquí</button>
      </Tooltip>
    )
    expect(screen.getByRole('button', { name: 'Clic aquí' })).toBeInTheDocument()
  })

  it('renders tooltip text in the DOM', () => {
    render(
      <Tooltip text="Texto de ayuda">
        <span>Trigger</span>
      </Tooltip>
    )
    expect(screen.getByText('Texto de ayuda')).toBeInTheDocument()
  })

  it('tooltip text is hidden by default (opacity-0)', () => {
    render(
      <Tooltip text="Oculto inicialmente">
        <span>Trigger</span>
      </Tooltip>
    )
    const tooltipText = screen.getByText('Oculto inicialmente')
    expect(tooltipText.className).toContain('opacity-0')
  })

  it('has CSS class to show on group hover', () => {
    render(
      <Tooltip text="Visible al pasar">
        <span>Trigger</span>
      </Tooltip>
    )
    const tooltipText = screen.getByText('Visible al pasar')
    expect(tooltipText.className).toContain('group-hover:opacity-100')
  })

  it('wraps content in a group container for hover behavior', () => {
    render(
      <Tooltip text="Tooltip">
        <span data-testid="child">Hijo</span>
      </Tooltip>
    )
    const child = screen.getByTestId('child')
    const wrapper = child.parentElement!
    expect(wrapper.className).toContain('group')
  })
})
