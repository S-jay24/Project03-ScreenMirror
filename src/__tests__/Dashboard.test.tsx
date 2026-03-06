import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dashboard from '@/components/Dashboard'

describe('Dashboard Component', () => {
  it('renders the connection status indicator', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Ready to Connect/i)).toBeInTheDocument()
  })

  it('renders the mirroring toggle button', () => {
    render(<Dashboard />)
    expect(screen.getByRole('button', { name: /Start Mirroring/i })).toBeInTheDocument()
  })

  it('contains a section for discovered devices', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Nearby Devices/i)).toBeInTheDocument()
  })
})
