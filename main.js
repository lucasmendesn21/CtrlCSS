/* =============================================
   UTILITÁRIOS GERAIS
============================================= */

/**
 * hexToRgb — Converte cor HEX para objeto {r, g, b}.
 * Necessário para aplicar opacidade (rgba) e cálculos de paleta.
 * @param {string} hex — cor no formato "#RRGGBB"
 * @returns {{r,g,b}} objeto com canais de cor
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16); // Canal vermelho
  const g = parseInt(hex.slice(3,5), 16); // Canal verde
  const b = parseInt(hex.slice(5,7), 16); // Canal azul
  return { r, g, b };
}

/**
 * hexToHsl — Converte HEX para HSL (Hue/Saturation/Lightness).
 * HSL é ideal para rotação de matiz na geração de paletas.
 * @param {string} hex
 * @returns {{h,s,l}} ângulo de matiz (0-360), saturação e luminosidade (0-100)
 */
function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // Cor acromática (cinza)
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    // Calcula o matiz baseado no canal dominante
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * hslToHex — Converte HSL de volta para HEX.
 * Usado após rotacionar o matiz para gerar cores harmônicas.
 * @param {number} h — matiz (0-360)
 * @param {number} s — saturação (0-100)
 * @param {number} l — luminosidade (0-100)
 * @returns {string} cor em formato "#RRGGBB"
 */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  // Converte cada canal para HEX de 2 dígitos
  return '#' + [f(0), f(8), f(4)]
    .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * hexToRgba — Retorna string rgba() com opacidade.
 * @param {string} hex
 * @param {number} alpha — 0 a 1
 * @returns {string} "rgba(r, g, b, alpha)"
 */
function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * showToast — Exibe a notificação de cópia por 2 segundos.
 */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');          // Anima a entrada
  setTimeout(() => toast.classList.remove('show'), 2000); // Remove após 2s
}

/**
 * copyCode — Copia o conteúdo de um elemento pelo ID.
 * @param {string} id — ID do elemento com o código
 */
function copyCode(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim())
    .then(showToast)
    .catch(() => {
      // Fallback para browsers mais antigos sem navigator.clipboard
      const ta = document.createElement('textarea');
      ta.value = el.textContent.trim();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    });
}

/* =============================================
   MODO DALTÔNICO
============================================= */

/**
 * toggleColorblind — Alterna o filtro de daltonismo no body.
 * Aplica/remove a classe "cb-mode" que ativa o filtro SVG.
 */
function toggleColorblind() {
  const body = document.body;
  const btn = document.getElementById('cb-toggle-btn');
  const isActive = body.classList.toggle('cb-mode');

  // Atualiza estado ARIA do botão (acessibilidade)
  btn.setAttribute('aria-pressed', isActive.toString());
  btn.classList.toggle('active', isActive);
}

/* =============================================
   TOOLTIP GLOBAL DE AJUDA
   Substitui o tooltip 100% CSS (que se mostrava frágil em
   containers flex/grid aninhados, herdando larguras erradas).
   Aqui, um único elemento (#global-tooltip) é reposicionado
   via JavaScript usando getBoundingClientRect(), que retorna
   a posição REAL do ícone na tela — independente de quantos
   containers com position:relative existam ao redor dele.
============================================= */

// Referência ao elemento único de tooltip, reaproveitado por todos os ícones
const globalTooltip = document.getElementById('global-tooltip');

/**
 * positionAndShowTooltip — Calcula a posição ideal do tooltip
 * em relação ao ícone "?" que dispara o evento, e o exibe.
 * @param {HTMLElement} icon — o elemento .help-icon que originou o hover/foco
 */
