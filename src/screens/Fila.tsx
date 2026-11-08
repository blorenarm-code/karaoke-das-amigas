import { AnimatePresence, motion } from 'framer-motion'
import { Botao, Cabecalho, ChipCantora, Energia, FundoBalada, nomesCantoras } from '../components/ui'
import { manterTelaAcesa } from '../lib/device'
import { ir } from '../lib/rota'
import { acharMusica, actions, useStore } from '../store'

export function Fila() {
  const s = useStore((x) => x)
  const { queue, singers } = s
  const primeiro = queue[0]
  const primeiraMusica = primeiro ? acharMusica(s, primeiro.songId) : undefined

  return (
    <div className="flex h-full flex-col">
      <FundoBalada calmo />
      <Cabecalho titulo="📋 Fila da festa" voltar={() => ir('inicio')}>
        <Botao cor="escuro" tamanho="sm" onClick={() => ir('cantoras')}>👯 Cantoras</Botao>
        <Botao cor="amarelo" tamanho="sm" onClick={() => ir('podio')} disabled={!s.results.length}>
          🏆 Encerrar a festa
        </Botao>
      </Cabecalho>

      <div className="flex min-h-0 flex-1 gap-4 p-4">
        <div className="flex w-[40%] shrink-0 flex-col gap-3">
          {/* destaque: próxima */}
          <motion.div
            key={primeiro?.id ?? 'vazio'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="painel flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center"
          >
            {primeiro && primeiraMusica ? (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-[#ffe140]">Próxima</p>
                <p className="text-2xl font-extrabold leading-tight">
                  <span className="neon-azul">{nomesCantoras(primeiro.singerIds, singers)}</span>
                  <span className="text-white/70"> com </span>
                  <span className="neon-rosa">{primeiraMusica.titulo}</span>
                </p>
                <p className="text-white/60">{primeiraMusica.artista}</p>
                <motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <Botao cor="rosa" tamanho="lg" onClick={() => { manterTelaAcesa(); ir('palco') }}>▶ Soltar a voz!</Botao>
                </motion.div>
              </>
            ) : (
              <p className="neon-roxo text-2xl font-bold">Fila vazia! Escolhe uma música 👉</p>
            )}
          </motion.div>
          <div className="flex gap-2">
            <Botao cor="roxo" className="flex-1" onClick={() => ir('catalogo')}>🎵 Catálogo</Botao>
            <Botao cor="azul" className="flex-1" onClick={() => ir('youtube')}>🔎 YouTube</Botao>
          </div>
          {s.results.length > 0 && (
            <p className="text-center text-sm text-white/60">🎤 {s.results.length} {s.results.length === 1 ? 'música já cantada' : 'músicas já cantadas'} hoje</p>
          )}
        </div>

        <div className="rolagem min-h-0 flex-1">
          <AnimatePresence>
            {queue.map((q, i) => {
              const m = acharMusica(s, q.songId)
              if (!m) return null
              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -80, opacity: 0 }}
                  className={`mb-2 flex items-center gap-3 rounded-2xl p-2 ${i === 0 ? 'bg-[#ff2ea6]/20 ring-2 ring-[#ff2ea6]' : 'bg-white/5'}`}
                >
                  <span className="w-8 text-center text-2xl font-extrabold text-[#ffe140]">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-extrabold leading-tight">
                      {m.titulo} <span className="text-sm font-semibold text-white/60">– {m.artista}</span>
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {q.singerIds.map((id) => {
                        const c = singers.find((x) => x.id === id)
                        return c ? <ChipCantora key={id} s={c} /> : null
                      })}
                      <Energia n={m.energia} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="h-9 w-9 rounded-full bg-white/10 text-lg disabled:opacity-20" disabled={i === 0} onClick={() => actions.moveInQueue(q.id, -1)} aria-label="Subir">⬆</button>
                    <button className="h-9 w-9 rounded-full bg-white/10 text-lg disabled:opacity-20" disabled={i === queue.length - 1} onClick={() => actions.moveInQueue(q.id, 1)} aria-label="Descer">⬇</button>
                    <button className="h-9 w-9 rounded-full bg-white/10 text-lg" onClick={() => actions.removeFromQueue(q.id)} aria-label="Tirar da fila">✕</button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {!queue.length && (
            <div className="mt-8 text-center text-xl text-white/70">
              Ninguém na fila ainda. <br />Toca em <b>🎵 Catálogo</b> ou <b>🔎 YouTube</b> pra escolher!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
