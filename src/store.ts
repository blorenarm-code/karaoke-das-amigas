// Estado do app. Tudo fica salvo no localStorage do celular (sem servidor).
import { useSyncExternalStore } from 'react'
import baseSongs from './data/songs.json'
import type { QueueItem, Result, Singer, Song } from './types'
import { gerarResultado } from './lib/score'

type SongAjustes = Partial<Pick<Song, 'youtubeId' | 'energia' | 'offsetLetra'>>

export interface State {
  partyName: string
  apiKey: string // opcional: chave digitada nas Configurações (vale mais que a do .env)
  singers: Singer[]
  queue: QueueItem[]
  results: Result[]
  ajustes: Record<string, SongAjustes> // mudanças nas músicas do catálogo inicial
  customSongs: Song[] // músicas vindas da busca no YouTube
  candidatos: Record<string, string[]> // vídeos encontrados para cada música (para tentar o próximo)
  lastResultId?: string
}

const KEY = 'karaoke-das-amigas-v1'

const inicial: State = {
  partyName: 'Karaokê das Amigas',
  apiKey: '',
  singers: [],
  queue: [],
  results: [],
  ajustes: {},
  customSongs: [],
  candidatos: {},
}

function carregar(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...inicial, ...JSON.parse(raw) }
  } catch {
    /* sem localStorage: segue com o estado inicial */
  }
  return inicial
}

let state: State = carregar()
const ouvintes = new Set<() => void>()

function set(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...p }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* cheio ou bloqueado: ignora */
  }
  ouvintes.forEach((f) => f())
}

export const getState = () => state

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f)
      return () => ouvintes.delete(f)
    },
    () => sel(state),
  )
}

// ---------- músicas ----------
const base = baseSongs as Song[]

export function todasMusicas(s: State): Song[] {
  return [...base.map((m) => ({ ...m, ...s.ajustes[m.id] })), ...s.customSongs]
}

export function acharMusica(s: State, id: string): Song | undefined {
  const b = base.find((m) => m.id === id)
  if (b) return { ...b, ...s.ajustes[id] }
  return s.customSongs.find((m) => m.id === id)
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const actions = {
  setPartyName: (partyName: string) => set({ partyName }),
  setApiKey: (apiKey: string) => set({ apiKey: apiKey.trim() }),

  // cantoras
  addSinger: (s: Omit<Singer, 'id'>) => set((st) => ({ singers: [...st.singers, { ...s, id: uid() }] })),
  updateSinger: (id: string, p: Partial<Singer>) =>
    set((st) => ({ singers: st.singers.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
  removeSinger: (id: string) =>
    set((st) => ({
      singers: st.singers.filter((x) => x.id !== id),
      queue: st.queue
        .map((q) => ({ ...q, singerIds: q.singerIds.filter((s) => s !== id) }))
        .filter((q) => q.singerIds.length > 0),
    })),

  // músicas
  updateSong: (id: string, p: SongAjustes) =>
    set((st) => {
      if (st.customSongs.some((m) => m.id === id))
        return { customSongs: st.customSongs.map((m) => (m.id === id ? { ...m, ...p } : m)) }
      return { ajustes: { ...st.ajustes, [id]: { ...st.ajustes[id], ...p } } }
    }),
  addCustomSong: (m: Omit<Song, 'id' | 'custom' | 'offsetLetra'>): string => {
    const id = 'yt-' + uid()
    set((st) => ({ customSongs: [...st.customSongs, { ...m, id, custom: true, offsetLetra: 0 }] }))
    return id
  },
  removeCustomSong: (id: string) => set((st) => ({ customSongs: st.customSongs.filter((m) => m.id !== id) })),
  setCandidatos: (id: string, ids: string[]) => set((st) => ({ candidatos: { ...st.candidatos, [id]: ids } })),

  // fila
  enqueue: (songId: string, singerIds: string[], primeiro = false) =>
    set((st) => {
      const item = { id: uid(), songId, singerIds }
      return { queue: primeiro ? [item, ...st.queue] : [...st.queue, item] }
    }),
  removeFromQueue: (id: string) => set((st) => ({ queue: st.queue.filter((q) => q.id !== id) })),
  moveInQueue: (id: string, dir: -1 | 1) =>
    set((st) => {
      const q = [...st.queue]
      const i = q.findIndex((x) => x.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= q.length) return {}
      ;[q[i], q[j]] = [q[j], q[i]]
      return { queue: q }
    }),
  /** Tira a música atual da fila sem nota */
  skipCurrent: () => set((st) => ({ queue: st.queue.slice(1) })),
  /** Encerra a música atual, sorteia a nota e guarda o resultado. Devolve o resultado. */
  finishCurrent: (): Result | undefined => {
    const item = state.queue[0]
    if (!item) return
    const song = acharMusica(state, item.songId)
    if (!song) return
    const r = gerarResultado(song, item.singerIds)
    set((st) => ({ queue: st.queue.slice(1), results: [...st.results, r], lastResultId: r.id }))
    return r
  },

  /** Zera a noite: fila e notas (mantém cantoras e catálogo) */
  resetNight: () => set({ queue: [], results: [], lastResultId: undefined }),
}
