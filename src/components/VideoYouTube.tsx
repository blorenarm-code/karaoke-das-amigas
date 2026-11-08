import { useEffect, useRef } from 'react'
import { carregarApiPlayer } from '../lib/youtube'

/** Player oficial do YouTube (IFrame API). Nada é desenhado por cima dele. */
export function VideoYouTube({
  videoId,
  onPronto,
  onEstado,
  onErro,
}: {
  videoId: string
  onPronto: (p: any) => void
  onEstado: (estado: number) => void
  onErro: (codigo: number) => void
}) {
  const caixa = useRef<HTMLDivElement>(null)
  // guarda as funções mais recentes sem recriar o player
  const cb = useRef({ onPronto, onEstado, onErro })
  cb.current = { onPronto, onEstado, onErro }

  useEffect(() => {
    let player: any
    let cancelado = false
    carregarApiPlayer()
      .then((YT) => {
        if (cancelado || !caixa.current) return
        const alvo = document.createElement('div')
        caixa.current.appendChild(alvo)
        player = new YT.Player(alvo, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            fs: 0,
            iv_load_policy: 3,
            origin: location.origin,
          },
          events: {
            onReady: (e: any) => {
              cb.current.onPronto(e.target)
              try {
                e.target.playVideo()
              } catch {
                /* ignora */
              }
            },
            onStateChange: (e: any) => cb.current.onEstado(e.data),
            onError: (e: any) => cb.current.onErro(e.data),
          },
        })
      })
      .catch(() => cb.current.onErro(-1))
    return () => {
      cancelado = true
      try {
        player?.destroy()
      } catch {
        /* ignora */
      }
      if (caixa.current) caixa.current.innerHTML = ''
    }
  }, [videoId])

  return <div ref={caixa} className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
}
