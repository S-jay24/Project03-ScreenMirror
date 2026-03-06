import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dashboard from '@/components/Dashboard'

describe('Connection Sequence', () => {
  it('shows the mirroring active status after the connection sequence', async () => {
    render(<Dashboard />)
    const startButton = screen.getByRole('button', { name: /Start Mirroring/i })
    
    fireEvent.click(startButton)
    
    // Check for "Mirroring Active" status after the mock connection delay
    await waitFor(() => {
      expect(screen.getByText(/Mirroring Active/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
