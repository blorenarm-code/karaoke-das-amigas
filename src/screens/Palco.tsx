import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BuscaYouTube } from '../components/BuscaYouTube'
import { Letras, type EstadoLetra } from '../components/Letras'
import { VideoYouTube } from '../components/VideoYouTube'
import { Botao, ChipCantora, Cabecalho, FundoBalada, nomesCantoras } from '../components/ui'
import { buscarLetras, escolherLetra, type CandidatoLetra } from '../lib/lrclib'
import { ir } from '../lib/rota'
import { buscarVideos, ERROS_TROCAR, ESTADO, MENSAGEM_ERRO, YouTubeErro } from '../lib/youtube'
import { manterTelaAcesa } from '../lib/device'
import { acharMusica, actions, getState, useStore } from '../store'
import type { Song } from '../types'

type StatusVideo =
  | { tipo: 'procurando' }
  | { tipo: 'ok' }
  | { tipo: 'bloqueado' }
  | { tipo: 'erro'; msg: string }

export function Palco() {
  const s = useStore((x) => x)
  const item = s.queue[0]
  const song = item ? acharMusica(s, item.songId) : undefined

  if (!item || !song)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
        <FundoBalada />
        <p className="neon-amarelo text-4xl font-extrabold">A fila tá vazia! 🎤</p>
        <p className="text-xl">Escolhe a próxima música pra festa continuar.</p>
        <div className="flex gap-3">
          <Botao cor="rosa" tamanho="lg" onClick={() => ir('catalogo')}>🎵 Escolher música</Botao>
          <Botao cor="escuro" tamanho="lg" onClick={() => ir('fila')}>📋 Ver fila</Botao>
        </div>
      </div>
    )

  // "key" faz tudo recomeçar do zero quando muda a música
  return <PalcoMusica key={item.id} song={song} singerIds={item.singerIds} />
}

