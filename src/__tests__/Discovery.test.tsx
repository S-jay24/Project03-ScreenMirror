import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '@/components/Dashboard'

describe('Device Discovery', () => {
  it('shows a discovered device when mirroring starts', async () => {
    render(<Dashboard />)
    const startButton = screen.getByRole('button', { name: /Start Mirroring/i })
    
    fireEvent.click(startButton)
    
    // Check if the mock device appears after "starting"
    await waitFor(() => {
      expect(screen.getByText(/iPhone 15 Pro/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
