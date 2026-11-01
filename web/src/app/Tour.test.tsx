import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tour } from './Tour'

describe('paseo de bienvenida', () => {
  it('se muestra la primera vez y se recorre de principio a fin', async () => {
    localStorage.removeItem('mejorando.paseo')
    const user = userEvent.setup()
    render(<Tour />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Bienvenido a MejorAndo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    for (let n = 0; n < 5; n++) await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('Antes de empezar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Francis Holway' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@fholway',
    )
    await user.click(screen.getByRole('button', { name: 'Empezar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('mejorando.paseo')).toBe('hecho')
  })

  it('se puede saltar, y no vuelve a aparecer', async () => {
    localStorage.removeItem('mejorando.paseo')
    const user = userEvent.setup()
    const { unmount } = render(<Tour />)
    await user.click(screen.getByRole('button', { name: 'Saltar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    unmount()
    render(<Tour />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