function PalcoMusica({ song, singerIds }: { song: Song; singerIds: string[] }) {
  const singers = useStore((x) => x.singers)
  const queue = useStore((x) => x.queue)
  const [modo, setModo] = useState<'tocar' | 'trocar' | 'trocar-lyric'>('tocar')
  const [status, setStatus] = useState<StatusVideo>(song.youtubeId ? { tipo: 'ok' } : { tipo: 'procurando' })
  const [estadoPlayer, setEstadoPlayer] = useState(ESTADO.NAO_INICIADO)
  const [duracao, setDuracao] = useState(0)
  const [candLetras, setCandLetras] = useState<CandidatoLetra[] | null>(null)
  const [erroLetra, setErroLetra] = useState(false)
  const player = useRef<any>(null)
  const tentados = useRef(new Set<string>())
  const encerrando = useRef(false)

  useEffect(() => {
    manterTelaAcesa()
  }, [])

  // ---------- achar o vídeo ----------
  const procurarProximoVideo = useCallback(async () => {
    setStatus({ tipo: 'procurando' })
    try {
      let cands = getState().candidatos[song.id]
      if (!cands?.length || cands.every((c) => tentados.current.has(c))) {
        const r = await buscarVideos(`${song.titulo} ${song.artista} clipe oficial`, 6)
        cands = r.map((v) => v.id)
        actions.setCandidatos(song.id, cands)
      }
      const prox = cands.find((c) => !tentados.current.has(c))
      if (!prox) return setStatus({ tipo: 'bloqueado' })
      actions.updateSong(song.id, { youtubeId: prox })
      setStatus({ tipo: 'ok' })
    } catch (e) {
      setStatus({ tipo: 'erro', msg: e instanceof YouTubeErro ? MENSAGEM_ERRO[e.tipo] : MENSAGEM_ERRO.outro })
    }
  }, [song.id, song.titulo, song.artista])

  useEffect(() => {
    if (!song.youtubeId) procurarProximoVideo()
    // só na primeira vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const aoErroVideo = (codigo: number) => {
    if (ERROS_TROCAR.includes(codigo) && song.youtubeId) {
      tentados.current.add(song.youtubeId)
      procurarProximoVideo() // tenta o próximo resultado; se não houver, mostra o aviso
    } else if (codigo === -1) setStatus({ tipo: 'erro', msg: MENSAGEM_ERRO['sem-internet'] })
    else setStatus({ tipo: 'bloqueado' })
  }

  // ---------- letra ----------
  useEffect(() => {
    let vivo = true
    buscarLetras(song.titulo, song.artista)
      .then((c) => vivo && setCandLetras(c))
      .catch(() => vivo && setErroLetra(true))
    return () => {
      vivo = false
    }
  }, [song.titulo, song.artista])

  const estadoLetra: EstadoLetra = useMemo(() => {
    if (erroLetra) return { tipo: 'erro' }
    if (!candLetras) return { tipo: 'carregando' }
    return escolherLetra(candLetras, duracao || undefined)
  }, [candLetras, erroLetra, duracao])

  // ---------- tempo do vídeo (com ajuste da letra) ----------
  const offset = useRef(song.offsetLetra)
  offset.current = song.offsetLetra
  const ancora = useRef({ bruto: -1, em: 0 })
  const tocando = estadoPlayer === ESTADO.TOCANDO
  const tocandoRef = useRef(false)
  tocandoRef.current = tocando

  const getTempo = useCallback(() => {
    const p = player.current
    if (!p?.getCurrentTime) return -1
    const bruto: number = p.getCurrentTime() || 0
    const agora = performance.now()
    const a = ancora.current
    if (bruto !== a.bruto) {
      a.bruto = bruto
      a.em = agora
    }
    // entre uma leitura e outra do YouTube, o tempo é estimado para o preenchimento ficar suave
    const estimado = tocandoRef.current ? bruto + Math.min(0.6, (agora - a.em) / 1000) : bruto
    return estimado + offset.current
  }, [])

  // ---------- fim ----------
  const encerrar = () => {
    if (encerrando.current) return
    encerrando.current = true
    actions.finishCurrent()
    ir('nota', true)
  }
  const pular = () => {
    if (encerrando.current) return
    encerrando.current = true
    actions.skipCurrent()
  }

  const aoEstado = (e: number) => {
    setEstadoPlayer(e)
    if (e === ESTADO.TOCANDO) {
      const d = player.current?.getDuration?.()
      if (d) setDuracao(d)
    }
    if (e === ESTADO.TERMINOU) encerrar()
  }

  const ajustar = (delta: number) => {
    // lê o valor mais novo (ao segurar o botão, a função é chamada várias vezes seguidas)
    const atual = acharMusica(getState(), song.id)?.offsetLetra ?? 0
    const novo = Math.round((atual + delta) * 10) / 10
    actions.updateSong(song.id, { offsetLetra: novo })
  }

  const proximo = queue[1]
  const proxSong = proximo ? acharMusica(getState(), proximo.songId) : undefined
  const minhas = singers.filter((x) => singerIds.includes(x.id))

  // ---------- trocar vídeo (tela inteira, sem nada sobre o player) ----------
  if (modo !== 'tocar')
    return (
      <div className="flex h-full flex-col gap-2 px-4 pb-3">
        <FundoBalada calmo />
        <Cabecalho titulo="🔄 Trocar o vídeo" voltar={() => setModo('tocar')}>
          <span className="truncate text-white/70">{song.titulo} – {song.artista}</span>
        </Cabecalho>
        <BuscaYouTube
          consultaInicial={`${song.titulo} ${song.artista}`}
          extraInicial={modo === 'trocar-lyric' ? 'lyric video oficial' : 'clipe oficial'}
          buscarAoAbrir
          aoEscolher={(v) => {
            tentados.current.clear()
            actions.updateSong(song.id, { youtubeId: v.id })
            setStatus({ tipo: 'ok' })
            setModo('tocar')
          }}
        />
      </div>
    )

  return (
    <div className="flex h-full flex-col">
      <FundoBalada calmo />
      {/* --- parte de cima: info | VÍDEO | controles --- */}
      <div className="flex h-[60%] min-h-0 gap-[1vw] px-[1vw] pt-[1vh]">
        <aside className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ffe140]">🎤 Cantando agora</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {minhas.length ? minhas.map((x) => <ChipCantora key={x.id} s={x} grande />) : <span className="text-white/60">Todo mundo!</span>}
            </div>
            <p className="neon-rosa mt-2 line-clamp-2 text-xl font-extrabold leading-tight">{song.titulo}</p>
            <p className="truncate text-base text-white/70">{song.artista}</p>
          </div>
          <div className="min-w-0 rounded-xl bg-white/5 px-2 py-1 text-sm leading-tight">
            {proximo && proxSong ? (
              <>
                <span className="font-bold text-[#38bdf8]">Próxima:</span> {nomesCantoras(proximo.singerIds, singers)} com{' '}
                <span className="font-bold">{proxSong.titulo}</span>
              </>
            ) : (
              <span className="text-white/60">Fila vazia depois dessa 👀</span>
            )}
          </div>
        </aside>

        <div className="relative aspect-video h-full max-w-[64%] shrink-0 overflow-hidden rounded-2xl border-2 border-[#a855f7]/60 bg-black shadow-[0_0_30px_#a855f777]">
          {status.tipo === 'ok' && song.youtubeId ? (
            <VideoYouTube
              videoId={song.youtubeId}
              onPronto={(p) => (player.current = p)}
              onEstado={aoEstado}
              onErro={aoErroVideo}
            />
          ) : (
            <StatusVideoCaixa status={status} aoTrocar={() => setModo('trocar')} aoPular={pular} aoTentar={procurarProximoVideo} />
          )}
        </div>

        <aside className="grid min-w-0 flex-1 auto-rows-fr grid-cols-2 gap-[0.8vh] py-1">
          <Controle
            onClick={() => (tocando ? player.current?.pauseVideo?.() : player.current?.playVideo?.())}
            cor="#a855f7"
          >
            {tocando ? '⏸ Pausar' : '▶ Tocar'}
          </Controle>
          <Controle onClick={pular} cor="#38bdf8">⏭ Pular</Controle>
          <Controle onClick={encerrar} cor="#ff2ea6" span>
            🏁 Encerrar e ver a nota
          </Controle>
          <Controle onClick={() => ajustar(+0.5)} repetir cor="#ffe140" titulo="A letra está chegando DEPOIS da voz">
            🐢 Letra atrasada
          </Controle>
          <Controle onClick={() => ajustar(-0.5)} repetir cor="#ffe140" titulo="A letra está chegando ANTES da voz">
            🐇 Letra adiantada
          </Controle>
          <div className="col-span-2 flex items-center justify-between gap-1">
            <span className="text-xs text-white/70">
              Ajuste: <b className="text-[#ffe140]">{song.offsetLetra > 0 ? '+' : ''}{song.offsetLetra.toFixed(1).replace('.', ',')}s</b>
            </span>
            <button onClick={() => setModo('trocar')} className="rounded-full bg-white/10 px-2 text-xs font-bold">
              🔄 Vídeo errado? Trocar
            </button>
          </div>
        </aside>
      </div>

      {/* --- parte de baixo: LETRA --- */}
      <div className="relative min-h-0 flex-1">
        <Letras
          estado={estadoLetra}
          getTempo={getTempo}
          duracao={duracao}
          onBuscarLyricVideo={() => setModo('trocar-lyric')}
        />
        <button onClick={() => ir('fila')} className="absolute bottom-1 left-2 rounded-full bg-white/10 px-3 text-xs font-bold text-white/70">
          ⬅ Fila
        </button>
        {status.tipo === 'ok' && estadoPlayer === ESTADO.NAO_INICIADO && (
          <p className="absolute bottom-1 right-2 animate-pulse text-xs text-white/60">
            Se aparecer propaganda, relaxa: a letra espera 😉 · Não começou? Toque no vídeo ▶
          </p>
        )}
      </div>
    </div>
  )
}