function positionAndShowTooltip(icon) {
  // Lê o texto explicativo armazenado dentro do ícone (fonte oculta)
  const textEl = icon.querySelector('.tooltip-text');
  if (!textEl) return;
  globalTooltip.textContent = textEl.textContent.trim();

  // getBoundingClientRect() dá a posição do ícone relativa à
  // VIEWPORT (janela visível), não a nenhum container pai —
  // por isso o cálculo abaixo é sempre confiável.
  const iconRect = icon.getBoundingClientRect();

  // Torna o tooltip mensurável (mas ainda invisível) para
  // conseguir ler sua largura/altura reais antes de posicionar
  globalTooltip.style.visibility = 'hidden';
  globalTooltip.classList.add('show');
  const tooltipRect = globalTooltip.getBoundingClientRect();

  // --- Posição horizontal: centraliza sobre o ícone ---
  let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

  // Garante uma margem mínima de 12px das bordas da tela,
  // para o tooltip nunca ficar cortado lateralmente
  const margin = 12;
  if (left < margin) left = margin;
  if (left + tooltipRect.width > window.innerWidth - margin) {
    left = window.innerWidth - tooltipRect.width - margin;
  }

  // Posição horizontal da setinha: deve apontar para o ícone,
  // mesmo que a caixa do tooltip tenha sido deslocada pelos
  // limites de tela acima. Calcula o quanto a seta deve se
  // afastar da borda esquerda do tooltip.
  const iconCenterX = iconRect.left + iconRect.width / 2;
  let arrowLeft = iconCenterX - left;
  // Mantém a seta dentro dos limites visuais da caixinha
  arrowLeft = Math.max(12, Math.min(tooltipRect.width - 12, arrowLeft));
  globalTooltip.style.setProperty('--arrow-left', `${arrowLeft}px`);

  // --- Posição vertical: prioriza aparecer ACIMA do ícone ---
  const gap = 10; // distância entre o ícone e a caixa
  let top = iconRect.top - tooltipRect.height - gap;
  let arrowClass = 'arrow-down'; // seta aponta pra baixo = caixa está em cima

  // Se não houver espaço acima (ex.: ícone perto do topo da
  // página/seção), exibe o tooltip ABAIXO do ícone em vez disso
  if (top < margin) {
    top = iconRect.bottom + gap;
    arrowClass = 'arrow-up'; // seta aponta pra cima = caixa está embaixo
  }

  globalTooltip.classList.remove('arrow-up', 'arrow-down');
  globalTooltip.classList.add(arrowClass);

  globalTooltip.style.left = `${left}px`;
  globalTooltip.style.top = `${top}px`;
  globalTooltip.style.visibility = 'visible';
}

/** hideTooltip — Oculta o tooltip global. */
function hideTooltip() {
  globalTooltip.classList.remove('show');
}

// Liga os eventos de mouse e teclado a TODOS os ícones de ajuda
// da página de uma só vez (delegação simples via querySelectorAll,
// já que os ícones são estáticos no HTML, não criados depois).
document.querySelectorAll('.help-icon').forEach((icon) => {
  icon.addEventListener('mouseenter', () => positionAndShowTooltip(icon));
  icon.addEventListener('mouseleave', hideTooltip);
  icon.addEventListener('focus', () => positionAndShowTooltip(icon));
  icon.addEventListener('blur', hideTooltip);
});

// Reposiciona (ou esconde) o tooltip ativo se a janela for
// rolada ou redimensionada, evitando que ele "flutue" desalinhado
window.addEventListener('scroll', hideTooltip, { passive: true });
window.addEventListener('resize', hideTooltip);

/* =============================================
   MENU MOBILE (HAMBÚRGUER)
============================================= */

/**
 * toggleMobileMenu — Abre/fecha o painel de links de navegação
 * em telas estreitas, alternando a classe "open" na lista
 * e atualizando o estado ARIA do botão hambúrguer.
 */
function toggleMobileMenu() {
  const links = document.getElementById('nav-links');
  const btn   = document.getElementById('nav-toggle-btn');
  const isOpen = links.classList.toggle('open');

  btn.classList.toggle('active', isOpen);
  btn.setAttribute('aria-expanded', isOpen.toString());
  btn.textContent = isOpen ? '✕' : '☰'; // Troca o ícone para "fechar" quando aberto
}

