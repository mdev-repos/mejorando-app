import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { backupDue, daysSince, snoozeBackup, useBackupSnooze, useLastBackup } from './backup'

/** Aviso para guardar una copia de los datos, que viven solo en este teléfono. */
export function BackupReminder() {
  const navigate = useNavigate()
  const [now] = useState(() => Date.now())
  const last = useLastBackup()
  const snoozedUntil = useBackupSnooze()
  const done = useLiveQuery(() => db.sessions.where('status').equals('done').count(), [])
  if (done === undefined || !backupDue({ now, last, doneSessions: done, snoozedUntil })) return null
  return (
    <div className="card stack">
      <div className="t1">Guardá una copia de tus datos</div>
      <div className="t2">
        {last === undefined
          ? 'Todavía no guardaste ninguna. '
          : `Hace ${daysSince(last, now)} días que no guardás una. `}
        Tus entrenamientos viven solo en este teléfono, y la copia es tu respaldo.
      </div>
      <div className="two">
        <button className="btn small" onClick={() => snoozeBackup()}>
          Más tarde
        </button>
        <button className="btn small primary" onClick={() => navigate('/ajustes')}>
          Ir a Ajustes
        </button>
      </div>
    </div>
  )
}