function Controle({
  children,
  onClick,
  cor,
  span,
  repetir,
  titulo,
}: {
  children: ReactNode
  onClick: () => void
  cor: string
  span?: boolean
  repetir?: boolean
  titulo?: string
}) {
  // segurar o botão repete o ajuste (útil para intros longas do clipe)
  const timer = useRef<number>()
  const parar = () => {
    clearTimeout(timer.current)
    clearInterval(timer.current)
  }
  useEffect(() => parar, [])
  return (
    <motion.button
      title={titulo}
      whileTap={{ scale: 0.88 }}
      onPointerDown={() => {
        if (!repetir) return
        timer.current = window.setTimeout(() => {
          timer.current = window.setInterval(onClick, 140)
        }, 450)
      }}
      onPointerUp={parar}
      onPointerLeave={parar}
      onClick={onClick}
      className={`flex items-center justify-center rounded-2xl px-1 text-center text-sm font-extrabold leading-tight ${span ? 'col-span-2' : ''}`}
      style={{ background: `linear-gradient(160deg, ${cor}55, ${cor}22)`, border: `2px solid ${cor}`, boxShadow: `0 0 12px ${cor}55` }}
    >
      {children}
    </motion.button>
  )
}

function StatusVideoCaixa({
  status,
  aoTrocar,
  aoPular,
  aoTentar,
}: {
  status: StatusVideo
  aoTrocar: () => void
  aoPular: () => void
  aoTentar: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
      {status.tipo === 'procurando' && (
        <p className="neon-azul animate-pulse text-2xl font-extrabold">Procurando o clipe… 🔎🎬</p>
      )}
      {status.tipo === 'bloqueado' && (
        <>
          <p className="text-2xl font-extrabold">Esse clipe não deixa tocar fora do YouTube 😢</p>
          <div className="flex gap-2">
            <Botao cor="rosa" onClick={aoTrocar}>🔄 Escolher outro vídeo</Botao>
            <Botao cor="escuro" onClick={aoPular}>⏭ Pular música</Botao>
          </div>
        </>
      )}
      {status.tipo === 'erro' && (
        <>
          <p className="text-lg font-bold">{status.msg}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Botao cor="amarelo" tamanho="sm" onClick={aoTentar}>↻ Tentar de novo</Botao>
            <Botao cor="rosa" tamanho="sm" onClick={aoTrocar}>🔗 Colar link do clipe</Botao>
            <Botao cor="escuro" tamanho="sm" onClick={() => ir('config')}>⚙️ Configurações</Botao>
          </div>
        </>
      )}
    </div>
  )
}
