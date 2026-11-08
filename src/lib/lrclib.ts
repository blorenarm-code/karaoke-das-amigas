// Letras: buscadas na hora na API pública do LRCLIB (lrclib.net). Nenhuma letra fica no código.

export interface LinhaLetra {
  t: number // segundos
  texto: string
}

export interface CandidatoLetra {
  duracao: number
  sincronizada: string | null
  simples: string | null
}

export type Letra =
  | { tipo: 'sincronizada'; linhas: LinhaLetra[] }
  | { tipo: 'simples'; texto: string }
  | { tipo: 'nenhuma' }

const API = 'https://lrclib.net/api'

/** Converte o texto LRC ("[01:23.45] frase") em linhas com tempo */
export function lerLRC(lrc: string): LinhaLetra[] {
  const linhas: LinhaLetra[] = []
  for (const bruta of lrc.split(/\r?\n/)) {
    const tempos = [...bruta.matchAll(/\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g)]
    if (!tempos.length) continue
    const texto = bruta.replace(/\[[^\]]*\]/g, '').trim()
    for (const m of tempos) {
      const t = Number(m[1]) * 60 + Number(m[2].replace(':', '.'))
      linhas.push({ t, texto })
    }
  }
  linhas.sort((a, b) => a.t - b.t)
  // tira linhas vazias repetidas em sequência
  return linhas.filter((l, i) => l.texto || (i > 0 && linhas[i - 1].texto))
}

/** "Mark Ronson ft. Bruno Mars" → "Mark Ronson" */
const artistaPrincipal = (a: string) => a.split(/\s+(?:ft\.?|feat\.?|featuring|part\.?)\s+/i)[0].trim()
const semParenteses = (t: string) => t.replace(/\s*\([^)]*\)/g, '').trim()

async function pegarJson(url: string): Promise<any> {
  const r = await fetch(url)
  if (r.status === 404) return null
  if (!r.ok) throw new Error('LRCLIB ' + r.status)
  return r.json()
}

const paraCandidato = (x: any): CandidatoLetra => ({
  duracao: Number(x?.duration) || 0,
  sincronizada: x?.syncedLyrics || null,
  simples: x?.plainLyrics || null,
})

const cache = new Map<string, CandidatoLetra[]>()

/** Busca todas as versões da letra que o LRCLIB tiver. Lança erro se estiver sem internet. */
export async function buscarLetras(titulo: string, artista: string): Promise<CandidatoLetra[]> {
  const chave = `${titulo}|${artista}`
  if (cache.has(chave)) return cache.get(chave)!
  const art = artistaPrincipal(artista)
  const tentativas = [
    `${API}/search?${new URLSearchParams({ track_name: titulo, artist_name: art })}`,
    `${API}/search?${new URLSearchParams({ track_name: semParenteses(titulo), artist_name: art })}`,
    `${API}/search?${new URLSearchParams({ q: `${semParenteses(titulo)} ${art}` })}`,
  ]
  let achados: CandidatoLetra[] = []
  for (const url of tentativas) {
    const lista = await pegarJson(url)
    if (Array.isArray(lista)) achados = lista.map(paraCandidato).filter((c) => c.sincronizada || c.simples)
    if (achados.some((c) => c.sincronizada)) break
  }
  if (!achados.length) {
    const um = await pegarJson(`${API}/get?${new URLSearchParams({ track_name: titulo, artist_name: art })}`)
    if (um) achados = [paraCandidato(um)]
  }
  cache.set(chave, achados)
  return achados
}

/** Escolhe a melhor letra: sincronizada primeiro, com duração mais parecida com o vídeo */
export function escolherLetra(cands: CandidatoLetra[], duracaoVideo?: number): Letra {
  const sinc = cands.filter((c) => c.sincronizada)
  if (sinc.length) {
    const melhor = duracaoVideo
      ? [...sinc].sort((a, b) => Math.abs(a.duracao - duracaoVideo) - Math.abs(b.duracao - duracaoVideo))[0]
      : sinc[0]
    const linhas = lerLRC(melhor.sincronizada!)
    if (linhas.length > 2) return { tipo: 'sincronizada', linhas }
  }
  const simples = cands.find((c) => c.simples)
  if (simples) return { tipo: 'simples', texto: simples.simples! }
  return { tipo: 'nenhuma' }
}
