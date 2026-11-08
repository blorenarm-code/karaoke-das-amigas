import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { SeletorCantoras } from '../components/SeletorCantoras'
import { Botao, Cabecalho, Energia, FundoBalada, Janela } from '../components/ui'
import { ir } from '../lib/rota'
import { actions, todasMusicas, useStore } from '../store'
import { CATEGORIAS, DECADAS, type Categoria, type Song } from '../types'

const ICONE: Record<Categoria, string> = {
  'Sertanejo Raiz': '🤠',
  'Pop Nacional': '🇧🇷',
  'Funk das Antigas': '🔊',
  Internacional: '🌎',
  'Divas Pop': '👑',
}

export const normalizar = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function Catalogo() {
  const s = useStore((x) => x)
  const [aba, setAba] = useState<Categoria>(CATEGORIAS[0])
  const [decada, setDecada] = useState('')
  const [busca, setBusca] = useState('')
  const [escolhida, setEscolhida] = useState<Song | null>(null)

  const musicas = useMemo(() => todasMusicas(s).filter((m) => !m.oculta), [s])

  const grupos = useMemo(() => {
    const b = normalizar(busca.trim())
    const lista = musicas
      .filter((m) => (b ? normalizar(`${m.titulo} ${m.artista}`).includes(b) : m.categoria === aba))
      .filter((m) => !decada || m.decada === decada)
    const porArtista = new Map<string, Song[]>()
    for (const m of lista) porArtista.set(m.artista, [...(porArtista.get(m.artista) ?? []), m])
    return [...porArtista.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [musicas, aba, decada, busca])

  return (
    <div className="flex h-full flex-col">
      <FundoBalada calmo />
      <Cabecalho titulo="🎵 Catálogo" voltar={() => ir('fila')}>
        <input
          className="campo w-[30vw] text-base"
          placeholder="🔍 Música ou cantor…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Botao cor="azul" tamanho="sm" onClick={() => ir('youtube')}>🔎 Buscar no YouTube</Botao>
      </Cabecalho>

      {/* abas de estilo */}
      <div className="rolagem-x flex shrink-0 gap-2 px-4 pt-2">
        {CATEGORIAS.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setAba(c); setBusca('') }}
            className={`whitespace-nowrap rounded-full px-4 py-1 text-base font-extrabold transition-colors ${
              aba === c && !busca ? 'bg-gradient-to-br from-[#ff2ea6] to-[#a855f7] shadow-[0_0_14px_#ff2ea6]' : 'bg-white/10'
            }`}
          >
            {ICONE[c]} {c}
          </motion.button>
        ))}
      </div>
      {/* décadas */}
      <div className="flex shrink-0 items-center gap-2 px-4 pt-2">
        <span className="text-sm text-white/60">Década:</span>
        {['', ...DECADAS].map((d) => (
          <button
            key={d}
            onClick={() => setDecada(d)}
            className={`rounded-full px-3 text-sm font-bold ${decada === d ? 'bg-[#ffe140] text-[#2a0b4d]' : 'bg-white/10'}`}
          >
            {d ? `Anos ${d}` : 'Todas'}
          </button>
        ))}
        {busca && <span className="ml-auto text-sm text-[#38bdf8]">Buscando em todos os estilos</span>}
      </div>

      <div className="rolagem min-h-0 flex-1 px-4 py-2">
        {!grupos.length && (
          <p className="mt-8 text-center text-xl text-white/70">
            Nada por aqui 😕 Tenta outra década ou <button className="font-bold text-[#38bdf8] underline" onClick={() => ir('youtube')}>busque no YouTube</button>.
          </p>
        )}
        <div className="columns-2 gap-3 lg:columns-3">
          {grupos.map(([artista, lista]) => (
            <div key={artista} className="painel mb-3 break-inside-avoid p-2">
              <p className="neon-amarelo px-1 text-lg font-extrabold">{artista}</p>
              {lista.map((m) => (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEscolhida(m)}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl bg-white/5 px-2 py-1 text-left hover:bg-white/15"
                >
                  <span className="min-w-0 flex-1 truncate text-base font-bold">{m.titulo}</span>
                  {m.decada && <span className="rounded-full bg-[#38bdf8]/25 px-2 text-xs font-bold">{m.decada}</span>}
                  <Energia n={m.energia} />
                  <span className="text-lg text-[#ff2ea6]">＋</span>
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <DialogoFila song={escolhida} fechar={() => setEscolhida(null)} />
    </div>
  )
}

/** Janela: escolher quem canta e mandar para a fila */
export function DialogoFila({ song, fechar }: { song: Song | null; fechar: () => void }) {
  const [quem, setQuem] = useState<string[]>([])
  const enviar = (agora: boolean) => {
    if (!song || !quem.length) return
    actions.enqueue(song.id, quem, agora)
    setQuem([])
    fechar()
    ir(agora ? 'palco' : 'fila')
  }
  return (
    <Janela aberta={!!song} fechar={fechar}>
      {song && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="neon-rosa text-2xl font-extrabold leading-tight">{song.titulo}</p>
            <p className="text-white/70">{song.artista} {song.decada && `· anos ${song.decada}`}</p>
          </div>
          <SeletorCantoras escolhidas={quem} setEscolhidas={setQuem} />
          <div className="flex gap-2">
            <Botao cor="roxo" className="flex-1" disabled={!quem.length} onClick={() => enviar(false)}>📋 Pôr na fila</Botao>
            <Botao cor="rosa" className="flex-1" disabled={!quem.length} onClick={() => enviar(true)}>🎤 Cantar agora!</Botao>
          </div>
        </div>
      )}
    </Janela>
  )
}
