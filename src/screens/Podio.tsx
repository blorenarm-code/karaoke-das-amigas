import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Botao, FundoBalada } from '../components/ui'
import { fanfarra, fogos, plim, rufar } from '../lib/audio'
import { confete, fogosVisuais } from '../lib/festa'
import { ir } from '../lib/rota'
import { actions, useStore } from '../store'
import type { Result, Singer } from '../types'

interface Posicao {
  s: Singer
  media: number
  total: number
  qtd: number
}

const fmt = (n: number) => n.toFixed(1).replace('.', ',')

function calcular(singers: Singer[], results: Result[]) {
  const tabela: Posicao[] = singers
    .map((s) => {
      const minhas = results.filter((r) => r.singerIds.includes(s.id))
      const total = minhas.reduce((a, r) => a + r.nota, 0)
      return { s, media: minhas.length ? total / minhas.length : 0, total, qtd: minhas.length }
    })
    .filter((p) => p.qtd > 0)
    .sort((a, b) => b.media - a.media || b.qtd - a.qtd)

  // prêmios extras
  const sertanejo = results.filter((r) => r.categoria === 'Sertanejo Raiz').sort((a, b) => b.nota - a.nota)[0]
  const animada = [...tabela].sort((a, b) => b.qtd - a.qtd || b.media - a.media)[0]
  const lentas = tabela
    .map((p) => ({ p, n: results.filter((r) => r.singerIds.includes(p.s.id) && r.energia <= 3).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || b.p.media - a.p.media)[0]

  const nome = (id?: string) => singers.find((s) => s.id === id)
  const premios = [
    {
      titulo: 'Rainha da Noite',
      icone: '👑',
      quem: tabela[0]?.s,
      detalhe: tabela[0] ? `média ${fmt(tabela[0].media)}` : '',
    },
    {
      titulo: 'Diva do Sertanejo',
      icone: '🤠',
      quem: sertanejo ? nome(sertanejo.singerIds[0]) : undefined,
      extras: sertanejo?.singerIds.slice(1).map(nome).filter(Boolean) as Singer[] | undefined,
      detalhe: sertanejo ? `${sertanejo.nota} em "${sertanejo.titulo}"` : 'ninguém se arriscou no modão!',
    },
    {
      titulo: 'Mais Animada',
      icone: '🎉',
      quem: animada?.s,
      detalhe: animada ? `${animada.qtd} ${animada.qtd === 1 ? 'música' : 'músicas'}` : '',
    },
    {
      titulo: 'Rainha da Sofrência',
      icone: '😭',
      quem: lentas?.p.s,
      detalhe: lentas ? `${lentas.n} ${lentas.n === 1 ? 'música lenta' : 'músicas lentas'}` : 'ninguém sofreu hoje!',
    },
  ]
  return { tabela, premios }
}

// passos: 0 suspense, 1 = 3º lugar, 2 = 2º, 3 = rufar, 4 = 1º, 5 = prêmios
export function Podio() {
  const singers = useStore((s) => s.singers)
  const results = useStore((s) => s.results)
  const { tabela, premios } = useMemo(() => calcular(singers, results), [singers, results])
  const [passo, setPasso] = useState(0)
  const timers = useRef<number[]>([])

  const terceiro = tabela[2]
  const segundo = tabela[1]
  const primeiro = tabela[0]

  useEffect(() => {
    if (!tabela.length) return
    const sequencia: [number, () => void][] = [
      [0, () => rufar(2.4)],
      [2600, () => { setPasso(1); if (terceiro) { plim(); confete(0.4) } }],
      [5200, () => { setPasso(2); if (segundo) { plim(); confete(0.6) } }],
      [7400, () => { setPasso(3); rufar(2.8) }],
      [10400, () => { setPasso(4); fanfarra(3); fogos(5); confete(1.6); fogosVisuais(4) }],
      [13000, () => setPasso(5)],
    ]
    sequencia.forEach(([ms, f]) => timers.current.push(window.setTimeout(f, ms)))
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pularSuspense = () => {
    timers.current.forEach(clearTimeout)
    setPasso(5)
    fanfarra(2)
    confete(1)
  }

  const novaFesta = () => {
    if (confirm('Começar uma nova festa? As notas e a fila serão apagadas (as cantoras e músicas continuam).')) {
      actions.resetNight()
      ir('inicio', true)
    }
  }

  if (!tabela.length)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <FundoBalada />
        <p className="neon-amarelo text-4xl font-extrabold">Ninguém cantou ainda! 🎤</p>
        <p className="text-xl">O pódio aparece depois da primeira nota.</p>
        <Botao onClick={() => ir('fila')}>📋 Ir para a fila</Botao>
      </div>
    )

  const legenda =
    passo === 0 ? '🥁 E as rainhas da noite são…' :
    passo === 1 ? '🥉 Em terceiro lugar…' :
    passo === 2 ? '🥈 Em segundo lugar…' :
    passo === 3 ? '🥁 E a GRANDE CAMPEÃ da noite é…' : '👑 Parabéns, divas!'

  return (
    <div className="flex h-full flex-col px-4 pb-2 pt-2">
      <FundoBalada />
      <div className="flex shrink-0 items-center gap-3">
        <h1 className="neon-amarelo font-logo text-3xl">Pódio da Noite</h1>
        <motion.p key={passo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-extrabold">
          {legenda}
        </motion.p>
        <div className="ml-auto flex gap-2">
          {passo < 5 ? (
            <Botao cor="escuro" tamanho="sm" onClick={pularSuspense}>⏩ Pular suspense</Botao>
          ) : (
            <>
              <Botao cor="escuro" tamanho="sm" onClick={() => ir('fila')}>⬅ Voltar à festa</Botao>
              <Botao cor="rosa" tamanho="sm" onClick={novaFesta}>✨ Nova festa</Botao>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* pódio: 2º | 1º | 3º */}
        <div className="flex flex-1 items-end justify-center gap-[1.5vw] pb-1">
          <Degrau pos={segundo} lugar={2} altura="34%" visivel={passo >= 2} cor="#c0c7d6" />
          <Degrau pos={primeiro} lugar={1} altura="46%" visivel={passo >= 4} cor="#ffe140" />
          <Degrau pos={terceiro} lugar={3} altura="24%" visivel={passo >= 1} cor="#e59a5b" />
        </div>

        {/* prêmios extras */}
        <AnimatePresence>
          {passo >= 5 && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: '38%', opacity: 1 }} className="flex flex-col justify-center gap-2 overflow-hidden">
              {premios.map((p, i) => (
                <motion.div
                  key={p.titulo}
                  initial={{ x: 120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.35, type: 'spring' }}
                  className="painel flex items-center gap-2 px-3 py-1"
                >
                  <span className="text-[2.2rem] leading-none">{p.icone}</span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-sm font-bold uppercase tracking-wide text-[#ffe140]">{p.titulo}</p>
                    <p className="truncate text-lg font-extrabold">
                      {p.quem ? (
                        <span style={{ color: p.quem.cor }}>
                          {p.quem.emoji} {p.quem.nome}
                          {p.extras?.map((e) => ` & ${e.nome}`)}
                        </span>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-white/60">{p.detalhe}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Degrau({ pos, lugar, altura, visivel, cor }: { pos?: Posicao; lugar: number; altura: string; visivel: boolean; cor: string }) {
  const medalha = ['🥇', '🥈', '🥉'][lugar - 1]
  return (
    <div className="flex h-full w-[22%] max-w-[14rem] flex-col items-center justify-end">
      <AnimatePresence>
        {visivel && pos && (
          <motion.div
            initial={{ y: -200, opacity: 0, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 11 }}
            className="mb-1 flex flex-col items-center text-center"
          >
            {lugar === 1 && (
              <motion.span className="text-[2rem] leading-none" animate={{ rotate: [-10, 10, -10], y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                👑
              </motion.span>
            )}
            <span className={lugar === 1 ? 'text-[2.8rem] leading-none' : 'text-[2.2rem] leading-none'}>{pos.s.emoji}</span>
            <span className="max-w-full truncate text-xl font-extrabold" style={{ color: pos.s.cor, textShadow: `0 0 12px ${pos.s.cor}` }}>
              {pos.s.nome}
            </span>
            <span className="text-sm font-bold text-white/80">
              média {fmt(pos.media)} · {pos.qtd} {pos.qtd === 1 ? 'música' : 'músicas'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: visivel && pos ? altura : '6%' }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        className="flex w-full items-start justify-center rounded-t-2xl pt-1"
        style={{ background: `linear-gradient(180deg, ${cor}, ${cor}55)`, boxShadow: visivel && pos ? `0 0 30px ${cor}aa` : 'none' }}
      >
        <span className="text-[2.4rem] font-extrabold leading-none text-[#2a0b4d]">{visivel && pos ? medalha : lugar}</span>
      </motion.div>
    </div>
  )
}
