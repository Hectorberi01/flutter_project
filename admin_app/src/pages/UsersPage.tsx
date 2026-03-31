import { useEffect, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { usersApi } from '../api'
import {
  Card, Table, Tr, Td, Button, Badge, Avatar,
  PageHeader, Toast, Spinner, fmtDate,
} from '../components/ui'
import type { User } from '../types'

export default function UsersPage({ refresh }: { refresh: number }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setUsers(await usersApi.getAll()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load, refresh])

  const handleDelete = async (u: User) => {
    if (!confirm(`Supprimer l'utilisateur "${u.name}" ? Cette action est irréversible.`)) return
    setDeleting(u.id)
    try {
      await usersApi.delete(u.id)
      setToast({ msg: 'Utilisateur supprimé', type: 'success' })
      load()
    } catch (e: any) {
      setToast({ msg: e.response?.data?.message || e.message, type: 'error' })
    } finally { setDeleting(null) }
  }

  const admins = users.filter(u => u.role === 'admin').length

  return (
    <div className="animate-fade">
      <PageHeader
        title="Utilisateurs"
        sub={`${users.length} comptes · ${admins} admin(s)`}
      />

      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={24} /></div>
        ) : (
          <Table
            headers={['Utilisateur', 'Email', 'Rôle', 'Téléphone', 'Adresse', 'Inscrit le', 'Action']}
            empty={users.length === 0}
          >
            {users.map(u => (
              <Tr key={u.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.name} />
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </Td>
                <Td muted>{u.email}</Td>
                <Td><Badge value={u.role} /></Td>
                <Td muted>{u.phone || '—'}</Td>
                <Td muted style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.address || '—'}
                </Td>
                <Td muted>{fmtDate(u.createdAt)}</Td>
                <Td>
                  {u.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="danger"
                      icon={deleting === u.id ? <Spinner size={11} /> : <Trash2 size={12} />}
                      disabled={deleting === u.id}
                      onClick={() => handleDelete(u)}
                    >
                      Suppr.
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
