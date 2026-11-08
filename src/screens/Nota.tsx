import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Botao, ChipCantora, FundoBalada } from '../components/ui'
import { fanfarra, fogos, plim, rufar, tique, tromboneTriste } from '../lib/audio'
import { chuvaDeRisadas, confete, fogosVisuais } from '../lib/festa'
import { ir } from '../lib/rota'
import { useStore } from '../store'
import type { Result } from '../types'

type Fase = 'calculando' | 'roleta' | 'revelada'

export function Nota() {
  const results = useStore((s) => s.results)
  const lastId = useStore((s) => s.lastResultId)
  const r = results.find((x) => x.id === lastId)
  if (!r) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <FundoBalada />
        <p className="text-2xl">Nenhuma nota por aqui ainda 🎤</p>
        <Botao onClick={() => ir('fila')}>📋 Ir para a fila</Botao>
      </div>
    )
  }
  return <Pontuacao key={r.id} r={r} />
}

/** cor da nota por faixa */
function corDaNota(n: number) {
  if (n >= 95) return { classe: 'neon-amarelo', cor: '#ffe140' }
  if (n >= 88) return { classe: 'neon-rosa', cor: '#ff2ea6' }
  if (n >= 80) return { classe: 'neon-azul', cor: '#38bdf8' }
  return { classe: 'neon-roxo', cor: '#a855f7' }
}

function Pontuacao({ r }: { r: Result }) {
  const singers = useStore((s) => s.singers)
  const temProxima = useStore((s) => s.queue.length > 0)
  const [fase, setFase] = useState<Fase>('calculando')
  const [numero, setNumero] = useState(0)
  const [mostrarBotoes, setMostrarBotoes] = useState(false)
  const timers = useRef<number[]>([])
  const quem = singers.filter((s) => r.singerIds.includes(s.id))

  useEffect(() => {
    const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))

    // 1) suspense
    rufar(2.2)
    later(2300, () => {
      // 2) roleta: rápida no começo, desacelerando (tique-taque) por ~4 segundos
      setFase('roleta')
      let t = 0
      let passo = 40
      let anterior = 0
      while (t < 4000) {
        const ultimo = t + passo >= 4000
        later(t, () => {
          let n = 60 + Math.floor(Math.random() * 41)
          if (n === anterior) n = n === 100 ? 99 : n + 1
          anterior = n
          setNumero(n)
          tique(1 + Math.random() * 0.3)
        })
        t += passo
        passo *= ultimo ? 1 : 1.085
      }
      // 3) para na nota
      later(t + 150, () => {
        setNumero(r.nota)
        setFase('revelada')
        comemorar(r.nota)
      })
      later(t + 1800, () => setMostrarBotoes(true))
    })
    return () => timers.current.forEach(clearTimeout)
  }, [r.nota])

  const { classe, cor } = corDaNota(r.nota)

  const proxima = () => ir(temProxima ? 'palco' : 'fila', true)

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      <FundoBalada />

      {/* quem cantou */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {quem.map((s) => <ChipCantora key={s.id} s={s} grande />)}
        <span className="text-xl text-white/80">
          com <b className="text-white">{r.titulo}</b> <span className="text-white/60">– {r.artista}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {fase === 'calculando' && (
          <motion.div key="calc" exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-[22vh] items-end gap-2">
              {Array.from({ length: 9 }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-[3vw] rounded-t-lg"
                  style={{ background: ['#ff2ea6', '#a855f7', '#ffe140', '#38bdf8'][i % 4] }}
                  animate={{ height: ['20%', '100%', '35%', '80%', '20%'] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>
            <motion.p
              className="neon-rosa text-5xl font-extrabold"
              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.04, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              Calculando sua performance…
            </motion.p>
            <p className="text-xl text-white/70">🎚️ Analisando afinação, rebolado e carisma…</p>
          </motion.div>
        )}

        {fase === 'roleta' && (
          <motion.div key="roleta" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 py-4">
            <div className="relative rounded-[2rem] border-4 border-[#ffe140] bg-black/60 px-[5vw] py-[1vh] shadow-[0_0_40px_#ffe140aa]">
              {/* luzinhas da roleta */}
              <div className="pointer-events-none absolute inset-0 flex justify-between px-3 pt-1">
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.span key={i} className="h-3 w-3 rounded-full bg-[#ffe140]"
                    animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 0.4, repeat: Infinity, delay: (i % 2) * 0.2 }} />
                ))}
              </div>
              <div className="h-[42vh] overflow-hidden">
                <motion.div
                  key={numero}
                  initial={{ y: '-60%', opacity: 0.2 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.06 }}
                  className="neon-amarelo font-extrabold tabular-nums leading-none"
                  style={{ fontSize: '40vh' }}
                >
                  {numero}
                </motion.div>
              </div>
            </div>
            <p className="text-2xl font-bold text-white/80">🎰 Rodando a roleta…</p>
          </motion.div>
        )}

        {fase === 'revelada' && (
          <motion.div key="nota" className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 3, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              className={`${classe} font-extrabold tabular-nums leading-none`}
              style={{ fontSize: '40vh' }}
            >
              {r.nota}
            </motion.div>
            <div className="-mt-[2vh] flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: i <= r.estrelas ? 1 : 0.7, rotate: 0 }}
                  transition={{ delay: 0.4 + i * 0.22, type: 'spring', stiffness: 300, damping: 10 }}
                  className={`text-[3rem] leading-none ${i <= r.estrelas ? '' : 'opacity-25 grayscale'}`}
                  style={i <= r.estrelas ? { filter: `drop-shadow(0 0 10px ${cor})` } : undefined}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-2 text-[2rem] font-extrabold leading-tight"
            >
              {r.mensagem}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarBotoes && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-3 flex gap-3">
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Botao cor="rosa" tamanho="lg" onClick={proxima}>
                {temProxima ? '▶ Próxima música' : '🎵 Escolher a próxima'}
              </Botao>
            </motion.div>
            <Botao cor="escuro" onClick={() => ir('podio')}>🏆 Encerrar a festa</Botao>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Comemoração proporcional à nota */
function comemorar(nota: number) {
  if (nota >= 100) {
    fanfarra(3)
    fogos(6)
    confete(1.6)
    fogosVisuais(5)
  } else if (nota >= 95) {
    fanfarra(3)
    fogos(3)
    confete(1.2)
    fogosVisuais(2.5)
  } else if (nota >= 88) {
    fanfarra(2)
    confete(1)
  } else if (nota >= 80) {
    fanfarra(1)
    plim()
    confete(0.45)
  } else {
    tromboneTriste()
    chuvaDeRisadas()
  }
}
