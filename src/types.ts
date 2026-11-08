export const CATEGORIAS = ['Sertanejo Raiz', 'Pop Nacional', 'Funk das Antigas', 'Internacional', 'Divas Pop'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const DECADAS = ['80', '90', '2000', '2010'] as const

export interface Song {
  id: string
  titulo: string
  artista: string
  decada: string
  categoria: Categoria
  energia: number // 1 a 5
  youtubeId: string
  offsetLetra: number // segundos (positivo = letra aparece antes)
  custom?: boolean // veio da busca no YouTube
  oculta?: boolean // pedido de última hora que não foi salvo no catálogo
}

export interface Singer {
  id: string
  nome: string
  emoji: string
  cor: string
}

export interface QueueItem {
  id: string
  songId: string
  singerIds: string[]
}

export interface Result {
  id: string
  songId: string
  titulo: string
  artista: string
  categoria: Categoria
  energia: number
  singerIds: string[]
  nota: number
  estrelas: number
  mensagem: string
  at: number
}

export type Route = 'inicio' | 'cantoras' | 'catalogo' | 'youtube' | 'fila' | 'palco' | 'nota' | 'podio' | 'config'
