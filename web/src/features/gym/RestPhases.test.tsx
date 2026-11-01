import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { db } from '../../db/db'
import { createDay, createMacro, createMeso, saveItems, startSession } from '../../db/queries'

beforeEach(async () => {
  localStorage.clear()
  localStorage.setItem('mejorando.paseo', 'hecho')
  sessionStorage.setItem('mejorando.splash', '1')
  await Promise.all([
    db.macrocycles.clear(),
    db.mesocycles.clear(),
    db.trainings.clear(),
    db.sessions.clear(),
    db.sets.clear(),
  ])
})

/** Una sesión que está descansando y a la que le quedan estos segundos. */
async function descansando(segundosRestantes: number) {
  const macro = await createMacro(db, 'M')
  const meso = await createMeso(db, macro.id, 'PPL')
  const day = await createDay(db, meso.id, 'Push')
  await saveItems(db, day.id, [
    {
      id: 'a',
      kind: 'normal',
      exerciseId: 'press-banca',
      sets: 3,
      target: { kind: 'fixed', reps: 8 },
      restSec: 120,
    },
  ])
  const session = await startSession(db, (await db.trainings.get(day.id))!, meso, 1)
  await db.sessions.update(session.id, {
    stepIndex: 2,
    restEndAt: Date.now() + segundosRestantes * 1000,
    restTotalSec: 120,
  })
  window.history.pushState({}, '', `/gym/sesion/${session.id}`)
}

describe('el descanso avisa con el color y con el texto', () => {
  it('pasa a amarillo a los 15 segundos', async () => {
    await descansando(13)
    const { container } = render(<App splash={false} />)
    expect(await screen.findByText('YA CASI')).toBeInTheDocument()
    expect(container.querySelector('.restwrap')).toHaveAttribute('data-phase', 'warn')
  })

  it('pasa a rojo a los 10 segundos', async () => {
    await descansando(8)
    const { container } = render(<App splash={false} />)
    expect(await screen.findByText('PREPARATE')).toBeInTheDocument()
    expect(container.querySelector('.restwrap')).toHaveAttribute('data-phase', 'alert')
  })

  it('al terminar pasa a verde y deja seguir', async () => {
    await descansando(-1)
    const { container } = render(<App splash={false} />)
    expect(await screen.findByText('LISTO')).toBeInTheDocument()
    expect(container.querySelector('.restwrap')).toHaveAttribute('data-phase', 'done')
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled()
  })

  it('con tiempo de sobra mantiene el color de siempre', async () => {
    await descansando(90)
    const { container } = render(<App splash={false} />)
    expect(await screen.findByText('DESCANSO')).toBeInTheDocument()
    expect(container.querySelector('.restwrap')).toHaveAttribute('data-phase', 'normal')
  })
})