// Fecha o menu mobile automaticamente ao clicar em qualquer link,
// evitando que o painel fique aberto sobre a seção de destino.
document.getElementById('nav-links').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    const links = document.getElementById('nav-links');
    const btn   = document.getElementById('nav-toggle-btn');
    links.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '☰';
  }
});

/* =============================================
   1. GERADOR DE BOX
============================================= */

/**
 * updateBox — Lê todos os controles do box e atualiza
 * o preview e o código CSS em tempo real.
 */
function updateBox() {
  // Lê todos os valores dos controles
  const radius  = document.getElementById('box-radius').value;
  const padding = document.getElementById('box-padding').value;
  const width   = document.getElementById('box-width').value;
  const bg      = document.getElementById('box-bg').value;
  const bColor  = document.getElementById('box-border-color').value;
  const bWidth  = document.getElementById('box-border-width').value;
  const bStyle  = document.getElementById('box-border-style').value;
  const opacity = document.getElementById('box-opacity').value;

  // Atualiza os labels com os valores numéricos
  document.getElementById('box-radius-val').textContent  = radius + 'px';
  document.getElementById('box-padding-val').textContent = padding + 'px';
  document.getElementById('box-width-val').textContent   = width + 'px';
  document.getElementById('box-border-width-val').textContent = bWidth + 'px';
  document.getElementById('box-opacity-val').textContent = opacity;

  // Aplica os estilos diretamente no elemento de preview
  const preview = document.getElementById('box-preview');
  preview.style.borderRadius  = radius + 'px';
  preview.style.padding       = padding + 'px';
  preview.style.width         = width + 'px';
  preview.style.background    = bg;
  preview.style.border        = `${bWidth}px ${bStyle} ${bColor}`;
  preview.style.opacity       = opacity;

  // Gera e exibe o código CSS formatado
  document.getElementById('box-code').textContent =
`.element {
  border-radius: ${radius}px;
  padding: ${padding}px;
  width: ${width}px;
  background: ${bg};
  border: ${bWidth}px ${bStyle} ${bColor};
  opacity: ${opacity};
}`;
}

/* =============================================
   2. GERADOR DE TEXTO
============================================= */

/** updateText — Atualiza preview e código de tipografia. */
function updateText() {
  const size    = document.getElementById('txt-size').value;
  const weight  = document.getElementById('txt-weight').value;
  const lh      = document.getElementById('txt-lh').value;
  const ls      = document.getElementById('txt-ls').value;
  const family  = document.getElementById('txt-family').value;
  const align   = document.getElementById('txt-align').value;
  const color   = document.getElementById('txt-color').value;

  // Atualiza labels
  document.getElementById('txt-size-val').textContent   = size + 'px';
  document.getElementById('txt-weight-val').textContent = weight;
  document.getElementById('txt-lh-val').textContent     = lh;
  document.getElementById('txt-ls-val').textContent     = ls + 'px';

  // Aplica no preview
  const preview = document.getElementById('text-preview');
  preview.style.fontSize      = size + 'px';
  preview.style.fontWeight    = weight;
  preview.style.lineHeight    = lh;
  preview.style.letterSpacing = ls + 'px';
  preview.style.fontFamily    = family;
  preview.style.textAlign     = align;
  preview.style.color         = color;

  document.getElementById('text-code').textContent =
`.element {
  font-size: ${size}px;
  font-weight: ${weight};
  line-height: ${lh};
  letter-spacing: ${ls}px;
  font-family: ${family};
  text-align: ${align};
  color: ${color};
}`;
}

/* =============================================
   3. GERADOR DE GRADIENTE
============================================= */

