import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Page from '../app/page'

describe('Home Page', () => {
  it('renders the GravityStream welcome message', () => {
    render(<Page />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
