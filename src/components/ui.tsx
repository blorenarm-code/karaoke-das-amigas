import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Singer } from '../types'
import { destravarSom } from '../lib/audio'

// ---------- Fundo de balada ----------
export function FundoBalada({ calmo = false }: { calmo?: boolean }) {
  const estrelas = useMemo(
    () =>
      Array.from({ length: calmo ? 10 : 24 }, (_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 0.5 + Math.random() * 1.1,
        delay: Math.random() * 3,
        ch: i % 3 === 0 ? '✦' : i % 3 === 1 ? '✧' : '·',
      })),
    [calmo],
  )
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2a0b4d_0%,#0b0218_65%)]" />
      <div className="bolha" style={{ width: '45vw', height: '45vw', left: '-10vw', top: '-15vw', background: 'radial-gradient(circle,#ff2ea6aa,transparent 65%)' }} />
      <div className="bolha" style={{ width: '50vw', height: '50vw', right: '-15vw', top: '10vh', background: 'radial-gradient(circle,#7c3aedaa,transparent 65%)', animationDelay: '-6s' }} />
      <div className="bolha" style={{ width: '35vw', height: '35vw', left: '30vw', bottom: '-20vw', background: 'radial-gradient(circle,#38bdf888,transparent 65%)', animationDelay: '-11s' }} />
      {!calmo && (
        <>
          <div className="feixe" style={{ left: '8vw', background: 'linear-gradient(to top,#ff2ea655,transparent)' }} />
          <div className="feixe" style={{ left: '40vw', background: 'linear-gradient(to top,#ffe14044,transparent)', animationDelay: '-3s' }} />
          <div className="feixe" style={{ left: '72vw', background: 'linear-gradient(to top,#38bdf855,transparent)', animationDelay: '-6s' }} />
        </>
      )}
      {estrelas.map((e, i) => (
        <span
          key={i}
          className="estrelinha"
          style={{ left: `${e.left}%`, top: `${e.top}%`, fontSize: `${e.size}rem`, animationDelay: `${e.delay}s` }}
        >
          {e.ch}
        </span>
      ))}
    </div>
  )
}

// ---------- Botão grande e arredondado ----------
const CORES_BOTAO = {
  rosa: 'from-[#ff2ea6] to-[#c026d3] shadow-[0_0_18px_#ff2ea6aa]',
  roxo: 'from-[#a855f7] to-[#6d28d9] shadow-[0_0_18px_#a855f7aa]',
  amarelo: 'from-[#ffe140] to-[#f59e0b] text-[#2a0b4d] shadow-[0_0_18px_#ffe140aa]',
  azul: 'from-[#38bdf8] to-[#2563eb] shadow-[0_0_18px_#38bdf8aa]',
  verde: 'from-[#4ade80] to-[#059669] text-[#052e16] shadow-[0_0_18px_#4ade80aa]',
  escuro: 'from-[#3b1466] to-[#1e0838] border-2 border-[#a855f7]/50',
}
export type CorBotao = keyof typeof CORES_BOTAO

export function Botao({
  cor = 'rosa',
  tamanho = 'md',
  className = '',
  children,
  onClick,
  ...rest
}: { cor?: CorBotao; tamanho?: 'sm' | 'md' | 'lg' | 'xl' } & HTMLMotionProps<'button'>) {
  const tam = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-7 py-3 text-xl',
    xl: 'px-9 py-4 text-2xl',
  }[tamanho]
  return (
    <motion.button
      whileTap={{ scale: 0.88, rotate: -2 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className={`rounded-full bg-gradient-to-br font-extrabold leading-tight text-white disabled:opacity-40 ${CORES_BOTAO[cor]} ${tam} ${className}`}
      onClick={(e) => {
        destravarSom()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

// ---------- Cabeçalho das telas de menu ----------
export function Cabecalho({ titulo, voltar, children }: { titulo: ReactNode; voltar?: () => void; children?: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-4 pt-2">
      {voltar && (
        <Botao cor="escuro" tamanho="sm" onClick={voltar} aria-label="Voltar">
          ⬅ Voltar
        </Botao>
      )}
      <h1 className="neon-rosa whitespace-nowrap text-2xl font-extrabold">{titulo}</h1>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  )
}

// ---------- Cantoras ----------
export function ChipCantora({ s, grande = false }: { s: Singer; grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${grande ? 'px-3 py-0.5 text-lg' : 'px-2 text-sm'}`}
      style={{ background: s.cor + '33', border: `2px solid ${s.cor}`, color: '#fff', boxShadow: `0 0 10px ${s.cor}66` }}
    >
      <span>{s.emoji}</span>
      {s.nome}
    </span>
  )
}

export function nomesCantoras(ids: string[], singers: Singer[]): string {
  const nomes = ids.map((id) => singers.find((s) => s.id === id)?.nome).filter(Boolean) as string[]
  if (!nomes.length) return 'alguém'
  if (nomes.length === 1) return nomes[0]
  return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
}

// ---------- Energia (fogo) ----------
export function Energia({ n, onChange }: { n: number; onChange?: (n: number) => void }) {
  return (
    <span className="inline-flex" title={`Energia ${n} de 5`}>
      {[1, 2, 3, 4, 5].map((i) =>
        !onChange ? (
          // só mostrar (fica dentro de outros botões, então não pode ser botão)
          <span key={i} className={`text-xs ${i <= n ? '' : 'opacity-20 grayscale'}`}>🔥</span>
        ) : (
        <motion.button
          key={i}
          type="button"
          whileTap={{ scale: 1.5 }}
          onClick={() => onChange(i)}
          className={`px-0.5 text-xl ${i <= n ? '' : 'opacity-20 grayscale'}`}
        >
          🔥
        </motion.button>
        ),
      )}
    </span>
  )
}

// ---------- Janela (modal) para menus — nunca usada por cima do vídeo ----------
export function Janela({ aberta, fechar, children }: { aberta: boolean; fechar: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {aberta && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={fechar}
        >
          <motion.div
            className="painel rolagem max-h-full w-full max-w-3xl p-4"
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------- Avisos globais ----------
export function GiraCelular() {
  return (
    <div className="girar fixed inset-0 z-[100] flex-col items-center justify-center gap-6 bg-[#0b0218] p-8 text-center">
      <FundoBalada calmo />
      <div className="celular-girando text-[7rem] leading-none">📱</div>
      <p className="neon-amarelo text-3xl font-extrabold">Gira o celular, amiga! 📱↔️</p>
      <p className="text-xl text-white/80">O karaokê fica deitadinho, igual a TV 📺</p>
    </div>
  )
}

export function AvisoSemInternet() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          className="fixed left-1/2 top-2 z-[90] -translate-x-1/2 rounded-full bg-[#ff2ea6] px-5 py-1 text-base font-bold shadow-[0_0_20px_#ff2ea6]"
        >
          📡 Sem internet! Confere o Wi-Fi para os clipes e letras carregarem.
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const CORES_CANTORAS = ['#ff2ea6', '#a855f7', '#ffe140', '#38bdf8', '#4ade80', '#fb923c', '#f472b6', '#22d3ee']
export const EMOJIS_CANTORAS = ['💃', '👑', '🌟', '🦄', '🌸', '🔥', '💖', '🎤', '🍹', '🦋', '🌈', '😎', '🐱', '🍓', '💎', '🌻', '👠', '🎀', '🪩', '🥂', '🤠', '🐆', '🌙', '⚡']
