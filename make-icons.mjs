// Gera os ícones PNG do PWA (microfone neon) sem bibliotecas externas.
// Rodar: node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const png = (w, h, rgba) => {
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const PINK = [255, 46, 166]
const PURPLE = [124, 58, 237]
const YELLOW = [255, 225, 64]
const BLUE = [56, 189, 248]
const DARK = [24, 10, 48]

// cor de um ponto (u,v em 0..1)
function shade(u, v) {
  let c = mix(PINK, PURPLE, (u + v) / 2)
  // brilho no canto
  const glow = Math.max(0, 1 - Math.hypot(u - 0.25, v - 0.2) / 0.5)
  c = mix(c, [255, 255, 255], glow * 0.15)
  // cabeça do microfone
  const hx = 0.5, hy = 0.36, hr = 0.17
  const dh = Math.hypot(u - hx, v - hy)
  // haste do mic (trapézio)
  const inBody = v > 0.5 && v < 0.78 && Math.abs(u - 0.5) < 0.075 - (v - 0.5) * 0.08
  // suporte em U
  const ring = Math.abs(Math.hypot(u - 0.5, (v - 0.42) * 1.0) - 0.24) < 0.022 && v > 0.42
  const stem = Math.abs(u - 0.5) < 0.02 && v > 0.66 && v < 0.84
  const base = Math.abs(v - 0.85) < 0.022 && Math.abs(u - 0.5) < 0.13
  if (dh < hr) {
    // grade do mic
    const grid = (Math.abs(((u - hx) * 40) % 2) < 0.35 || Math.abs(((v - hy) * 40) % 2) < 0.35) && dh < hr * 0.92
    c = grid ? mix(YELLOW, [255, 160, 0], 0.4) : YELLOW
    c = mix(c, [255, 255, 255], Math.max(0, 1 - Math.hypot(u - 0.44, v - 0.3) / 0.08) * 0.6)
  } else if (inBody) c = DARK
  else if (ring || stem || base) c = BLUE
  // estrelinhas
  for (const [sx, sy, sr] of [[0.2, 0.22, 0.05], [0.8, 0.3, 0.04], [0.78, 0.74, 0.035]]) {
    const dx = Math.abs(u - sx), dy = Math.abs(v - sy)
    if (dx * dy < sr * sr * 0.03 && dx < sr && dy < sr) c = [255, 255, 255]
  }
  return c
}

function icon(size, round) {
  const buf = Buffer.alloc(size * size * 4)
  const S = 3 // supersampling
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < S; sy++)
        for (let sx = 0; sx < S; sx++) {
          const u = (x + (sx + 0.5) / S) / size
          const v = (y + (sy + 0.5) / S) / size
          // cantos arredondados (só no ícone normal)
          const rr = 0.22
          const cx = Math.min(Math.max(u, rr), 1 - rr), cy = Math.min(Math.max(v, rr), 1 - rr)
          const inside = !round || Math.hypot(u - cx, v - cy) <= rr
          if (!inside) continue
          const c = shade(u, v)
          r += c[0]; g += c[1]; b += c[2]; a += 255
        }
      const n = S * S
      const i = (y * size + x) * 4
      const cov = a / 255
      buf[i] = cov ? r / cov : 0
      buf[i + 1] = cov ? g / cov : 0
      buf[i + 2] = cov ? b / cov : 0
      buf[i + 3] = a / n
    }
  return png(size, size, buf)
}

const out = (name, data) => writeFileSync(new URL(`../public/${name}`, import.meta.url), data)
out('icon-192.png', icon(192, true))
out('icon-512.png', icon(512, true))
out('icon-maskable-512.png', icon(512, false))
out('apple-touch-icon.png', icon(180, false))
console.log('ícones gerados')
