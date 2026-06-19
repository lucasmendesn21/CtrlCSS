# CtrlCSS — Gerador Visual de Estilos CSS

> Projeto acadêmico desenvolvido para o 1º semestre de ADS.

CtrlCSS é uma aplicação web single-page que permite gerar visualmente trechos de CSS — box model, tipografia, gradientes, animações, sombras, transform, filtros, variáveis (custom properties), paletas de cores e extração de cores de imagens — sem precisar memorizar sintaxe. O usuário ajusta os controles na tela, vê o resultado em tempo real e copia o código CSS gerado com um clique.

---

## 🚀 Instalação e execução

O projeto é um **arquivo HTML único** (sem build, sem dependências de backend e sem necessidade de `npm install`). Para executá-lo, basta:

### Opção 1 — Abrir diretamente no navegador
1. Faça o download do arquivo `.html` do projeto.
2. Dê duplo clique nele ou abra com seu navegador de preferência (Chrome, Firefox, Edge, Safari).
3. Pronto — o site já estará funcionando localmente.

### Opção 2 — Servidor local (recomendado)
Algumas funcionalidades (como leitura de imagens via `Canvas`) funcionam melhor servidas por HTTP em vez de `file://`. Para isso:

```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js (pacote http-server)
npx http-server -p 8000
```

Depois acesse `http://localhost:8000` no navegador.

> Não há etapas adicionais de instalação: não existem dependências externas além de fontes do Google Fonts, carregadas via CDN.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| **HTML5** | Estrutura semântica da página, com atributos de acessibilidade (`aria-*`, `role`) |
| **CSS3** | Estilização completa via `:root` custom properties, Flexbox, CSS Grid, gradientes, animações (`@keyframes`), filtros SVG e media queries para responsividade |
| **JavaScript (Vanilla, ES6+)** | Toda a lógica dos geradores, manipulação do DOM, conversões de cor (HEX ↔ RGB ↔ HSL), Canvas API e Clipboard API — sem frameworks ou bibliotecas externas |
| **Canvas API** | Leitura de pixels de imagens para extração de cores dominantes |
| **Clipboard API** | Cópia do CSS gerado para a área de transferência (com *fallback* via `document.execCommand` para navegadores antigos) |
| **SVG Filters** | Simulação de daltonismo (protanopia) aplicada via `feColorMatrix` |
| **Google Fonts** | `Bebas Neue` (títulos), `Space Grotesk` (corpo do texto) e `JetBrains Mono` (blocos de código) |

Não há dependência de frameworks (React, Vue, etc.), bundlers (Webpack, Vite) ou bibliotecas de terceiros em JS — todo o código roda nativamente no navegador.

---

## ⚙️ Como o sistema funciona

A página é dividida em **10 geradores independentes**, cada um seguindo o mesmo padrão de funcionamento:

1. O usuário interage com controles (`<input type="range">`, color pickers, `<select>`, checkboxes).
2. Cada interação dispara uma função JS (`oninput`/`onchange`) que:
   - Lê os valores atuais de todos os controles da seção;
   - Atualiza os rótulos visuais (ex: `12px`, `135deg`);
   - Aplica os estilos diretamente no elemento de preview via `element.style`;
   - Monta e exibe o código CSS correspondente em um bloco de código.
3. Um botão "Copiar" envia o CSS gerado para a área de transferência usando a Clipboard API.

### Resumo dos geradores

