import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dashboard from '@/components/Dashboard'

describe('Network Monitoring', () => {
  it('displays real-time network latency metrics', () => {
    render(<Dashboard />)
    expect(screen.getByText(/ms/)).toBeInTheDocument()
    expect(screen.getByText(/Network Latency/i)).toBeInTheDocument()
  })
})