/** updateGradient — Monta o gradiente conforme tipo, ângulo e cores. */
function updateGradient() {
  const type   = document.getElementById('grad-type').value;
  const angle  = document.getElementById('grad-angle').value;
  const c1     = document.getElementById('grad-c1').value;
  const c2     = document.getElementById('grad-c2').value;
  const stop1  = document.getElementById('grad-stop1').value;
  const stop2  = document.getElementById('grad-stop2').value;
  const useC3  = document.getElementById('grad-use-c3').checked;
  const c3     = document.getElementById('grad-c3').value;
  const stop3  = document.getElementById('grad-stop3').value;

  // Mostra/esconde o grupo de terceira cor
  document.getElementById('grad-c3-group').style.display = useC3 ? 'block' : 'none';
  // Mostra/esconde o controle de ângulo (não aplicável no radial)
  document.getElementById('grad-angle-group').style.display =
    type === 'radial' ? 'none' : 'flex';

  // Atualiza labels
  document.getElementById('grad-angle-val').textContent = angle + 'deg';
  document.getElementById('grad-stop1-val').textContent = stop1 + '%';
  document.getElementById('grad-stop2-val').textContent = stop2 + '%';
  document.getElementById('grad-stop3-val').textContent = stop3 + '%';

  // Monta a lista de paradas de cor
  const stops = useC3
    ? `${c1} ${stop1}%, ${c3} ${stop3}%, ${c2} ${stop2}%`
    : `${c1} ${stop1}%, ${c2} ${stop2}%`;

  // Monta a função CSS de gradiente conforme o tipo
  let gradientCSS = '';
  if (type === 'linear') {
    gradientCSS = `linear-gradient(${angle}deg, ${stops})`;
  } else if (type === 'radial') {
    gradientCSS = `radial-gradient(circle, ${stops})`;
  } else {
    gradientCSS = `conic-gradient(from ${angle}deg, ${stops})`;
  }

  // Aplica no preview
  document.getElementById('gradient-preview').style.background = gradientCSS;

  document.getElementById('gradient-code').textContent =
`.element {
  background: ${gradientCSS};
}`;
}

/* =============================================
   4. GERADOR DE ANIMAÇÃO
============================================= */

/** updateAnimation — Aplica animação customizada no preview. */
function updateAnimation() {
  const type     = document.getElementById('anim-type').value;
  const duration = document.getElementById('anim-duration').value;
  const timing   = document.getElementById('anim-timing').value;
  const delay    = document.getElementById('anim-delay').value;
  const count    = document.getElementById('anim-count').value;

  // Atualiza labels
  document.getElementById('anim-duration-val').textContent = duration + 's';
  document.getElementById('anim-delay-val').textContent    = delay + 's';

  const target = document.getElementById('anim-target');

  // Aplica a animação com todos os parâmetros customizados
  target.style.animation =
    `${type} ${duration}s ${timing} ${delay}s ${count}`;

  // Gera o bloco completo com @keyframes e declaration
  const keyframes = getKeyframes(type);
  document.getElementById('animation-code').textContent =
`/* Keyframes da animação */
${keyframes}

/* Aplicar no elemento */
.element {
  animation: ${type} ${duration}s ${timing} ${delay}s ${count};
}`;
}

/**
 * getKeyframes — Retorna o @keyframes CSS de cada animação.
 * @param {string} name — nome da animação
 * @returns {string} código @keyframes
 */
