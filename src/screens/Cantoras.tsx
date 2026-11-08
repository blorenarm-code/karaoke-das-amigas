import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Botao, Cabecalho, CORES_CANTORAS, EMOJIS_CANTORAS, FundoBalada } from '../components/ui'
import { ir } from '../lib/rota'
import { actions, useStore } from '../store'

export function Cantoras() {
  const singers = useStore((s) => s.singers)
  const [editId, setEditId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS_CANTORAS[0])
  const [cor, setCor] = useState(CORES_CANTORAS[0])

  const limpar = () => {
    setEditId(null)
    setNome('')
    const n = singers.length + 1
    setEmoji(EMOJIS_CANTORAS[n % EMOJIS_CANTORAS.length])
    setCor(CORES_CANTORAS[n % CORES_CANTORAS.length])
  }

  const salvar = () => {
    const n = nome.trim()
    if (!n) return
    if (editId) actions.updateSinger(editId, { nome: n, emoji, cor })
    else actions.addSinger({ nome: n, emoji, cor })
    limpar()
  }

  return (
    <div className="flex h-full flex-col">
      <FundoBalada calmo />
      <Cabecalho titulo="👯 Cantoras da noite" voltar={() => ir('inicio')}>
        <Botao cor="rosa" onClick={() => ir('fila')} disabled={!singers.length}>
          Bora cantar! 🎤
        </Botao>
      </Cabecalho>

      <div className="flex min-h-0 flex-1 gap-4 p-4">
        {/* formulário */}
        <div className="painel flex w-[46%] shrink-0 flex-col gap-2 p-3">
          <p className="text-lg font-bold">{editId ? '✏️ Editando' : '✨ Nova cantora'}</p>
          <div className="flex items-center gap-2">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-3xl" style={{ background: cor + '44', border: `3px solid ${cor}`, boxShadow: `0 0 14px ${cor}` }}>
              {emoji}
            </span>
            <input
              className="campo min-w-0 flex-1 text-lg"
              placeholder="Nome da amiga"
              value={nome}
              maxLength={20}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && salvar()}
            />
          </div>
          <div className="rolagem min-h-0 flex-1">
            <div className="flex flex-wrap gap-1">
              {EMOJIS_CANTORAS.map((e) => (
                <motion.button key={e} whileTap={{ scale: 1.4 }} onClick={() => setEmoji(e)}
                  className={`h-9 w-9 rounded-full text-xl ${emoji === e ? 'bg-white/30 ring-2 ring-white' : 'bg-white/5'}`}>
                  {e}
                </motion.button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {CORES_CANTORAS.map((c) => (
                <motion.button key={c} whileTap={{ scale: 1.3 }} onClick={() => setCor(c)}
                  className={`h-8 w-8 rounded-full ${cor === c ? 'ring-4 ring-white' : ''}`}
                  style={{ background: c, boxShadow: `0 0 10px ${c}` }} aria-label="cor" />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Botao cor="verde" className="flex-1" onClick={salvar} disabled={!nome.trim()}>
              {editId ? '✓ Salvar' : '+ Adicionar'}
            </Botao>
            {editId && <Botao cor="escuro" onClick={limpar}>Cancelar</Botao>}
          </div>
        </div>

        {/* lista */}
        <div className="rolagem min-h-0 flex-1">
          {!singers.length && (
            <p className="neon-roxo mt-10 text-center text-2xl font-bold">Ninguém cadastrada ainda… quem abre a noite? 💃</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {singers.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2 rounded-2xl p-2"
                  style={{ background: s.cor + '22', border: `2px solid ${s.cor}`, boxShadow: `0 0 12px ${s.cor}55` }}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-lg font-extrabold">{s.nome}</span>
                  <button className="text-lg" onClick={() => { setEditId(s.id); setNome(s.nome); setEmoji(s.emoji); setCor(s.cor) }} aria-label="Editar">✏️</button>
                  <button className="text-lg" onClick={() => confirm(`Tirar ${s.nome} da lista?`) && actions.removeSinger(s.id)} aria-label="Remover">🗑️</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
