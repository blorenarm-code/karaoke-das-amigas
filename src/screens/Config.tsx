import { useMemo, useState } from 'react'
import { BuscaYouTube } from '../components/BuscaYouTube'
import { Botao, Cabecalho, Energia, FundoBalada } from '../components/ui'
import { ir } from '../lib/rota'
import { buscarVideos, chaveYouTube, MENSAGEM_ERRO, YouTubeErro } from '../lib/youtube'
import { actions, todasMusicas, useStore } from '../store'
import type { Song } from '../types'
import { normalizar } from './Catalogo'

export function Config() {
  const s = useStore((x) => x)
  const [nome, setNome] = useState(s.partyName)
  const [chave, setChave] = useState(s.apiKey)
  const [teste, setTeste] = useState('')
  const [filtro, setFiltro] = useState('')
  const [trocando, setTrocando] = useState<Song | null>(null)

  const musicas = useMemo(() => {
    const f = normalizar(filtro.trim())
    return todasMusicas(s).filter((m) => !m.oculta && (!f || normalizar(`${m.titulo} ${m.artista}`).includes(f)))
  }, [s, filtro])

  const testarChave = async () => {
    actions.setApiKey(chave)
    setTeste('⏳ Testando…')
    try {
      await buscarVideos('karaokê', 1)
      setTeste('✅ Chave funcionando!')
    } catch (e) {
      setTeste('❌ ' + (e instanceof YouTubeErro ? MENSAGEM_ERRO[e.tipo] : MENSAGEM_ERRO.outro))
    }
  }

  if (trocando)
    return (
      <div className="flex h-full flex-col gap-2 px-4 pb-3">
        <FundoBalada calmo />
        <Cabecalho titulo="🔄 Trocar o vídeo" voltar={() => setTrocando(null)}>
          <span className="truncate text-white/70">{trocando.titulo} – {trocando.artista}</span>
        </Cabecalho>
        <BuscaYouTube
          consultaInicial={`${trocando.titulo} ${trocando.artista}`}
          buscarAoAbrir
          aoEscolher={(v) => {
            actions.updateSong(trocando.id, { youtubeId: v.id })
            setTrocando(null)
          }}
        />
      </div>
    )

  const temChaveEnv = !!import.meta.env.VITE_YOUTUBE_API_KEY

  return (
    <div className="flex h-full flex-col">
      <FundoBalada calmo />
      <Cabecalho titulo="⚙️ Configurações" voltar={() => ir('inicio')} />
      <div className="flex min-h-0 flex-1 gap-4 p-4">
        <div className="rolagem flex w-[40%] shrink-0 flex-col gap-3">
          <div className="painel flex flex-col gap-2 p-3">
            <p className="font-bold">🎤 Nome da festa</p>
            <div className="flex gap-2">
              <input className="campo min-w-0 flex-1" value={nome} maxLength={40} onChange={(e) => setNome(e.target.value)} />
              <Botao cor="verde" tamanho="sm" onClick={() => actions.setPartyName(nome.trim() || 'Karaokê das Amigas')}>Salvar</Botao>
            </div>
          </div>

          <div className="painel flex flex-col gap-2 p-3">
            <p className="font-bold">🔑 Chave do YouTube</p>
            <p className="text-xs text-white/60">
              {temChaveEnv ? 'Já existe uma chave no .env. ' : ''}
              Se colar uma aqui, ela fica salva só neste celular e vale mais que a do .env.
            </p>
            <input className="campo text-sm" placeholder="AIza…" value={chave} onChange={(e) => setChave(e.target.value)} />
            <div className="flex items-center gap-2">
              <Botao cor="amarelo" tamanho="sm" onClick={testarChave}>Salvar e testar</Botao>
              <span className="text-sm">{teste || (chaveYouTube() ? '🔑 chave configurada' : '⚠️ sem chave')}</span>
            </div>
          </div>

          <div className="painel flex flex-col gap-2 p-3">
            <p className="font-bold">🧹 Zerar</p>
            <Botao cor="rosa" tamanho="sm" onClick={() => confirm('Zerar a noite? Apaga as notas e a fila (cantoras e músicas continuam).') && actions.resetNight()}>
              Zerar a noite (notas e fila)
            </Botao>
            <p className="text-xs text-white/60">{s.results.length} notas · {s.queue.length} na fila · {s.singers.length} cantoras</p>
          </div>
        </div>

        <div className="painel flex min-w-0 flex-1 flex-col gap-2 p-3">
          <div className="flex items-center gap-2">
            <p className="font-bold">🎵 Músicas</p>
            <input className="campo ml-auto w-1/2 text-sm" placeholder="🔍 filtrar…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          </div>
          <p className="text-xs text-white/60">Toque nos 🔥 para mudar a energia (ela define a faixa da nota).</p>
          <div className="rolagem min-h-0 flex-1">
            {musicas.map((m) => (
              <div key={m.id} className="mb-1 flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1">
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate font-bold">{m.titulo}</p>
                  <p className="truncate text-xs text-white/60">
                    {m.artista} · {m.youtubeId ? '✅ vídeo escolhido' : '🔎 vídeo automático'}
                    {m.offsetLetra ? ` · letra ${m.offsetLetra > 0 ? '+' : ''}${m.offsetLetra}s` : ''}
                  </p>
                </div>
                <Energia n={m.energia} onChange={(n) => actions.updateSong(m.id, { energia: n })} />
                <button className="rounded-full bg-white/10 px-2 text-xs font-bold" onClick={() => setTrocando(m)}>🔄 Vídeo</button>
                {m.offsetLetra !== 0 && (
                  <button className="rounded-full bg-white/10 px-2 text-xs font-bold" onClick={() => actions.updateSong(m.id, { offsetLetra: 0 })}>
                    ↺ Letra
                  </button>
                )}
                {m.custom && (
                  <button className="text-sm" onClick={() => confirm(`Tirar "${m.titulo}" do catálogo?`) && actions.removeCustomSong(m.id)}>🗑️</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