function getKeyframes(name) {
  const map = {
    pulse:
`@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}`,
    bounce:
`@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`,
    spin:
`@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    shake:
`@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}`,
    fadeIn:
`@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}`
  };
  return map[name] || '';
}

/**
 * replayAnimation — Reinicia a animação removendo e
 * re-adicionando o estilo animation para forçar o replay.
 */
function replayAnimation() {
  const target = document.getElementById('anim-target');
  target.style.animation = 'none';           // Remove animação
  // Força reflow do browser (necessário para reiniciar animação)
  void target.offsetWidth;
  updateAnimation();                          // Re-aplica
}

/* =============================================
   5. GERADOR DE SOMBRA
============================================= */

/** Estado atual da aba de sombra: 'box' ou 'text' */
let currentShadowTab = 'box';

/**
 * switchShadowTab — Alterna entre box-shadow e text-shadow.
 * @param {string} tab — 'box' ou 'text'
 */
function switchShadowTab(tab) {
  currentShadowTab = tab;

  // Atualiza estado ativo dos botões de aba
  document.getElementById('tab-box-shadow').classList.toggle('active', tab === 'box');
  document.getElementById('tab-text-shadow').classList.toggle('active', tab === 'text');

  // Atualiza estado ARIA das abas
  document.getElementById('tab-box-shadow').setAttribute('aria-selected', tab === 'box');
  document.getElementById('tab-text-shadow').setAttribute('aria-selected', tab === 'text');

  // Mostra/esconde previews conforme aba selecionada
  document.getElementById('shadow-box-preview').style.display  = tab === 'box'  ? 'flex'  : 'none';
  document.getElementById('shadow-text-preview').style.display = tab === 'text' ? 'block' : 'none';

  // Mostra/esconde o controle de spread (não existe em text-shadow)
  document.getElementById('shadow-spread-group').style.display  = tab === 'box' ? 'flex' : 'none';
  document.getElementById('shadow-inset-label').style.display   = tab === 'box' ? 'flex' : 'none';

  updateShadow(); // Atualiza o preview e código
}

/** updateShadow — Aplica sombra nos elementos de preview. */
function updateShadow() {
  const x       = document.getElementById('shadow-x').value;
  const y       = document.getElementById('shadow-y').value;
  const blur    = document.getElementById('shadow-blur').value;
  const spread  = document.getElementById('shadow-spread').value;
  const color   = document.getElementById('shadow-color').value;
  const opacity = document.getElementById('shadow-opacity').value;
  const inset   = document.getElementById('shadow-inset').checked;

  // Atualiza labels
  document.getElementById('shadow-x-val').textContent       = x + 'px';
  document.getElementById('shadow-y-val').textContent       = y + 'px';
  document.getElementById('shadow-blur-val').textContent    = blur + 'px';
  document.getElementById('shadow-spread-val').textContent  = spread + 'px';
  document.getElementById('shadow-opacity-val').textContent = opacity;

  // Monta a string rgba da cor com opacidade
  const rgba = hexToRgba(color, opacity);

  if (currentShadowTab === 'box') {
    // box-shadow: offset-x offset-y blur spread color [inset]
    const insetStr = inset ? 'inset ' : '';
    const shadow = `${insetStr}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
    document.getElementById('shadow-box-preview').style.boxShadow = shadow;
    document.getElementById('shadow-code').textContent =
`.element {
  box-shadow: ${shadow};
}`;
  } else {
    // text-shadow não suporta spread nem inset
    const shadow = `${x}px ${y}px ${blur}px ${rgba}`;
    document.getElementById('shadow-text-preview').style.textShadow = shadow;
    document.getElementById('shadow-code').textContent =
`.element {
  text-shadow: ${shadow};
}`;
  }
}

/* =============================================
   6. GERADOR DE TRANSFORM
============================================= */

/** updateTransform — Monta o valor de transform a partir de todos os controles. */
function updateTransform() {
  const rotate = document.getElementById('tf-rotate').value;
  const scaleX = document.getElementById('tf-scalex').value;
  const scaleY = document.getElementById('tf-scaley').value;
  const skewX  = document.getElementById('tf-skewx').value;
  const skewY  = document.getElementById('tf-skewy').value;
  const tx     = document.getElementById('tf-tx').value;
  const ty     = document.getElementById('tf-ty').value;

  // Atualiza labels
  document.getElementById('tf-rotate-val').textContent = rotate + 'deg';
  document.getElementById('tf-scalex-val').textContent = scaleX;
  document.getElementById('tf-scaley-val').textContent = scaleY;
  document.getElementById('tf-skewx-val').textContent  = skewX + 'deg';
  document.getElementById('tf-skewy-val').textContent  = skewY + 'deg';
  document.getElementById('tf-tx-val').textContent     = tx + 'px';
  document.getElementById('tf-ty-val').textContent     = ty + 'px';

  // Monta o valor CSS de transform com todas as funções
  const tfValue =
    `rotate(${rotate}deg) ` +
    `scaleX(${scaleX}) scaleY(${scaleY}) ` +
    `skewX(${skewX}deg) skewY(${skewY}deg) ` +
    `translateX(${tx}px) translateY(${ty}px)`;

  document.getElementById('transform-preview').style.transform = tfValue;

  document.getElementById('transform-code').textContent =
`.element {
  transform: ${tfValue};
}`;
}

