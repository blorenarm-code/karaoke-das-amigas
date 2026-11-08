// Tela cheia, travar na horizontal e manter a tela acesa (Wake Lock)

export async function entrarTelaCheia(): Promise<void> {
  const el = document.documentElement as any
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' })
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    }
  } catch {
    /* navegador não deixou: tudo bem */
  }
  try {
    await (screen.orientation as any)?.lock?.('landscape')
  } catch {
    /* só funciona em tela cheia no Android; no computador é ignorado */
  }
  manterTelaAcesa()
}

export async function sairTelaCheia() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
  } catch {
    /* ignora */
  }
}

// ---------- Wake Lock ----------
let trava: any = null
let querTravar = false
const ouvintes = new Set<(ativo: boolean) => void>()
const avisar = () => ouvintes.forEach((f) => f(!!trava))

export function ouvirTelaAcesa(f: (ativo: boolean) => void) {
  ouvintes.add(f)
  f(!!trava)
  return () => {
    ouvintes.delete(f)
  }
}

export async function manterTelaAcesa() {
  querTravar = true
  if (trava || !('wakeLock' in navigator)) return
  try {
    trava = await (navigator as any).wakeLock.request('screen')
    trava.addEventListener('release', () => {
      trava = null
      avisar()
    })
  } catch {
    trava = null
  }
  avisar()
}

// O Android solta a trava quando o app sai da tela; pedimos de novo ao voltar.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && querTravar) manterTelaAcesa()
})
