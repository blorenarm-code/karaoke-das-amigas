import { useState } from 'react'
import { BuscaYouTube } from '../components/BuscaYouTube'
import { SeletorCantoras } from '../components/SeletorCantoras'
import { Botao, Cabecalho, Energia, FundoBalada, Janela } from '../components/ui'
import { ir } from '../lib/rota'
import { separarTitulo, type VideoResult } from '../lib/youtube'
import { actions, getState } from '../store'
import { CATEGORIAS, DECADAS, type Categoria } from '../types'

/** Busca livre para pedidos de última hora */
export function BuscarYouTube() {
  const [video, setVideo] = useState<VideoResult | null>(null)
  return (
    <div className="flex h-full flex-col gap-2 px-4 pb-3">
      <FundoBalada calmo />
      <Cabecalho titulo="🔎 Pedido de última hora" voltar={() => ir('fila')}>
        <Botao cor="escuro" tamanho="sm" onClick={() => ir('catalogo')}>🎵 Catálogo</Botao>
      </Cabecalho>
      <BuscaYouTube aoEscolher={setVideo} />
      <DialogoPedido video={video} fechar={() => setVideo(null)} />
    </div>
  )
}

function DialogoPedido({ video, fechar }: { video: VideoResult | null; fechar: () => void }) {
  return (
    <Janela aberta={!!video} fechar={fechar}>
      {video && <FormPedido key={video.id} video={video} fechar={fechar} />}
    </Janela>
  )
}

function FormPedido({ video, fechar }: { video: VideoResult; fechar: () => void }) {
  const sugestao = separarTitulo(video.titulo, video.canal)
  const [titulo, setTitulo] = useState(sugestao.titulo)
  const [artista, setArtista] = useState(sugestao.artista)
  const [categoria, setCategoria] = useState<Categoria>('Internacional')
  const [decada, setDecada] = useState('')
  const [energia, setEnergia] = useState(4)
  const [salvar, setSalvar] = useState(true)
  const [quem, setQuem] = useState<string[]>([])

  const enviar = (agora: boolean) => {
    if (!titulo.trim() || !quem.length) return
    // se esse vídeo já foi salvo antes, reaproveita
    const existente = getState().customSongs.find((m) => m.youtubeId === video.id)
    let id: string
    if (existente) {
      id = existente.id
      actions.updateSong(id, { energia })
    } else {
      id = actions.addCustomSong({ titulo: titulo.trim(), artista: artista.trim(), categoria, decada, energia, youtubeId: video.id, oculta: !salvar })
    }
    actions.enqueue(id, quem, agora)
    fechar()
    ir(agora ? 'palco' : 'fila')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <img src={video.thumb} alt="" className="aspect-video w-[30%] shrink-0 rounded-xl object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-xs text-white/60">Confira o nome — ele é usado para achar a letra 📜</p>
          <input className="campo" placeholder="Nome da música" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <input className="campo" placeholder="Cantor(a) / banda" value={artista} onChange={(e) => setArtista(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">Energia:</span>
        <Energia n={energia} onChange={setEnergia} />
        <span className="text-sm text-white/60">(1 = lentinha 😢 · 5 = pula-pula 🔥)</span>
      </div>

      <label className="flex items-center gap-2 text-lg font-bold">
        <input type="checkbox" className="h-6 w-6 accent-[#ff2ea6]" checked={salvar} onChange={(e) => setSalvar(e.target.checked)} />
        💾 Salvar no catálogo
      </label>
      {salvar && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            {CATEGORIAS.map((c) => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`rounded-full px-3 text-sm font-bold ${categoria === c ? 'bg-[#ff2ea6]' : 'bg-white/10'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {['', ...DECADAS].map((d) => (
              <button key={d} onClick={() => setDecada(d)}
                className={`rounded-full px-3 text-sm font-bold ${decada === d ? 'bg-[#ffe140] text-[#2a0b4d]' : 'bg-white/10'}`}>
                {d ? `Anos ${d}` : 'Década?'}
              </button>
            ))}
          </div>
        </div>
      )}

      <SeletorCantoras escolhidas={quem} setEscolhidas={setQuem} />
      <div className="flex gap-2">
        <Botao cor="roxo" className="flex-1" disabled={!quem.length || !titulo.trim()} onClick={() => enviar(false)}>📋 Pôr na fila</Botao>
        <Botao cor="rosa" className="flex-1" disabled={!quem.length || !titulo.trim()} onClick={() => enviar(true)}>🎤 Cantar agora!</Botao>
      </div>
    </div>
  )
}
