# 🎤 Karaokê das Amigas

Karaokê com o **clipe original do YouTube** + **letra sincronizada** (estilo karaokê) + **nota fake divertida** no fim de cada música + **pódio** no fim da noite.
Feito para celular Android deitado, espelhado na Smart TV.

- Letras: buscadas na hora no [LRCLIB](https://lrclib.net) (nenhuma letra fica no código)
- Vídeos: YouTube (propagandas podem aparecer normalmente)
- Tudo fica salvo no próprio celular (sem servidor)

---

## 1. Como criar a chave grátis do YouTube 🔑

A chave serve para o app **achar o clipe sozinho** e para a tela **"Buscar no YouTube"**.
(Sem chave o app funciona, mas você teria que colar o link de cada clipe.)

1. Entre em **https://console.cloud.google.com** com sua conta Google.
2. Se for a primeira vez, aceite os termos.
3. No topo, clique em **"Selecionar projeto" → "Novo projeto"**. Nome: `karaoke` → **Criar**. Espere uns segundos e selecione esse projeto.
4. No menu ☰ vá em **"APIs e serviços" → "Biblioteca"**.
5. Busque **"YouTube Data API v3"**, clique nela e depois em **"Ativar"**.
6. Vá em **"APIs e serviços" → "Credenciais"** → **"+ Criar credenciais" → "Chave de API"**.
7. Vai aparecer uma chave parecida com `AIzaSy...`. **Copie.**
8. (Recomendado, para ninguém usar sua chave) Clique em **"Editar chave de API"**:
   - Em *Restrições de aplicativo* escolha **"Sites"** e adicione o endereço do seu app na Vercel, por exemplo `https://karaoke-das-amigas.vercel.app/*` (e `http://localhost:5173/*` se for testar no computador).
   - Em *Restrições de API* escolha **"Restringir chave"** e marque só **YouTube Data API v3**.
   - **Salvar**.

É de graça. O limite diário dá umas **100 buscas por dia** — de sobra para uma festa (o app guarda o clipe de cada música depois da primeira busca).

**Onde colocar a chave:**
- Na Vercel (passo 2 abaixo), como variável `VITE_YOUTUBE_API_KEY`; **ou**
- Direto no app: **⚙️ Configurações → Chave do YouTube → Salvar e testar** (fica salva só naquele celular).

---

## 2. Como publicar na Vercel 🚀

**Jeito mais fácil (pelo site, usando o GitHub):**

1. Crie uma conta grátis em **https://github.com** e outra em **https://vercel.com** (dá para entrar na Vercel com a conta do GitHub).
2. No GitHub, clique em **"New repository"**, nome `karaoke-das-amigas`, **Create**.
3. Na página do repositório novo, clique em **"uploading an existing file"** e arraste **todo o conteúdo desta pasta** (MENOS as pastas `node_modules` e `dist`). Clique em **Commit changes**.
4. Na Vercel: **"Add New…" → "Project"** → escolha o repositório `karaoke-das-amigas` → **Import**.
5. A Vercel reconhece sozinha que é **Vite**. Abra **"Environment Variables"** e adicione:
   - Nome: `VITE_YOUTUBE_API_KEY`
   - Valor: a sua chave `AIza...`
6. Clique em **Deploy**. Em 1 minuto aparece o endereço, tipo `https://karaoke-das-amigas.vercel.app`. 🎉
7. Volte no Google Cloud (passo 8 da chave) e coloque esse endereço nas restrições.

**Jeito pelo terminal (se tiver o Node instalado):**
```bash
npm install
npx vercel
```
Responda às perguntas (pode aceitar tudo), depois adicione a variável `VITE_YOUTUBE_API_KEY` no painel da Vercel e rode `npx vercel --prod`.

> Mudou a chave na Vercel? Clique em **Redeploy** para valer.

---

## 3. Como instalar no celular Android 📲

1. Abra o endereço do app no **Chrome** do celular.
2. Toque no menu **⋮** (três pontinhos) → **"Instalar app"** (ou "Adicionar à tela inicial"). Às vezes aparece direto o botão **📲 Instalar no celular** na tela inicial do karaokê.
3. Pronto: aparece o ícone do microfone na tela do celular. Aberto por ele, o app já fica **em tela cheia e deitado**.
4. Na primeira vez, toque em **📺 Tela cheia** para travar na horizontal.

Dicas para a festa:
- Deixe o celular **carregando** e com o **brilho no máximo**.
- O app pede para a **tela não apagar** (aparece "💡 tela sempre acesa" no início).
- Desligue o "modo economia de bateria" (ele pode atrapalhar).

---

## 4. Como espelhar na Smart TV 📺

**Samsung (Smart View):**
1. Celular e TV no **mesmo Wi-Fi**.
2. Puxe a barra de notificações do celular (deslize de cima para baixo duas vezes).
3. Toque em **"Smart View"** e escolha a TV. Na TV, aceite (**Permitir**).
4. **Gire o celular** — a imagem na TV fica deitada e grande.

**Outras marcas (LG, Philips, TCL, Xiaomi, Motorola…):**
- Procure na barra rápida por **"Transmitir tela"**, **"Espelhar tela"**, **"Screen Cast"** ou **"Projeção sem fio"**.
- Se a TV tiver **Chromecast / Google TV**: abra o app **Google Home** → toque na TV → **"Transmitir minha tela"**.
- Na LG, às vezes é preciso abrir o app **"Screen Share"** na TV primeiro.

**O som:** quando espelha, o som do vídeo normalmente sai **pela TV**. Se sair pelo celular, aumente o volume da TV pelo próprio celular ou desconecte o fone/Bluetooth.

> ⚠️ Por regra do YouTube, nada é desenhado por cima do vídeo: o clipe fica em cima e a letra embaixo.

---

## Como usar na festa 🎉

1. **👯 Cadastrar cantoras** (nome + emoji + cor).
2. **🎉 Começar a festa** → **🎵 Catálogo** ou **🔎 YouTube** → escolha a música e quem canta.
3. **▶ Soltar a voz!** — o clipe toca e a letra aparece embaixo.
   - Letra chegando **depois** da voz? Toque **🐢 Letra atrasada**. Chegando **antes**? **🐇 Letra adiantada**. (Segure o botão para ajustar rápido. O ajuste fica salvo para aquela música.)
   - Clipe errado? **🔄 Vídeo errado? Trocar**.
4. No fim da música (ou em **🏁 Encerrar**), vem a roleta e a nota! Toque **▶ Próxima música**.
5. No final: **🏆 Encerrar a festa** → pódio com 1º, 2º e 3º lugar e prêmios extras.

**Como a nota é calculada (é só brincadeira — não usa microfone):** cada música tem uma **energia** de 1 a 5 🔥 e a nota é sorteada dentro da faixa:

| Energia | Nota |
|---|---|
| 🔥🔥🔥🔥🔥 5 | 95 a 100 |
| 🔥🔥🔥🔥 4 | 88 a 97 |
| 🔥🔥🔥 3 | 80 a 92 |
| 🔥🔥 2 | 72 a 86 |
| 🔥 1 | 65 a 80 |

Dá para mudar a energia em **⚙️ Configurações**.

---

## Para quem mexe no código 🛠️

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a versão final em dist/
```

- `src/data/songs.json` — catálogo inicial (gerado por `scripts/make-songs.mjs`)
- `src/screens/` — uma tela por arquivo (Inicio, Cantoras, Catalogo, BuscarYouTube, Fila, Palco, Nota, Podio, Config)
- `src/lib/lrclib.ts` — busca e leitura das letras (formato LRC)
- `src/lib/youtube.ts` — busca de clipes e player
- `src/lib/score.ts` — faixas de nota e mensagens
- `src/lib/audio.ts` — fanfarra, tique-taque e trombone triste gerados com Web Audio
- Ícones: `node scripts/make-icons.mjs`
