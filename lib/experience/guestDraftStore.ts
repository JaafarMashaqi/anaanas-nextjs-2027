export type GuestDraftRecord = {
  id: string
  intent: 'sale' | 'wanted' | 'auction'
  title: string
  description: string
  sectionId: number | null
  categoryId: number | null
  countryId: number | null
  cityId: string | null
  price: string
  savedAt: number
}

const KEY = 'ananas.guestDraft.v1'
const DB_NAME = 'ananas-guest-media'
const STORE = 'files'

function emptyDraft(): GuestDraftRecord {
  return {
    id: `draft_${Math.random().toString(36).slice(2, 10)}`,
    intent: 'sale',
    title: '',
    description: '',
    sectionId: null,
    categoryId: null,
    countryId: null,
    cityId: null,
    price: '',
    savedAt: 0,
  }
}

export function readGuestDraft(): GuestDraftRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GuestDraftRecord>
    if (!parsed || typeof parsed !== 'object' || typeof parsed.id !== 'string') return null
    return { ...emptyDraft(), ...parsed, id: parsed.id }
  } catch {
    return null
  }
}

export function writeGuestDraft(patch: Partial<GuestDraftRecord>): GuestDraftRecord {
  const current = readGuestDraft() ?? emptyDraft()
  const next: GuestDraftRecord = {
    ...current,
    ...patch,
    id: current.id,
    savedAt: Date.now(),
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  }
  return next
}

export function clearGuestDraft() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
  void openDb().then((db) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
  }).catch(() => undefined)
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'name' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveGuestFiles(files: File[]) {
  if (typeof window === 'undefined' || !window.indexedDB) return
  const db = await openDb()
  const records = await Promise.all(
    files.slice(0, 5).map(async (file) => ({
      name: file.name,
      type: file.type,
      buffer: await file.arrayBuffer(),
    })),
  )
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    records.forEach((record) => tx.objectStore(STORE).put(record))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function readGuestFiles(): Promise<File[]> {
  if (typeof window === 'undefined' || !window.indexedDB) return []
  const db = await openDb()
  const rows = await new Promise<Array<{ name: string; type: string; buffer: ArrayBuffer }>>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
  return rows
    .filter((row) => row?.buffer)
    .map((row) => new File([row.buffer], row.name || 'photo', { type: row.type || 'image/jpeg' }))
}