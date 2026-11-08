// Todos os sons são GERADOS na hora com a Web Audio API (nenhum áudio gravado/protegido).

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Chamar num toque de botão para "destravar" o som no celular */
export function destravarSom() {
  audio()
}

function master(c: AudioContext, volume = 0.5) {
  const g = c.createGain()
  g.gain.value = volume
  g.connect(c.destination)
  return g
}

function nota(
  c: AudioContext,
  destino: AudioNode,
  freq: number,
  inicio: number,
  dur: number,
  tipo: OscillatorType = 'square',
  vol = 0.3,
) {
  const o = c.createOscillator()
  const g = c.createGain()
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 2600
  o.type = tipo
  o.frequency.setValueAtTime(freq, inicio)
  g.gain.setValueAtTime(0.0001, inicio)
  g.gain.exponentialRampToValueAtTime(vol, inicio + 0.02)
  g.gain.setValueAtTime(vol, inicio + dur * 0.7)
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur)
  o.connect(f).connect(g).connect(destino)
  o.start(inicio)
  o.stop(inicio + dur + 0.05)
}

const hz = (semitomDoLa: number) => 440 * Math.pow(2, semitomDoLa / 12)
// notas úteis
const C5 = hz(3), E5 = hz(7), G5 = hz(10), C6 = hz(15), F5 = hz(8), A5 = hz(12), B5 = hz(14), G4 = hz(-2)

/** Tique da roleta */
export function tique(agudo = 1) {
  const c = audio()
  if (!c) return
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(1400 * agudo, t)
  o.frequency.exponentialRampToValueAtTime(500 * agudo, t + 0.04)
  g.gain.setValueAtTime(0.25, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + 0.08)
}

/** Rufar de tambores (ruído em batidinhas que vão ficando mais fortes) */
export function rufar(segundos = 2) {
  const c = audio()
  if (!c) return
  const t0 = c.currentTime
  const out = master(c, 0.5)
  const buf = c.createBuffer(1, c.sampleRate * 0.06, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const passos = Math.floor(segundos / 0.045)
  for (let i = 0; i < passos; i++) {
    const s = c.createBufferSource()
    s.buffer = buf
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 900
    const g = c.createGain()
    g.gain.value = 0.15 + (i / passos) * 0.6
    s.connect(f).connect(g).connect(out)
    s.start(t0 + i * 0.045 + Math.random() * 0.01)
  }
  // prato no final
  const prato = c.createBufferSource()
  const pb = c.createBuffer(1, c.sampleRate * 1.2, c.sampleRate)
  const pd = pb.getChannelData(0)
  for (let i = 0; i < pd.length; i++) pd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / pd.length, 3)
  prato.buffer = pb
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 5000
  prato.connect(hp).connect(out)
  prato.start(t0 + segundos)
}

/** Fanfarra de vitória. nivel 3 = grande, 2 = média, 1 = curtinha */
export function fanfarra(nivel: 1 | 2 | 3 = 3) {
  const c = audio()
  if (!c) return
  const out = master(c, 0.45)
  const t = c.currentTime + 0.05
  const b = 0.13 // duração de uma batida curta
  if (nivel === 1) {
    nota(c, out, C5, t, 0.15)
    nota(c, out, E5, t + 0.15, 0.15)
    nota(c, out, G5, t + 0.3, 0.45)
    return
  }
  // "tã-tã-tã-TÃÃÃ"
  nota(c, out, G4, t, b)
  nota(c, out, C5, t + b, b)
  nota(c, out, E5, t + b * 2, b)
  nota(c, out, G5, t + b * 3, b * 3)
  nota(c, out, E5, t + b * 6, b)
  nota(c, out, G5, t + b * 7, b * 5)
  if (nivel === 3) {
    const t2 = t + b * 12
    nota(c, out, F5, t2, b)
    nota(c, out, A5, t2 + b, b)
    nota(c, out, C6, t2 + b * 2, b)
    nota(c, out, B5, t2 + b * 3, b)
    // acorde final bem grande
    for (const f of [C5, E5, G5, C6]) nota(c, out, f, t2 + b * 4, 1.4, 'sawtooth', 0.14)
    for (const f of [C5 / 2]) nota(c, out, f, t2 + b * 4, 1.4, 'triangle', 0.3)
  } else {
    for (const f of [C5, E5, G5]) nota(c, out, f, t + b * 12, 0.9, 'sawtooth', 0.12)
  }
}

/** Trombone triste: "uóm uóm uóm uóóóóm" */
export function tromboneTriste() {
  const c = audio()
  if (!c) return
  const out = master(c, 0.5)
  const t = c.currentTime + 0.05
  const notas = [hz(-13), hz(-14), hz(-15), hz(-16)]
  notas.forEach((f, i) => {
    const ini = t + i * 0.55
    const dur = i === 3 ? 1.6 : 0.5
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f * 1.03, ini)
    o.frequency.linearRampToValueAtTime(f, ini + 0.12)
    if (i === 3) {
      // vibrato no final
      const lfo = c.createOscillator()
      const lg = c.createGain()
      lfo.frequency.value = 6
      lg.gain.value = 4
      lfo.connect(lg).connect(o.frequency)
      lfo.start(ini + 0.3)
      lfo.stop(ini + dur)
    }
    const filtro = c.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.setValueAtTime(400, ini)
    filtro.frequency.linearRampToValueAtTime(1300, ini + 0.15) // o "uá" da surdina
    filtro.frequency.linearRampToValueAtTime(500, ini + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, ini)
    g.gain.exponentialRampToValueAtTime(0.35, ini + 0.05)
    g.gain.setValueAtTime(0.35, ini + dur * 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, ini + dur)
    o.connect(filtro).connect(g).connect(out)
    o.start(ini)
    o.stop(ini + dur + 0.05)
  })
}

/** Plim alegre curtinho (notas médias) */
export function plim() {
  const c = audio()
  if (!c) return
  const out = master(c, 0.4)
  const t = c.currentTime + 0.02
  nota(c, out, E5, t, 0.12, 'triangle', 0.4)
  nota(c, out, C6, t + 0.1, 0.5, 'triangle', 0.4)
}

/** "Fogos": assobio subindo + estouro */
export function fogos(qtd = 3) {
  const c = audio()
  if (!c) return
  const out = master(c, 0.35)
  for (let i = 0; i < qtd; i++) {
    const t = c.currentTime + i * 0.45 + Math.random() * 0.2
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(600, t)
    o.frequency.exponentialRampToValueAtTime(2200, t + 0.5)
    g.gain.setValueAtTime(0.08, t)
    g.gain.linearRampToValueAtTime(0.0001, t + 0.5)
    o.connect(g).connect(out)
    o.start(t)
    o.stop(t + 0.55)
    const n = c.createBufferSource()
    const buf = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / d.length, 4)
    n.buffer = buf
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1800
    const ng = c.createGain()
    ng.gain.value = 0.9
    n.connect(lp).connect(ng).connect(out)
    n.start(t + 0.5)
  }
}
