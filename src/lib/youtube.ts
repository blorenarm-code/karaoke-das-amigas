// YouTube: busca (Data API v3) e player (IFrame Player API)
import { getState } from '../store'

export interface VideoResult {
  id: string
  titulo: string
  canal: string
  thumb: string
}

export type ErroTipo = 'sem-chave' | 'sem-internet' | 'cota' | 'chave-invalida' | 'outro'

export class YouTubeErro extends Error {
  constructor(public tipo: ErroTipo, msg: string) {
    super(msg)
  }
}

export const MENSAGEM_ERRO: Record<ErroTipo, string> = {
  'sem-chave':
    'Falta a chave do YouTube 🔑 Coloque em ⚙️ Configurações (ou no .env). Enquanto isso, dá pra colar o link do clipe.',
  'sem-internet': 'Sem internet 😢 Confere o Wi-Fi e tenta de novo.',
  cota: 'O YouTube cansou de tanta busca hoje 😅 (limite diário da chave). Cole o link do clipe ou tente amanhã.',
  'chave-invalida': 'A chave do YouTube parece errada 🤔 Confere em ⚙️ Configurações.',
  outro: 'O YouTube não respondeu agora. Tenta de novo daqui a pouco!',
}

export function chaveYouTube(): string {
  return getState().apiKey || import.meta.env.VITE_YOUTUBE_API_KEY || ''
}

function decodificar(html: string): string {
  const t = document.createElement('textarea')
  t.innerHTML = html
  return t.value
}

/** Busca vídeos de música que podem ser tocados fora do YouTube */
export async function buscarVideos(q: string, max = 12): Promise<VideoResult[]> {
  const key = chaveYouTube()
  if (!key) throw new YouTubeErro('sem-chave', 'sem chave')
  if (!navigator.onLine) throw new YouTubeErro('sem-internet', 'offline')
  const p = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    videoCategoryId: '10',
    maxResults: String(max),
    regionCode: 'BR',
    q,
    key,
  })
  let res: Response
  try {
    res = await fetch(`https://www.googleapis.com/youtube/v3/search?${p}`)
  } catch {
    throw new YouTubeErro('sem-internet', 'falha de rede')
  }
  if (!res.ok) {
    const corpo = await res.json().catch(() => ({}))
    const motivo: string = corpo?.error?.errors?.[0]?.reason ?? ''
    if (motivo.includes('quota')) throw new YouTubeErro('cota', motivo)
    if (res.status === 400 || res.status === 403) throw new YouTubeErro('chave-invalida', motivo)
    throw new YouTubeErro('outro', motivo)
  }
  const data = await res.json()
  return (data.items ?? [])
    .filter((it: any) => it.id?.videoId)
    .map((it: any) => ({
      id: it.id.videoId,
      titulo: decodificar(it.snippet.title),
      canal: decodificar(it.snippet.channelTitle),
      thumb: it.snippet.thumbnails?.medium?.url ?? it.snippet.thumbnails?.default?.url,
    }))
}

/** Pega o ID de um link do YouTube (ou o próprio ID) */
export function extrairIdYouTube(texto: string): string | null {
  const t = texto.trim()
  if (/^[\w-]{11}$/.test(t)) return t
  const m = t.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/)
  return m ? m[1] : null
}

/** Tenta separar "Artista - Música (Official Video)" */
export function separarTitulo(titulo: string, canal: string): { titulo: string; artista: string } {
  const limpo = titulo
    .replace(/\s*[([](?:official|clipe|video|vídeo|lyric|audio|áudio|hd|4k|remaster)[^)\]]*[)\]]/gi, '')
    .replace(/\s*\|.*$/, '')
    .trim()
  const partes = limpo.split(/\s+[-–—]\s+/)
  if (partes.length >= 2) return { artista: partes[0].trim(), titulo: partes.slice(1).join(' - ').trim() }
  return { titulo: limpo, artista: canal.replace(/\s*(VEVO|- Topic|Oficial|Official)$/i, '').trim() }
}

// ---------- IFrame Player API ----------
declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let carregando: Promise<any> | null = null

export function carregarApiPlayer(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (carregando) return carregando
  carregando = new Promise((resolve, reject) => {
    const anterior = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      anterior?.()
      resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.onerror = () => {
      carregando = null
      reject(new Error('não carregou'))
    }
    document.head.appendChild(s)
  })
  return carregando
}

export const ESTADO = { NAO_INICIADO: -1, TERMINOU: 0, TOCANDO: 1, PAUSADO: 2, CARREGANDO: 3, NA_FILA: 5 }
/** Erros que significam "esse vídeo não toca aqui": vale tentar outro */
export const ERROS_TROCAR = [2, 5, 100, 101, 150]
