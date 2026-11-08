import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { buscarVideos, extrairIdYouTube, MENSAGEM_ERRO, YouTubeErro, type VideoResult } from '../lib/youtube'
import { Botao } from './ui'

const EXTRAS = ['clipe oficial', 'official video', 'lyric video oficial', ''] as const
const ROTULO_EXTRA: Record<string, string> = {
  'clipe oficial': '🎬 clipe oficial',
  'official video': '🌎 official video',
  'lyric video oficial': '📝 lyric video',
  '': '🔍 só o que eu digitei',
}

/** Caixa de busca de clipes. Mostra miniaturas para escolher. */
export function BuscaYouTube({
  consultaInicial = '',
  extraInicial = 'clipe oficial',
  buscarAoAbrir = false,
  aoEscolher,
}: {
  consultaInicial?: string
  extraInicial?: (typeof EXTRAS)[number]
  buscarAoAbrir?: boolean
  aoEscolher: (v: VideoResult) => void
}) {
  const [q, setQ] = useState(consultaInicial)
  const [extra, setExtra] = useState<string>(extraInicial)
  const [resultados, setResultados] = useState<VideoResult[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [link, setLink] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const buscar = async (consulta = q, ex = extra) => {
    if (!consulta.trim()) return
    inputRef.current?.blur()
    setCarregando(true)
    setErro('')
    try {
      setResultados(await buscarVideos(`${consulta} ${ex}`.trim()))
    } catch (e) {
      setErro(e instanceof YouTubeErro ? MENSAGEM_ERRO[e.tipo] : MENSAGEM_ERRO.outro)
      setResultados(null)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (buscarAoAbrir && consultaInicial) buscar(consultaInicial, extraInicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const usarLink = () => {
    const id = extrairIdYouTube(link)
    if (!id) return setErro('Não reconheci esse link 🤔 Copie o endereço do vídeo no app do YouTube (Compartilhar → Copiar link).')
    aoEscolher({ id, titulo: '', canal: '', thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="campo min-w-0 flex-1 text-lg"
          placeholder="Nome da música ou cantor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
          enterKeyHint="search"
        />
        <Botao cor="amarelo" onClick={() => buscar()} disabled={carregando}>
          {carregando ? '⏳' : '🔎 Buscar'}
        </Botao>
      </div>
      <div className="rolagem-x flex shrink-0 gap-2">
        {EXTRAS.map((e) => (
          <button
            key={e}
            onClick={() => {
              setExtra(e)
              if (resultados) buscar(q, e)
            }}
            className={`whitespace-nowrap rounded-full px-3 text-sm font-bold ${extra === e ? 'bg-[#38bdf8] text-[#0b0218]' : 'bg-white/10'}`}
          >
            {ROTULO_EXTRA[e]}
          </button>
        ))}
      </div>

      {erro && <p className="rounded-xl bg-[#ff2ea6]/20 px-3 py-1 font-bold text-[#ffd1ec]">{erro}</p>}

      <div className="rolagem min-h-0 flex-1">
        {carregando && <p className="neon-azul animate-pulse py-6 text-center text-2xl font-bold">Procurando clipes… 🎬</p>}
        {!carregando && resultados && resultados.length === 0 && (
          <p className="py-6 text-center text-xl">Nada encontrado 😕 Tenta escrever de outro jeito.</p>
        )}
        {!carregando && resultados && (
          <div className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 lg:grid-cols-4">
            {resultados.map((v, i) => (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => aoEscolher(v)}
                className="painel overflow-hidden text-left"
              >
                <img src={v.thumb} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                <div className="p-2">
                  <p className="line-clamp-2 text-sm font-bold leading-tight">{v.titulo}</p>
                  <p className="truncate text-xs text-white/60">{v.canal}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <input
            className="campo min-w-0 flex-1 text-sm"
            placeholder="…ou cole aqui o link de um vídeo do YouTube"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && usarLink()}
          />
          <Botao cor="roxo" tamanho="sm" onClick={usarLink}>
            Usar link
          </Botao>
        </div>
      </div>
    </div>
  )
}
