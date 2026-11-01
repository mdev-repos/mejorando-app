import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { App } from './App'

type User = ReturnType<typeof userEvent.setup>

beforeEach(async () => {
  window.history.pushState({}, '', '/')
  localStorage.clear()
  await Promise.all([
    db.macrocycles.clear(),
    db.mesocycles.clear(),
    db.trainings.clear(),
    db.sessions.clear(),
    db.sets.clear(),
  ])
})

const click = async (user: User, name: RegExp | string) =>
  user.click(await screen.findByRole('button', { name }))

/** Arma un macrociclo, un mesociclo y un día vacío, y deja la pantalla en el día. */
async function armarDia(user: User, tipo: 'simple' | 'avanzada' = 'simple') {
  await click(user, /entrenando/i)
  await click(user, /nuevo macrociclo/i)
  await click(user, /nuevo mesociclo/i)
  if (tipo === 'avanzada') await user.click(await screen.findByRole('radio', { name: 'Avanzada' }))
  await click(user, 'Crear')
  await click(user, /agregar día/i)
  await screen.findByLabelText('Nombre del día')
}

async function agregarPressBanca(user: User) {
  await click(user, /agregar ejercicio/i)
  await click(user, /pectorales/i)
  await click(user, /press banca\s+barra$/i)
}

/** Guarda el ejercicio, espera a que vuelva al día y de ahí vuelve al mesociclo. */
async function guardarYVolver(user: User) {
  await click(user, /agregar al entrenamiento/i)
  await screen.findByText(/3 x 8 - 10/)
  await click(user, 'Volver')
}

describe('MejorAndo', () => {
  it('muestra la suite con EntrenAndo activo', async () => {
    render(<App splash={false} />)
    expect(await screen.findByRole('button', { name: /entrenando/i })).toBeInTheDocument()
    expect(screen.queryByText('AlimentAndo')).not.toBeInTheDocument()
  })

  it('baja por macrociclo, mesociclo y día, y entrena una ejecución', async () => {
    const user = userEvent.setup()
    render(<App splash={false} />)
    await armarDia(user)
    await agregarPressBanca(user)
    // una rutina simple va directo a series y repeticiones, sin elegir protocolo
    expect(screen.queryByRole('button', { name: /protocolo/i })).not.toBeInTheDocument()
    await click(user, /agregar al entrenamiento/i)
    expect(await screen.findByText(/3 x 8 - 10/)).toBeInTheDocument()

    await click(user, 'Volver')
    expect(await screen.findByText(/0 de 4 hechas/)).toBeInTheDocument()
    await click(user, /entrenar ejecución 1/i)

    expect(await screen.findByText(/ejecución 1 de 4/i)).toBeInTheDocument()
    await click(user, /no, ir directo/i)
    expect(await screen.findByText('Serie 1 de 3')).toBeInTheDocument()
    await click(user, 'Serie hecha')
    expect(await screen.findByText('DESCANSO')).toBeInTheDocument()
  })

  it('el descanso de la rutina se respeta, sin adelantarlo ni alargarlo', async () => {
    const user = userEvent.setup()
    render(<App splash={false} />)
    await armarDia(user)
    await agregarPressBanca(user)
    await guardarYVolver(user)
    await click(user, /entrenar ejecución 1/i)
    await click(user, /no, ir directo/i)
    await click(user, 'Serie hecha')

    expect(await screen.findByText('DESCANSO')).toBeInTheDocument()
    expect(screen.getByText('2:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descansando' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /15 s/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /empezar ya/i })).not.toBeInTheDocument()
  })

  it('el modo de prueba habilita adelantar el descanso', async () => {
    localStorage.setItem('mejorando.prueba', '1')
    const user = userEvent.setup()
    render(<App splash={false} />)
    await armarDia(user)
    await agregarPressBanca(user)
    await guardarYVolver(user)
    await click(user, /entrenar ejecución 1/i)
    await click(user, /no, ir directo/i)
    await click(user, 'Serie hecha')

    expect(await screen.findByRole('button', { name: /empezar ya/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+ 15 s/ })).toBeInTheDocument()
  })

  it('la ejecución siguiente compara con la anterior y marca la mejora', async () => {
    const user = userEvent.setup()
    render(<App splash={false} />)
    await armarDia(user)
    await agregarPressBanca(user)
    await guardarYVolver(user)

    await click(user, /entrenar ejecución 1/i)
    await click(user, /no, ir directo/i)
    const weight = await screen.findByLabelText('Kg')
    await user.clear(weight)
    await user.type(weight, '80')
    await click(user, 'Serie hecha')
    await screen.findByText('DESCANSO')
    await click(user, /lista del entrenamiento/i)
    await click(user, 'Terminar')
    await click(user, 'Confirmar fin')
    await click(user, 'Listo')

    // la sesión terminada deja en EntrenAndo, y de ahí se baja al mesociclo: la primera ejecución figura hecha
    await click(user, /macrociclo 1/i)
    await click(user, /mesociclo 1/i)
    expect(await screen.findByText(/1 de 4 hechas/)).toBeInTheDocument()
    await click(user, /entrenar ejecución 2/i)
    await click(user, /no, ir directo/i)
    expect(await screen.findByText(/última vez/i)).toBeInTheDocument()
    const w = screen.getByLabelText('Kg')
    await user.clear(w)
    await user.type(w, '82.5')
    expect(await screen.findByText(/mejoraste/i)).toBeInTheDocument()
  })

  it('una rutina avanzada ofrece protocolos y arma un escalonado', async () => {
    const user = userEvent.setup()
    render(<App splash={false} />)
    await armarDia(user, 'avanzada')
    await agregarPressBanca(user)
    await click(user, /protocolo/i)
    await click(user, /escalonado/i)
    expect(await screen.findByText(/quedan 10 \| 8 \| 6 \| 4/i)).toBeInTheDocument()
    await click(user, /agregar al entrenamiento/i)
    expect(await screen.findByText(/4 series, 10 \| 8 \| 6 \| 4/)).toBeInTheDocument()
  })
})
