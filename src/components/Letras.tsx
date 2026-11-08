import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Letra, LinhaLetra } from '../lib/lrclib'
import { Botao } from './ui'

export type EstadoLetra = { tipo: 'carregando' } | { tipo: 'erro' } | Letra

/** Tamanho da linha atual: frases curtas ficam ENORMES, longas diminuem para caber */
function tamanho(texto: string) {
  const n = texto.length
  if (n <= 22) return 'min(13vh, 7.5vw)'
  if (n <= 34) return 'min(11.5vh, 5.8vw)'
  if (n <= 48) return 'min(10vh, 4.8vw)'
  if (n <= 64) return 'min(8.5vh, 4.2vw)'
  return 'min(7vh, 3.5vw)'
}

/** Quanto tempo a frase leva para ser cantada (para o preenchimento colorido) */
function duracaoLinha(linhas: LinhaLetra[], i: number) {
  const prox = linhas[i + 1]
  const intervalo = prox ? prox.t - linhas[i].t : 4
  if (intervalo <= 6) return intervalo * 0.92
  return Math.min(intervalo * 0.9, Math.max(2.2, linhas[i].texto.length * 0.14))
}

function usarTempo(getTempo: () => number) {
  const [t, setT] = useState(0)
  useEffect(() => {
    let id = 0
    const loop = () => {
      setT(getTempo())
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [getTempo])
  return t
}

export function Letras({
  estado,
  getTempo,
  duracao,
  onBuscarLyricVideo,
}: {
  estado: EstadoLetra
  getTempo: () => number
  duracao: number
  onBuscarLyricVideo: () => void
}) {
  if (estado.tipo === 'carregando')
    return <Aviso texto="Procurando a letra… 📜" animado />
  if (estado.tipo === 'erro')
    return (
      <Aviso texto="Não consegui buscar a letra (sem internet?) 📡">
        <Botao cor="roxo" tamanho="sm" onClick={onBuscarLyricVideo}>📝 Trocar por lyric video</Botao>
      </Aviso>
    )
  if (estado.tipo === 'nenhuma')
    return (
      <Aviso texto="Não achei a letra dessa 😢 Cantem de cabeça… ou:">
        <Botao cor="roxo" tamanho="sm" onClick={onBuscarLyricVideo}>📝 Buscar o lyric video oficial</Botao>
      </Aviso>
    )
  if (estado.tipo === 'simples')
    return <LetraSimples texto={estado.texto} getTempo={getTempo} duracao={duracao} onBuscarLyricVideo={onBuscarLyricVideo} />
  return <LetraSincronizada linhas={estado.linhas} getTempo={getTempo} />
}

function Aviso({ texto, animado, children }: { texto: string; animado?: boolean; children?: ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className={`neon-roxo text-3xl font-extrabold ${animado ? 'animate-pulse' : ''}`}>{texto}</p>
      {children}
    </div>
  )
}

function LetraSincronizada({ linhas, getTempo }: { linhas: LinhaLetra[]; getTempo: () => number }) {
  const t = usarTempo(getTempo)

  let i = -1
  for (let k = 0; k < linhas.length; k++) {
    if (linhas[k].t <= t) i = k
    else break
  }

  let atual: { chave: string; texto: string; progresso: number; especial?: boolean }
  let proxima = ''

  const proxComTexto = (de: number) => linhas.slice(de).find((l) => l.texto)?.texto ?? ''

  if (i === -1) {
    const falta = linhas[0].t - t
    const texto = falta <= 3.2 && falta > 0 ? `${Math.ceil(falta)}…` : '🎤 Prepara a voz…'
    atual = { chave: 'antes-' + (falta <= 3.2 ? Math.ceil(falta) : 'x'), texto, progresso: 0, especial: true }
    proxima = proxComTexto(0)
  } else if (!linhas[i].texto) {
    atual = { chave: 'pausa-' + i, texto: '♪ ♪ ♪', progresso: 0, especial: true }
    proxima = proxComTexto(i + 1)
  } else if (i === linhas.length - 1 && t - linhas[i].t > 8) {
    atual = { chave: 'fim', texto: '🎶 Fim! Aplausos! 👏', progresso: 0, especial: true }
  } else {
    const p = Math.min(1, Math.max(0, (t - linhas[i].t) / duracaoLinha(linhas, i)))
    atual = { chave: 'l-' + i, texto: linhas[i].texto, progresso: p }
    proxima = proxComTexto(i + 1)
  }

  const pc = (atual.progresso * 100).toFixed(1)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-[1.5vh] px-[3vw] text-center">
      <motion.div
        key={atual.chave}
        initial={{ y: '45%', opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="font-extrabold leading-[1.08]"
        style={{ fontSize: tamanho(atual.texto), filter: 'drop-shadow(0 0 0.12em rgba(255,46,166,0.55)) drop-shadow(0 3px 0 rgba(0,0,0,0.6))' }}
      >
        {atual.especial ? (
          <span className="neon-amarelo">{atual.texto}</span>
        ) : (
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, #ffe140 0%, #ff4fb8 ${pc}%, #ffffff ${pc}%, #ffffff 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {atual.texto}
          </span>
        )}
      </motion.div>
      {proxima && (
        <motion.p
          key={'p-' + proxima + atual.chave}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="line-clamp-1 font-bold text-[#d8c4ff]"
          style={{ fontSize: 'min(6vh, 3.2vw)' }}
        >
          {proxima}
        </motion.p>
      )}
    </div>
  )
}

function LetraSimples({
  texto,
  getTempo,
  duracao,
  onBuscarLyricVideo,
}: {
  texto: string
  getTempo: () => number
  duracao: number
  onBuscarLyricVideo: () => void
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const t = usarTempo(getTempo)
  useEffect(() => {
    const el = caixa.current
    if (!el || !duracao) return
    // rola devagar acompanhando o andamento do vídeo (pulando 10s de introdução e de final)
    const p = Math.min(1, Math.max(0, (t - 10) / Math.max(30, duracao - 25)))
    el.scrollTop = p * (el.scrollHeight - el.clientHeight)
  }, [t, duracao])
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-center gap-3 text-sm">
        <span className="text-white/70">🐢 Letra sem tempo marcado — rolando sozinha</span>
        <button className="rounded-full bg-white/10 px-3 font-bold" onClick={onBuscarLyricVideo}>
          📝 Usar lyric video
        </button>
      </div>
      <div
        ref={caixa}
        className="min-h-0 flex-1 overflow-hidden whitespace-pre-line px-[4vw] text-center font-bold leading-snug"
        style={{ fontSize: 'min(6vh, 3.4vw)', maskImage: 'linear-gradient(transparent, #000 20%, #000 80%, transparent)' }}
      >
        <div className="h-[12vh]" />
        {texto}
        <div className="h-[25vh]" />
      </div>
    </div>
  )
}
