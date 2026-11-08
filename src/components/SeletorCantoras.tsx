import { motion } from 'framer-motion'
import { useState } from 'react'
import { actions, useStore } from '../store'
import { CORES_CANTORAS, EMOJIS_CANTORAS } from './ui'

/** Escolher quem vai cantar (uma ou várias). Permite cadastrar uma amiga na hora. */
export function SeletorCantoras({ escolhidas, setEscolhidas }: { escolhidas: string[]; setEscolhidas: (ids: string[]) => void }) {
  const singers = useStore((s) => s.singers)
  const [nova, setNova] = useState('')

  const alternar = (id: string) =>
    setEscolhidas(escolhidas.includes(id) ? escolhidas.filter((x) => x !== id) : [...escolhidas, id])

  const adicionar = () => {
    const nome = nova.trim()
    if (!nome) return
    const n = singers.length
    actions.addSinger({ nome, emoji: EMOJIS_CANTORAS[n % EMOJIS_CANTORAS.length], cor: CORES_CANTORAS[n % CORES_CANTORAS.length] })
    setNova('')
  }

  return (
    <div>
      <p className="mb-2 text-lg font-bold">Quem vai cantar? 🎤 <span className="text-sm font-semibold text-white/60">(pode escolher várias)</span></p>
      <div className="flex flex-wrap gap-2">
        {singers.map((s) => {
          const sel = escolhidas.includes(s.id)
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.85 }}
              animate={{ scale: sel ? 1.08 : 1 }}
              onClick={() => alternar(s.id)}
              className="rounded-full px-4 py-1 text-lg font-extrabold"
              style={{
                background: sel ? s.cor : 'rgba(255,255,255,0.06)',
                border: `3px solid ${s.cor}`,
                color: sel ? '#1a0533' : '#fff',
                boxShadow: sel ? `0 0 18px ${s.cor}` : 'none',
              }}
            >
              {s.emoji} {s.nome} {sel && '✓'}
            </motion.button>
          )
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="campo flex-1"
          placeholder={singers.length ? 'Chegou mais uma? Nome dela…' : 'Nenhuma cantora ainda — digite um nome'}
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
        />
        <button className="rounded-full bg-[#a855f7] px-4 font-bold" onClick={adicionar}>
          + Cadastrar
        </button>
      </div>
    </div>
  )
}
