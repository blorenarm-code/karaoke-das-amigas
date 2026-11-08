// PONTUAÇÃO FAKE — só diversão, não usa microfone.
// A nota depende da ENERGIA da música + um pouquinho de sorte.
import type { Result, Song } from '../types'

/** Faixa de nota para cada energia (1 a 5) */
export const FAIXAS: Record<number, [number, number]> = {
  5: [95, 100],
  4: [88, 97],
  3: [80, 92],
  2: [72, 86],
  1: [65, 80],
}

export function sortearNota(energia: number): number {
  const [min, max] = FAIXAS[Math.min(5, Math.max(1, Math.round(energia)))]
  // "sorte": média de dois sorteios deixa as notas do meio da faixa mais comuns
  const sorte = (Math.random() + Math.random()) / 2
  return Math.round(min + sorte * (max - min))
}

export function estrelasDaNota(nota: number): number {
  if (nota >= 95) return 5
  if (nota >= 88) return 4
  if (nota >= 80) return 3
  if (nota >= 70) return 2
  return 1
}

const MENSAGENS: { min: number; textos: string[] }[] = [
  {
    min: 100,
    textos: [
      'VOCÊ BRILHOU! ✨ Diva absoluta!',
      'NOTA MÁXIMA! A Beyoncé ligou pedindo aula 👑',
      'PERFEITA! Pode pedir música no Faustão! 🏆',
      'CEM! Até o vizinho aplaudiu da janela 👏',
      'Lendária! Já pode sair em turnê mundial 🌍✨',
    ],
  },
  {
    min: 95,
    textos: [
      'Arrasou! A plateia foi à loucura! 🔥',
      'Que voz! Tô até arrepiada! 😱',
      'Chama a gravadora que temos uma estrela! 🎤',
      'Isso foi show de estádio, amiga! 🏟️',
      'Deu aula! O microfone pediu autógrafo ✍️',
    ],
  },
  {
    min: 88,
    textos: [
      'Mandou muito bem, hein!',
      'Tá pronta pro The Voice! 🎙️',
      'Que performance! Rebolou e afinou 💃',
      'Segura essa diva que ela tá voando! 🚀',
      'Aplausos de pé pra essa voz! 👏👏',
    ],
  },
  {
    min: 80,
    textos: [
      'Bonito de ver! Quase uma estrela 🌟',
      'Tá no caminho do estrelato! ⭐',
      'Cantou com o coração, e o coração aprovou 💖',
      'Mais uma dessa e vira profissional! 😎',
      'Boa! O chuveiro ficou com inveja 🚿',
    ],
  },
  {
    min: 70,
    textos: [
      'Na próxima dá pra ser mais afinada 😂',
      'A intenção foi nota 100! 😅',
      'O ritmo foi pra um lado, você pro outro 🙃',
      'Tem talento… escondido, mas tem! 🔍',
      'A empolgação compensou a afinação! 🤪',
    ],
  },
  {
    min: 0,
    textos: [
      'O importante é a alegria, né? 💃',
      'Afinação tirou folga hoje 🏖️',
      'Os cachorros da rua uivaram junto 🐶',
      'Valeu pela coragem, guerreira! 💪',
      'Ninguém entendeu, mas todo mundo amou 😂',
    ],
  },
]

const SOFRENCIA = [
  'Sofreu bonito! Chorou até a TV 😭',
  'Isso é que é sofrência raiz! 🤠💔',
  'Essa veio lá do fundo do coração! 🎶',
  'Garçom, traz mais uma que ela tá sofrendo! 🍻',
  'Até a viola chorou junto! 🎻😭',
  'Chitãozinho e Xororó mandaram um abraço 🤠',
]

const sortear = <T,>(lista: T[]) => lista[Math.floor(Math.random() * lista.length)]

export function mensagemDaNota(nota: number, categoria: string): string {
  // no sertanejo, metade das vezes vem uma mensagem de sofrência (se a nota não for baixa)
  if (categoria === 'Sertanejo Raiz' && nota >= 80 && Math.random() < 0.5) return sortear(SOFRENCIA)
  const faixa = MENSAGENS.find((m) => nota >= m.min) ?? MENSAGENS[MENSAGENS.length - 1]
  return sortear(faixa.textos)
}

export function gerarResultado(song: Song, singerIds: string[]): Result {
  const nota = sortearNota(song.energia)
  return {
    id: Math.random().toString(36).slice(2, 10),
    songId: song.id,
    titulo: song.titulo,
    artista: song.artista,
    categoria: song.categoria,
    energia: song.energia,
    singerIds,
    nota,
    estrelas: estrelasDaNota(nota),
    mensagem: mensagemDaNota(nota, song.categoria),
    at: Date.now(),
  }
}
