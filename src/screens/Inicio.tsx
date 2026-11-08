import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Botao, FundoBalada } from '../components/ui'
import { entrarTelaCheia, manterTelaAcesa, ouvirTelaAcesa } from '../lib/device'
import { ir } from '../lib/rota'
import { actions, useStore } from '../store'

// botão "Instalar app" do Chrome (quando disponível)
let pedidoInstalar: any = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  pedidoInstalar = e
})

export function Inicio() {
  const nome = useStore((s) => s.partyName)
  const nCantoras = useStore((s) => s.singers.length)
  const nFila = useStore((s) => s.queue.length)
  const nNotas = useStore((s) => s.results.length)
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState(nome)
  const [acesa, setAcesa] = useState(false)
  const [podeInstalar, setPodeInstalar] = useState(!!pedidoInstalar)
  const [telaCheia, setTelaCheia] = useState(!!document.fullscreenElement)

  useEffect(() => ouvirTelaAcesa(setAcesa), [])
  useEffect(() => {
    const f = () => setTelaCheia(!!document.fullscreenElement)
    const g = () => setPodeInstalar(true)
    document.addEventListener('fullscreenchange', f)
    window.addEventListener('beforeinstallprompt', g)
    return () => {
      document.removeEventListener('fullscreenchange', f)
      window.removeEventListener('beforeinstallprompt', g)
    }
  }, [])

  const salvarNome = () => {
    actions.setPartyName(rascunho.trim() || 'Karaokê das Amigas')
    setEditando(false)
  }

  const comecar = () => {
    manterTelaAcesa()
    ir(nCantoras ? 'fila' : 'cantoras')
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-[3vh] px-6 text-center">
      <FundoBalada />

      {/* microfone balançando */}
      <motion.div
        className="text-[5.5rem] leading-none"
        animate={{ rotate: [-12, 12, -12], y: [0, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎤
      </motion.div>

      {/* logo */}
      {editando ? (
        <div className="flex gap-2">
          <input
            autoFocus
            className="campo w-[50vw] text-center font-logo text-3xl"
            value={rascunho}
            maxLength={40}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && salvarNome()}
          />
          <Botao cor="verde" onClick={salvarNome}>✓ Salvar</Botao>
        </div>
      ) : (
        <button onClick={() => { setRascunho(nome); setEditando(true) }} className="group relative" title="Toque para mudar o nome">
          <h1 className="neon-falha font-logo text-[4.2rem] leading-tight" aria-label={nome}>
            {nome.split('').map((l, i) => (
              <motion.span
                key={i}
                className={['neon-rosa', 'neon-amarelo', 'neon-azul', 'neon-roxo'][Math.floor(i / 4) % 4]}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: [0, -6, 0], opacity: 1 }}
                transition={{
                  y: { delay: 0.6 + i * 0.05, duration: 1.6, repeat: Infinity, repeatDelay: 2.5 },
                  opacity: { delay: i * 0.04 },
                }}
              >
                {l}
              </motion.span>
            ))}
          </h1>
          <span className="absolute -right-8 top-2 text-xl opacity-60">✏️</span>
        </button>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <Botao cor="rosa" tamanho="xl" onClick={comecar}>
            🎉 Começar a festa
          </Botao>
        </motion.div>
        <Botao cor="roxo" tamanho="lg" onClick={() => ir('cantoras')}>👯 Cadastrar cantoras</Botao>
        {!telaCheia && (
          <Botao cor="azul" tamanho="lg" onClick={entrarTelaCheia}>📺 Tela cheia</Botao>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Botao cor="escuro" tamanho="sm" onClick={() => ir('config')}>⚙️ Configurações</Botao>
        {nNotas > 0 && <Botao cor="amarelo" tamanho="sm" onClick={() => ir('podio')}>🏆 Pódio</Botao>}
        {podeInstalar && pedidoInstalar && (
          <Botao cor="verde" tamanho="sm" onClick={async () => { await pedidoInstalar.prompt(); pedidoInstalar = null; setPodeInstalar(false) }}>
            📲 Instalar no celular
          </Botao>
        )}
      </div>

      <p className="text-sm text-white/60">
        👯 {nCantoras} {nCantoras === 1 ? 'cantora' : 'cantoras'} · 📋 {nFila} na fila · 🎤 {nNotas} já cantadas
        {acesa && ' · 💡 tela sempre acesa'}
      </p>
    </div>
  )
}
