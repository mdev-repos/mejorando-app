import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Stepper } from './components'

function Probe({ start = 80, step = 2.5 }: { start?: number; step?: number }) {
  const [v, setV] = useState(start)
  return (
    <>
      <Stepper label="Kg" value={v} step={step} onChange={setV} />
      <output aria-label="valor">{v}</output>
    </>
  )
}

afterEach(() => vi.useRealTimers())

describe('Stepper', () => {
  it('muestra el número con coma decimal', () => {
    render(<Probe start={82.5} />)
    expect(screen.getByLabelText('Kg')).toHaveValue('82,5')
  })

  it('acepta lo que se escribe con coma o con punto', async () => {
    const user = userEvent.setup()
    render(<Probe />)
    const input = screen.getByLabelText('Kg')
    await user.clear(input)
    await user.type(input, '87,5')
    expect(screen.getByLabelText('valor')).toHaveTextContent('87.5')
    await user.clear(input)
    await user.type(input, '90.25')
    expect(screen.getByLabelText('valor')).toHaveTextContent('90.25')
  })

  it('un toque sube de a un paso', () => {
    render(<Probe />)
    fireEvent.pointerDown(screen.getByLabelText('Sumar'))
    fireEvent.pointerUp(screen.getByLabelText('Sumar'))
    expect(screen.getByLabelText('valor')).toHaveTextContent('82.5')
    fireEvent.pointerDown(screen.getByLabelText('Restar'))
    fireEvent.pointerUp(screen.getByLabelText('Restar'))
    expect(screen.getByLabelText('valor')).toHaveTextContent('80')
  })

  it('al mantener apretado repite y acelera, y al soltar se detiene', () => {
    vi.useFakeTimers()
    render(<Probe start={0} step={5} />)
    const plus = screen.getByLabelText('Sumar')
    fireEvent.pointerDown(plus)
    act(() => {
      vi.advanceTimersByTime(420 + 110 * 6)
    })
    const lento = Number(screen.getByLabelText('valor').textContent)
    expect(lento).toBe(5 + 5 * 6) // el primer toque y seis repeticiones, sin acelerar
    act(() => {
      vi.advanceTimersByTime(110 * 20)
    })
    const rapido = Number(screen.getByLabelText('valor').textContent)
    expect(rapido - lento).toBeGreaterThan(5 * 20) // con la aceleración suma más que un paso por repetición
    fireEvent.pointerUp(plus)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(Number(screen.getByLabelText('valor').textContent)).toBe(rapido)
  })

  it('no baja del mínimo', () => {
    render(<Probe start={1} step={2.5} />)
    fireEvent.pointerDown(screen.getByLabelText('Restar'))
    fireEvent.pointerUp(screen.getByLabelText('Restar'))
    expect(screen.getByLabelText('valor')).toHaveTextContent('0')
  })
})
