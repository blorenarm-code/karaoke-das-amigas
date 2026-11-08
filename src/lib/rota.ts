// Navegação simples pelo "#" do endereço (o botão Voltar do Android funciona)
import { useEffect, useState } from 'react'
import type { Route } from '../types'

const ROTAS: Route[] = ['inicio', 'cantoras', 'catalogo', 'youtube', 'fila', 'palco', 'nota', 'podio', 'config']

function ler(): Route {
  const h = location.hash.replace(/^#\/?/, '') as Route
  return ROTAS.includes(h) ? h : 'inicio'
}

export function ir(r: Route, substituir = false) {
  const url = `#/${r}`
  if (substituir) {
    history.replaceState(null, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else location.hash = url
}

export function useRota(): Route {
  const [r, setR] = useState<Route>(ler)
  useEffect(() => {
    const f = () => setR(ler())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return r
}
