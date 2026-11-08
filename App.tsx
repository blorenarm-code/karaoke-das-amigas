import { AnimatePresence, motion } from 'framer-motion'
import { AvisoSemInternet, GiraCelular } from './components/ui'
import { useRota } from './lib/rota'
import { BuscarYouTube } from './screens/BuscarYouTube'
import { Cantoras } from './screens/Cantoras'
import { Catalogo } from './screens/Catalogo'
import { Config } from './screens/Config'
import { Fila } from './screens/Fila'
import { Inicio } from './screens/Inicio'
import { Nota } from './screens/Nota'
import { Palco } from './screens/Palco'
import { Podio } from './screens/Podio'
import type { Route } from './types'

const TELAS: Record<Route, () => JSX.Element> = {
  inicio: Inicio,
  cantoras: Cantoras,
  catalogo: Catalogo,
  youtube: BuscarYouTube,
  fila: Fila,
  palco: Palco,
  nota: Nota,
  podio: Podio,
  config: Config,
}

export default function App() {
  const rota = useRota()
  const Tela = TELAS[rota]
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.main
          key={rota}
          className="h-full w-full"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.22 }}
        >
          <Tela />
        </motion.main>
      </AnimatePresence>
      <AvisoSemInternet />
      <GiraCelular />
    </>
  )
}