1. **Box** — `border-radius`, `padding`, `width`, `background`, `border`, `opacity`.
2. **Texto** — `font-size`, `font-weight`, `line-height`, `letter-spacing`, `font-family`, `text-align`, `color`.
3. **Gradiente** — linear, radial e cônico, com até 3 paradas de cor.
4. **Animação** — `pulse`, `bounce`, `spin`, `shake`, `fadeIn`, com controle de duração, delay, timing-function e repetições.
5. **Sombra** — `box-shadow` e `text-shadow` (alternados por abas), com offset, blur, spread, cor/opacidade e `inset`.
6. **Transform** — `rotate`, `scaleX/Y`, `skewX/Y`, `translateX/Y` combinados.
7. **Filtros** — `blur`, `brightness`, `contrast`, `grayscale`, `hue-rotate`, `saturate`, `sepia`.
8. **Variáveis CSS** — gera um bloco `:root` com 10 variações de tonalidade (tints/shades) e a cor complementar, a partir de uma cor base.
9. **Paleta de cores** — sugere paletas com base em harmonias cromáticas (complementar, análoga, triádica, split-complementar, monocromática), calculadas via conversão HSL.
10. **Extrator de cores de imagem** — o usuário arrasta ou seleciona uma imagem; ela é desenhada em um `<canvas>` oculto, os pixels são lidos via `getImageData()` e agrupados por um algoritmo de **quantização por corte mediano (median cut)** para identificar as cores dominantes.

### Funcionalidades de acessibilidade

- **Modo daltônico**: botão no menu que aplica um filtro SVG (matriz de cor para protanopia) sobre toda a página.
- **Tooltips de ajuda**: ícones "?" ao lado de cada propriedade CSS explicam sua função. São reposicionados dinamicamente via JavaScript (`getBoundingClientRect`) para nunca serem cortados pela borda da tela.
- **Navegação por teclado**: foco visível (`:focus-visible`) em todos os elementos interativos.
- **Suporte a `prefers-reduced-motion`**: reduz/desativa animações para usuários sensíveis a movimento.
- **Menu mobile (hambúrguer)**: abaixo de 900px de largura, o menu de navegação colapsa em um botão hambúrguer.

---

## 🌐 Compatibilidade

Recomenda-se o uso de navegadores modernos e atualizados (Chrome, Firefox, Edge ou Safari), pois o projeto utiliza recursos como `Clipboard API`, `backdrop-filter`, `CSS Custom Properties` e `Canvas API`.

---

## Prompts utilizados

1º prompt

"Claude, somos alunos do 1º semestre de Análise e Desenvolvimento de Sistemas e precisamos que você trabalhe como um desenvolvedor para nos auxiliar em um projeto. A nossa ideia era criar um site que auxiliasse os desenvolvedores a gerar estilos de diversas funções CSS. Utilize um estilo meio grafite no site, com cores mais chamativas. O nome do site será “CtrlCSS”. Crie seções para criação de Box (border-radius, padding, largura, cores, borda e opacidade), Texto (font-size, weight, line-height, letter-spacing, família e alinhamento),  Gradiente (linear/radial, ângulo, paradas de cor e terceira cor opcional), Animação (pulse, bounce, spin, shake, fadeIn com duração e timing customizáveis), Sombra (box-shadow e text-shadow com offset, blur, spread e cor com opacidade) e outras funções que você possa achar interessante. Queremos também uma área onde a pessoa  selecione uma cor principal e você faça uma sugestão de uma paleta  complementar e um lugar onde a pessoa possa jogar uma imagem e extrair as cores que a pessoa deseja utilizar.O site precisa ser acessível para dispositivos mobile e para pessoas com daltonismo também.Lembre-se de comentar a utilidade de todas as linhas do código."

2º prompt

"Ficou excelente! Precisamos apenas de algumas modificações e nada mais. Lembre-se mantenha tudo como está, altere somente o necessário para as modificações.

A versão mobile está ruim. O menu superior está deformado, conforme é possível ver na primeira imagem.
Gostaria também de retirar o botão no centro escrito "Paleta de cores" e manter apenas o "comece a criar".
Acho que ficaria legal colocar um simbolo de ponto de interrogação (?) ao lado de cada nome de função (ex: font-family, border-radius, etc), que ao passar o mouse em cima do símbolo, mostrasse o que determinada função faz especificamente. Facilitando o processo para pessoas com menos experiênia."


---

## 📜 Licença

Projeto acadêmico sem fins comerciais, desenvolvido para fins de estudo no curso de Análise e Desenvolvimento de Sistemas (ADS).
