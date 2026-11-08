// Confete e fogos visuais (canvas-confetti)
import confetti from 'canvas-confetti'

const CORES = ['#ff2ea6', '#a855f7', '#ffe140', '#38bdf8', '#4ade80', '#ffffff']

export function confete(intensidade = 1) {
  const n = Math.round(120 * intensidade)
  confetti({ particleCount: n, spread: 100, startVelocity: 45, origin: { y: 0.65 }, colors: CORES, zIndex: 50 })
  setTimeout(() => {
    confetti({ particleCount: n / 2, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: CORES, zIndex: 50 })
    confetti({ particleCount: n / 2, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: CORES, zIndex: 50 })
  }, 250)
}

export function fogosVisuais(segundos = 3) {
  const fim = Date.now() + segundos * 1000
  const tiro = () => {
    confetti({
      particleCount: 60,
      startVelocity: 30,
      spread: 360,
      ticks: 70,
      gravity: 0.6,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.35 },
      colors: CORES,
      shapes: ['star', 'circle'],
      zIndex: 50,
    })
    if (Date.now() < fim) setTimeout(tiro, 380)
  }
  tiro()
}

/** Chuva de emojis engraçados (para nota baixa) */
export function chuvaDeRisadas() {
  const emoji = confetti.shapeFromText ? confetti.shapeFromText({ text: '😂', scalar: 3 }) : undefined
  confetti({
    particleCount: 25,
    spread: 160,
    startVelocity: 25,
    gravity: 0.5,
    origin: { y: 0.3 },
    scalar: 3,
    ...(emoji ? { shapes: [emoji] } : {}),
    zIndex: 50,
  })
}
