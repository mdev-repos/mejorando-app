import 'fake-indexeddb/auto'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { App } from './App'

beforeEach(async () => {
  window.history.pushState({}, '', '/')
  await Promise.all([db.trainings.clear(), db.sessions.clear(), db.sets.clear()])
})

describe('Camino+', () => {
  it('muestra la suite con Gym+ activo', async () => {
    render(<App splash={false} />)
    expect(await screen.findByRole('button', { name: /gym\+/i })).toBeInTheDocument()
    expect(screen.queryByText('Alimentación+')).not.toBeInTheDocument()
  })

  it('arma un entrenamiento eligiendo grupo y ejercicio, y lo entrena', async () => {
    const user = userEvent.setup()
    render(<App splash={false} />)

    await user.click(await screen.findByRole('button', { name: /gym\+/i }))
    await user.click(await screen.findByRole('button', { name: /nuevo entrenamiento/i }))
    await user.click(await screen.findByRole('button', { name: /agregar ejercicio/i }))
    await user.click(await screen.findByRole('button', { name: /pectorales/i }))
    await user.click(await screen.findByRole('button', { name: /press banca/i }))
    await user.click(await screen.findByRole('button', { name: /normal/i }))
    await user.click(await screen.findByRole('button', { name: /agregar al entrenamiento/i }))

    expect(await screen.findByText(/3 x 8 - 10/)).toBeInTheDocument()
    expect(screen.getByText('Press banca')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Entrenar' }))
    expect(await screen.findByText('¿Hacemos series de aproximación?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /no, ir directo/i }))

    expect(await screen.findByText('Serie 1 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Serie hecha' }))

    expect(await screen.findByText('DESCANSO')).toBeInTheDocument()
    expect(screen.getByText('Serie 2 de 3 · 8 - 10 reps')).toBeInTheDocument()
    await waitFor(async () => expect(await db.sets.count()).toBe(1))
  })

  it('compara con la vez anterior y marca la mejora', async () => {
    const user = userEvent.setup()
    render(<App splash={false} />)
    await user.click(await screen.findByRole('button', { name: /gym\+/i }))
    await user.click(await screen.findByRole('button', { name: /nuevo entrenamiento/i }))
    await user.click(await screen.findByRole('button', { name: /agregar ejercicio/i }))
    await user.click(await screen.findByRole('button', { name: /pectorales/i }))
    await user.click(await screen.findByRole('button', { name: /press banca/i }))
    await user.click(await screen.findByRole('button', { name: /normal/i }))
    await user.click(await screen.findByRole('button', { name: /agregar al entrenamiento/i }))
    await screen.findByText(/3 x 8 - 10/)

    // primera sesión, la terminamos a mano desde la lista
    await user.click(screen.getByRole('button', { name: 'Entrenar' }))
    await user.click(await screen.findByRole('button', { name: /no, ir directo/i }))
    const first = await screen.findByText('Serie 1 de 3')
    expect(first).toBeInTheDocument()
    const weight = screen.getByLabelText('Kg')
    await user.clear(weight)
    await user.type(weight, '80')
    await user.click(screen.getByRole('button', { name: 'Serie hecha' }))
    await screen.findByText('DESCANSO')
    await user.click(screen.getByRole('button', { name: /lista del entrenamiento/i }))
    await user.click(await screen.findByRole('button', { name: 'Terminar' }))
    await user.click(await screen.findByRole('button', { name: 'Confirmar fin' }))
    await user.click(await screen.findByRole('button', { name: 'Listo' }))

    // segunda sesión
    await user.click((await screen.findAllByText(/entrenamiento 1/i, { selector: '.t1' }))[0]!)
    await user.click(await screen.findByRole('button', { name: 'Entrenar' }))
    await user.click(await screen.findByRole('button', { name: /no, ir directo/i }))
    const form = within(
      await screen.findByText('Ahora').then((e) => e.parentElement as HTMLElement),
    )
    expect(await screen.findByText(/última vez/i)).toBeInTheDocument()
    expect(form.getByText(/igualaste/i)).toBeInTheDocument()
    const w = screen.getByLabelText('Kg')
    await user.clear(w)
    await user.type(w, '82.5')
    expect(await screen.findByText(/mejoraste/i)).toBeInTheDocument()
  })
})