/** resetTransform — Reseta todos os sliders de transform para os valores padrão. */
function resetTransform() {
  document.getElementById('tf-rotate').value = 0;
  document.getElementById('tf-scalex').value = 1;
  document.getElementById('tf-scaley').value = 1;
  document.getElementById('tf-skewx').value  = 0;
  document.getElementById('tf-skewy').value  = 0;
  document.getElementById('tf-tx').value     = 0;
  document.getElementById('tf-ty').value     = 0;
  updateTransform();
}

/* =============================================
   7. GERADOR DE FILTROS
============================================= */

/** updateFilter — Monta a string filter com todos os filtros ativos. */
function updateFilter() {
  const blur       = document.getElementById('f-blur').value;
  const brightness = document.getElementById('f-brightness').value;
  const contrast   = document.getElementById('f-contrast').value;
  const grayscale  = document.getElementById('f-grayscale').value;
  const huerotate  = document.getElementById('f-huerotate').value;
  const saturate   = document.getElementById('f-saturate').value;
  const sepia      = document.getElementById('f-sepia').value;

  // Atualiza labels
  document.getElementById('f-blur-val').textContent       = blur + 'px';
  document.getElementById('f-brightness-val').textContent = brightness + '%';
  document.getElementById('f-contrast-val').textContent   = contrast + '%';
  document.getElementById('f-grayscale-val').textContent  = grayscale + '%';
  document.getElementById('f-huerotate-val').textContent  = huerotate + 'deg';
  document.getElementById('f-saturate-val').textContent   = saturate + '%';
  document.getElementById('f-sepia-val').textContent      = sepia + '%';

  // Monta a string filter com todas as funções ativas
  const filterValue =
    `blur(${blur}px) ` +
    `brightness(${brightness}%) ` +
    `contrast(${contrast}%) ` +
    `grayscale(${grayscale}%) ` +
    `hue-rotate(${huerotate}deg) ` +
    `saturate(${saturate}%) ` +
    `sepia(${sepia}%)`;

  document.getElementById('filter-preview').style.filter = filterValue;

  document.getElementById('filter-code').textContent =
`.element {
  filter: ${filterValue};
}`;
}

/* =============================================
   8. GERADOR DE VARIÁVEIS CSS
============================================= */

/**
 * updateVars — Gera um bloco :root com variáveis baseadas
 * na cor primária: tints (mais claros), shades (mais escuros)
 * e variações de saturação.
 */
function updateVars() {
  const hex    = document.getElementById('vars-primary').value;
  const prefix = document.getElementById('vars-prefix').value || 'color';
  const { h, s, l } = hexToHsl(hex);

  // Gera 10 variações: tints (lightness alta) até shades (lightness baixa)
  const shades = [95, 85, 70, 55, 40, 30, 20, 12, 6];
  const names  = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  let lines = ':root {\n';
  // Adiciona a cor base
  lines += `  --${prefix}-base: ${hex};\n`;

  // Gera as variações de luminosidade
  shades.forEach((light, i) => {
    const varHex = hslToHex(h, s, light);
    lines += `  --${prefix}-${names[i]}: ${varHex};\n`;
  });

  // Adiciona cor complementar (oposta no círculo cromático: +180°)
  const compHex = hslToHex((h + 180) % 360, s, l);
  lines += `\n  /* Complementar */\n`;
  lines += `  --${prefix}-comp: ${compHex};\n`;

  lines += '}';

  document.getElementById('vars-output').textContent = lines;
}

/** copyVars — Copia o conteúdo do bloco de variáveis. */
function copyVars() {
  copyCode('vars-output');
}

/* =============================================
   9. GERADOR DE PALETA
============================================= */

/**
 * updatePalette — Gera paleta de cores baseada em harmonia cromática.
 * Suporta: complementar, análoga, triádica, split-complementar e monocromática.
 */
