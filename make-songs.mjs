// Gera src/data/songs.json a partir da lista abaixo (titulo|artista|decada|energia)
// Rodar: node scripts/make-songs.mjs
import { writeFileSync } from 'node:fs'

const cats = {
  'Sertanejo Raiz': `Evidências|Chitãozinho & Xororó|90|3
Fio de Cabelo|Chitãozinho & Xororó|80|2
Pense em Mim|Leandro & Leonardo|90|3
Entre Tapas e Beijos|Leandro & Leonardo|80|3
É o Amor|Zezé Di Camargo & Luciano|90|2
Telefone Mudo|Trio Parada Dura|80|3
Fuscão Preto|Almir Rogério|80|4
Estrada da Vida|Milionário & José Rico|80|3
Boate Azul|Bruno & Marrone|2000|3
Dormi na Praça|Bruno & Marrone|2000|3`,
  'Pop Nacional': `Garota Nacional|Skank|90|5
Vou Deixar|Skank|2000|4
Anna Júlia|Los Hermanos|90|4
Prometida|Br'oZ|2000|4
Ragatanga|Rouge|2000|5
Brilha la Luna|Rouge|2000|4
Vamo Pulá!|Sandy & Junior|2000|5`,
  'Funk das Antigas': `Rap da Felicidade|Cidinho & Doca|90|4
Endereço dos Bailes|MC Júnior & MC Leonardo|90|4`,
  Internacional: `Girls Just Want to Have Fun|Cyndi Lauper|80|5
Wake Me Up Before You Go-Go|Wham!|80|5
I Wanna Dance with Somebody|Whitney Houston|80|5
Like a Prayer|Madonna|80|4
Livin' on a Prayer|Bon Jovi|80|5
Wannabe|Spice Girls|90|5
Barbie Girl|Aqua|90|5
Livin' la Vida Loca|Ricky Martin|90|5
Macarena|Los del Río|90|5
Everybody (Backstreet's Back)|Backstreet Boys|90|4
Mr. Brightside|The Killers|2000|5
Uptown Funk|Mark Ronson ft. Bruno Mars|2010|5
Shake It Off|Taylor Swift|2010|5
Call Me Maybe|Carly Rae Jepsen|2010|4
Party Rock Anthem|LMFAO|2010|5
Danza Kuduro|Don Omar & Lucenzo|2010|5
Despacito|Luis Fonsi ft. Daddy Yankee|2010|4`,
  'Divas Pop': `...Baby One More Time|Britney Spears|90|4
Oops!... I Did It Again|Britney Spears|2000|4
Toxic|Britney Spears|2000|5
Womanizer|Britney Spears|2000|5
Crazy in Love|Beyoncé|2000|5
Single Ladies|Beyoncé|2000|5
Irreplaceable|Beyoncé|2000|3
Survivor|Destiny's Child|2000|4
Hips Don't Lie|Shakira|2000|5
Whenever, Wherever|Shakira|2000|5
La Tortura|Shakira|2000|4
Waka Waka|Shakira|2010|5
Genie in a Bottle|Christina Aguilera|90|4
Umbrella|Rihanna|2000|3
Since U Been Gone|Kelly Clarkson|2000|5
Hollaback Girl|Gwen Stefani|2000|4
Can't Get You Out of My Head|Kylie Minogue|2000|4
Girlfriend|Avril Lavigne|2000|5
Hot N Cold|Katy Perry|2000|5
Just Dance|Lady Gaga|2000|5`,
}

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const songs = []
for (const [categoria, lines] of Object.entries(cats)) {
  for (const l of lines.split('\n')) {
    const [titulo, artista, decada, energia] = l.split('|')
    songs.push({
      id: slug(`${titulo}-${artista}`),
      titulo,
      artista,
      decada,
      categoria,
      energia: Number(energia),
      youtubeId: '',
      offsetLetra: 0,
    })
  }
}
writeFileSync(new URL('../src/data/songs.json', import.meta.url), JSON.stringify(songs, null, 2) + '\n')
console.log(songs.length, 'músicas')