function updatePalette() {
  const hex     = document.getElementById('palette-primary').value;
  const harmony = document.getElementById('palette-harmony').value;
  const { h, s, l } = hexToHsl(hex);

  // Define os ângulos de matiz para cada harmonia
  let hues = [];
  switch (harmony) {
    case 'complementary':
      // Cor oposta: 180 graus no círculo cromático
      hues = [h, (h + 180) % 360];
      break;
    case 'analogous':
      // Cores vizinhas: ±30 e ±60 graus
      hues = [(h - 60 + 360) % 360, (h - 30 + 360) % 360, h, (h + 30) % 360, (h + 60) % 360];
      break;
    case 'triadic':
      // 3 cores equidistantes: 120 graus de separação
      hues = [h, (h + 120) % 360, (h + 240) % 360];
      break;
    case 'split':
      // Complementar dividida: ±30 graus da complementar
      hues = [h, (h + 150) % 360, (h + 210) % 360];
      break;
    case 'monochromatic':
      // Mesma tonalidade, diferentes luminosidades
      hues = [h, h, h, h, h];
      break;
  }

  // Para cada matiz, gera variações de luminosidade
  const colors = [];
  if (harmony === 'monochromatic') {
    // 5 variações da mesma tonalidade
    [20, 35, 50, 65, 80].forEach((light, i) => {
      colors.push({ name: `tom-${i + 1}`, hex: hslToHex(h, s, light) });
    });
  } else {
    // Para cada matiz da harmonia, gera 2 variações
    hues.forEach((hue, i) => {
      colors.push({ name: `cor-${i + 1}`, hex: hslToHex(hue, s, l) });
      // Variação mais clara da mesma cor
      colors.push({ name: `cor-${i + 1}-light`, hex: hslToHex(hue, s, Math.min(l + 20, 90)) });
    });
  }

  // Sempre inclui a cor original como primeira
  colors.unshift({ name: 'primária', hex });

  // Renderiza os swatches na interface
  const grid = document.getElementById('palette-grid');
  grid.innerHTML = colors.map(c => `
    <div class="swatch" role="listitem"
      onclick="navigator.clipboard.writeText('${c.hex}').then(showToast)"
      title="Clique para copiar ${c.hex}"
      aria-label="${c.name}: ${c.hex}">
      <div class="swatch-color" style="background:${c.hex};"></div>
      <div class="swatch-label">${c.hex}</div>
    </div>
  `).join('');

  // Gera código CSS das variáveis da paleta
  const cssVars = colors.map((c, i) =>
    `  --palette-${c.name}: ${c.hex};`
  ).join('\n');

  document.getElementById('palette-code').textContent =
`:root {
${cssVars}
}`;
}

/* =============================================
   10. EXTRATOR DE CORES DE IMAGEM
============================================= */

/** Armazena a imagem carregada para re-extração ao mudar o slider. */
let loadedImageData = null;

/**
 * handleImageUpload — Carrega a imagem no canvas e
 * extrai as cores dominantes via amostragem de pixels.
 * @param {Event} event — evento do input[type="file"]
 */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return; // Aceita só imagens

  const reader = new FileReader(); // API nativa para ler arquivos locais

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Mostra preview da imagem
      const preview = document.getElementById('img-preview');
      preview.src = e.target.result;
      preview.style.display = 'block';

      // Desenha a imagem no canvas oculto
      // O canvas permite acessar os pixels individuais via getImageData()
      const canvas = document.getElementById('color-canvas');
      const ctx    = canvas.getContext('2d');

      // Redimensiona o canvas para igualar a imagem (ou limitar a 200px)
      const maxDim = 200;
      const scale  = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Obtém os dados de pixel: array de [R,G,B,A, R,G,B,A, ...]
      loadedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      extractColors(); // Processa os pixels
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file); // Lê o arquivo como Data URL
}

/**
 * reExtractColors — Chamada ao mudar o slider de quantidade.
 * Só re-extrai se já houver uma imagem carregada.
 */
function reExtractColors() {
  if (loadedImageData) extractColors();
}

/**
 * extractColors — Amostra os pixels e agrupa por cores próximas
 * usando quantização simples (divisão do espaço de cores).
 */
function extractColors() {
  if (!loadedImageData) return;

  const numColors = parseInt(document.getElementById('num-colors').value);
  const data = loadedImageData.data; // Array plano de RGBA

  // Coleta amostras de pixel (a cada 4 pixels para performance)
  const pixels = [];
  for (let i = 0; i < data.length; i += 4 * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue; // Ignora pixels transparentes
    pixels.push([r, g, b]);
  }

  // Quantização por mediana (simplificada):
  // Agrupa pixels em buckets dividindo o canal de maior variação
  const dominantColors = medianCut(pixels, numColors);

  // Converte os clusters para HEX
  const hexColors = dominantColors.map(([r, g, b]) => {
    const toHex = n => Math.round(n).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  });

  // Renderiza os swatches de cores extraídas
  const container = document.getElementById('extracted-colors');
  container.innerHTML = hexColors.map((hex, i) => `
    <div class="extracted-color" role="listitem"
      onclick="navigator.clipboard.writeText('${hex}').then(showToast)"
      title="Clique para copiar ${hex}"
      aria-label="Cor ${i + 1}: ${hex}">
      <div class="color-dot" style="background:${hex};"></div>
      <span class="color-hex">${hex.toUpperCase()}</span>
    </div>
  `).join('');

  // Gera e exibe o código CSS das variáveis extraídas
  const cssCode = ':root {\n' +
    hexColors.map((hex, i) => `  --img-color-${i + 1}: ${hex};`).join('\n') +
    '\n}';

  document.getElementById('extracted-code').textContent = cssCode;
  document.getElementById('extracted-code-block').style.display = 'block';
}

/**
 * medianCut — Algoritmo de quantização de cores por corte mediano.
 * Divide recursivamente o espaço de cores para encontrar N clusters.
 * @param {number[][]} pixels — array de [r, g, b]
 * @param {number} n — número de cores desejadas
 * @returns {number[][]} array de cores representativas
 */
function medianCut(pixels, n) {
  if (pixels.length === 0) return [];
  if (n <= 1 || pixels.length <= 1) {
    // Calcula a média das cores do bucket como representante
    const avg = [0, 0, 0];
    pixels.forEach(p => { avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2]; });
    return [avg.map(v => v / pixels.length)];
  }

  // Encontra o canal com maior variação (amplitude)
  const channels = [0, 1, 2].map(c => {
    const vals = pixels.map(p => p[c]);
    return Math.max(...vals) - Math.min(...vals);
  });
  const maxChannel = channels.indexOf(Math.max(...channels));

  // Ordena os pixels pelo canal de maior variação
  pixels.sort((a, b) => a[maxChannel] - b[maxChannel]);

  // Divide ao meio e processa recursivamente
  const mid = Math.floor(pixels.length / 2);
  return [
    ...medianCut(pixels.slice(0, mid), Math.floor(n / 2)),
    ...medianCut(pixels.slice(mid), Math.ceil(n / 2))
  ];
}

/* =============================================
   DRAG & DROP na Dropzone
============================================= */

const dropzone = document.getElementById('dropzone');

// Destaca a área ao arrastar um arquivo sobre ela
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();       // Necessário para permitir o drop
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0]; // Pega o primeiro arquivo dropado
  if (file && file.type.startsWith('image/')) {
    // Simula o evento change do input de arquivo
    handleImageUpload({ target: { files: [file] } });
  }
});

/* =============================================
   INICIALIZAÇÃO
   Chama todos os geradores ao carregar a página
   para que os previews e códigos já apareçam.
============================================= */
window.addEventListener('DOMContentLoaded', () => {
  updateBox();
  updateText();
  updateGradient();
  updateAnimation();
  updateShadow();
  updateTransform();
  updateFilter();
  updateVars();
  updatePalette();
});
