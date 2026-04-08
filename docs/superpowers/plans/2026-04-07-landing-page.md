# Landing Page dPressão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir uma landing page single-file (`landing/index.html`) pronta para deploy estático, com Spline 3D heart, 5 cenas scroll-driven (wheel), animações Anime.js e canvas espiral.

**Architecture:** Página estática pura — HTML + CSS + JS em um único arquivo sem bundler. O scroll é interceptado por `wheel`/`touch`/`keyboard` events (scrollY fica sempre 0, evitando bug de clipping `position:fixed` no Chrome). A cena ativa é determinada por `wheelFrac` (0–1), que aciona `show(idx)` + handlers de animação por cena. O coração 3D vem de um `<iframe>` Spline embedado em full-screen.

**Tech Stack:** HTML5, CSS3, Vanilla JS ES2020, Anime.js 3.2.2 (CDN), Spline iframe embed, Canvas 2D API

---

## Estrutura de Arquivos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `landing/index.html` | Página completa (único artefato de entrega) |
| `temp/landing-mockup/index.html` | Mockup de referência — **não editar, só ler** |

---

## Task 1: Criar estrutura base da pasta `landing/`

**Files:**
- Create: `landing/index.html`

- [ ] **Step 1: Criar pasta e arquivo**

```bash
mkdir -p landing
```

Criar `landing/index.html` com o boilerplate mínimo:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="Monitore sua pressão arterial de forma simples e segura, com privacidade total."/>
  <title>dPressão — Monitore seu coração</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
</head>
<body>
  <!-- conteúdo virá nos tasks seguintes -->
</body>
</html>
```

- [ ] **Step 2: Verificar que o arquivo abre no browser sem erros**

Abrir `landing/index.html` no Chrome. Console deve estar limpo (sem erros de rede para Anime.js).

- [ ] **Step 3: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): scaffold pasta landing com boilerplate"
```

---

## Task 2: CSS — Reset, stage e layout base

**Files:**
- Modify: `landing/index.html` — bloco `<style>` no `<head>`

O CSS deve ser inserido dentro de `<style>` no `<head>`. Copiar exatamente do mockup (`temp/landing-mockup/index.html` linhas 8–152) sem alterações, pois já está debugado e funcional.

- [ ] **Step 1: Copiar o bloco `<style>` do mockup**

Ler `temp/landing-mockup/index.html` e copiar o conteúdo inteiro do `<style>` para `landing/index.html`. O CSS inclui:
- Reset `*,*::before,*::after`
- `.stage` — `position:fixed`, sem `overflow:hidden`
- `#splineWrapper` — `overflow:hidden` isolado
- `#splineHeart` — iframe 190%×190% deslocado para centralizar o coração
- `#heartOuter` / `#heartInner` — animação CSS `hb` (heartbeat)
- `.sc` — cenas absolutas, `opacity:0; visibility:hidden` por padrão
- Estilos de cada cena (`.h-name`, `.tag`, `.bpn`, `.ecg-svg`, `.btn`, etc.)
- Chrome UI: `#prog`, `#dnav`, `#hint`
- Grain noise via `body::after`

- [ ] **Step 2: Verificar no browser**

Abrir `landing/index.html`. Fundo deve ser `#050508` (preto azulado). Sem scrollbar visível.

- [ ] **Step 3: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): CSS base — stage, cenas, chrome UI"
```

---

## Task 3: HTML — Estrutura do stage e 5 cenas

**Files:**
- Modify: `landing/index.html` — `<body>`

Copiar o HTML do `<body>` do mockup (`temp/landing-mockup/index.html` linhas 154–322), que inclui:

```
#prog          — barra de progresso (2px topo)
#dnav          — dots de navegação (5 dots, lado direito)
.stage         — container fixo (sem .track wrapper)
  #splineWrapper > iframe#splineHeart
  canvas#cv
  #veins > svg (12 paths .vp)
  #heartOuter > #heartInner > svg#heartFallback
  #s0 — cena hero: #hname + #hsub
  #s1 — cena tagline: #tag1
  #s2 — cena BP: #bpS / #bpD / #bpOk
  #s3 — cena ECG: #ecgP + #priv
  #s4 — cena CTA: .cta-pre + .cta-ttl + .btns (#b1 iOS, #b2 Android)
  #hint         — seta "scroll"
```

- [ ] **Step 1: Inserir o HTML do body**

Copiar o HTML do mockup. O `<body>` deve começar diretamente com `<div id="prog">` — sem `.track` wrapper.

- [ ] **Step 2: Verificar estrutura no DevTools**

Inspecionar no Chrome. O `.stage` deve ser filho direto de `<body>`. As 5 `div.sc` devem existir com `id` s0–s4.

- [ ] **Step 3: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): HTML — stage e 5 cenas (s0-s4)"
```

---

## Task 4: JS — Canvas espiral + sistema de cenas

**Files:**
- Modify: `landing/index.html` — bloco `<script>` antes de `</body>`

Copiar o bloco `<script>` completo do mockup (`temp/landing-mockup/index.html` linhas 324–564). O script contém três seções:

### Seção 1 — Canvas espiral (linhas 325–414)
```js
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
// ... resize, drawFrame com requestAnimationFrame
```
Parâmetros: `tProg` (target progress 0–1), `cProg` (current, lerp 5%), `tRot`, `cRot`.

### Seção 2 — Sistema de cenas (linhas 416–503)
```js
const SCS   = [0,1,2,3,4].map(i => document.getElementById('s'+i));
const DOTS  = document.querySelectorAll('.dd');
const PROG  = document.getElementById('prog');
// ...
function show(idx) { /* fade in/out com anime.js */ }
function spinIn(sel, delay) { /* entrada espiral */ }
const handlers = { 0(){...}, 1(){...}, 2(){...}, 3(){...}, 4(){...} };
```

### Seção 3 — Wheel-based fake scroll (linhas 504–563)
```js
let wheelFrac = 0;
const SCENES = 5;
const WHEEL_SENSITIVITY = 0.0003;

function applyFrac(frac) {
  wheelFrac = Math.min(1, Math.max(0, frac));
  PROG.style.width = (wheelFrac * 100) + '%';
  const idx = Math.min(Math.floor(wheelFrac * SCENES), SCENES - 1);
  if (idx !== cur) { cur = idx; show(idx); handlers[idx]?.(); }
}

window.addEventListener('wheel',     e => { e.preventDefault(); applyFrac(wheelFrac + e.deltaY * WHEEL_SENSITIVITY); }, {passive:false});
window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, {passive:true});
window.addEventListener('touchmove',  e => { e.preventDefault(); const dy = touchStartY - e.touches[0].clientY; touchStartY = e.touches[0].clientY; applyFrac(wheelFrac + dy * WHEEL_SENSITIVITY * 3); }, {passive:false});
window.addEventListener('keydown', e => {
  const step = 1 / (SCENES - 1);
  if (['ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); applyFrac(wheelFrac + step); }
  else if (['ArrowUp','PageUp'].includes(e.key))    { e.preventDefault(); applyFrac(wheelFrac - step); }
});
```

Init:
```js
window.scrollTo({top:0, behavior:'instant'});
cur = 0; show(0); handlers[0]();
window._show = i => applyFrac(i / (SCENES - 1));
window._go   = applyFrac;
```

- [ ] **Step 1: Copiar o bloco `<script>` do mockup**

Inserir o `<script>` completo antes de `</body>`.

- [ ] **Step 2: Smoke test básico no browser**

Abrir `landing/index.html`. Verificar:
- Cena 0 ("dPressão") visível imediatamente, sem piscar
- Espiral vermelha animando no canvas
- `window._show(1)` no console → cena 1 aparece, dots atualizam
- `window._show(0)` → volta para cena 0

- [ ] **Step 3: Teste das 5 cenas via teclado**

Pressionar `Space` ou `↓` 4 vezes para avançar cena a cena. Verificar:
- Cena 1: veias animam, tagline entra com spinIn
- Cena 2: números 120/80 contam de 0, "● Normal" aparece
- Cena 3: traçado ECG desenha, texto privacidade aparece
- Cena 4: botões App Store / Google Play entram com bounce
- Barra de progresso #prog avança de 0% a 100%

- [ ] **Step 4: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): JS — canvas espiral, cenas, wheel scroll"
```

---

## Task 5: Links de loja — App Store e Google Play

**Files:**
- Modify: `landing/index.html` — botões `#b1` e `#b2` na cena S4

Os botões têm `href="#"` no mockup. Atualizar com os links reais quando disponíveis.

- [ ] **Step 1: Verificar links disponíveis**

Checar se o app já foi publicado. Se sim, substituir `href="#"` pelos URLs:

```html
<!-- iOS -->
<a href="https://apps.apple.com/app/dpressao/idXXXXXXXXX" class="btn ios" id="b1" target="_blank" rel="noopener">

<!-- Android -->
<a href="https://play.google.com/store/apps/details?id=com.gianlukamoraes.dpressao" class="btn and" id="b2" target="_blank" rel="noopener">
```

Se ainda não publicado, manter `href="#"` e adicionar `pointer-events:none; opacity:0.5` ao `.btn` temporariamente (opcional).

- [ ] **Step 2: Verificar abertura dos links**

Clicar nos botões na cena 4. Devem abrir em nova aba (ou mostrar "em breve" se ainda não publicado).

- [ ] **Step 3: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): links reais App Store / Google Play na CTA"
```

---

## Task 6: SEO, Open Graph e metadados

**Files:**
- Modify: `landing/index.html` — `<head>`

- [ ] **Step 1: Adicionar metadados no `<head>`**

Inserir após o `<meta name="description">` existente:

```html
<!-- Open Graph -->
<meta property="og:type"        content="website"/>
<meta property="og:title"       content="dPressão — Monitore seu coração"/>
<meta property="og:description" content="Monitore sua pressão arterial de forma simples e segura, com privacidade total."/>
<meta property="og:image"       content="https://DOMINIO/og-image.png"/>
<meta property="og:url"         content="https://DOMINIO/"/>

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image"/>
<meta name="twitter:title"       content="dPressão — Monitore seu coração"/>
<meta name="twitter:description" content="Monitore sua pressão arterial de forma simples e segura, com privacidade total."/>
<meta name="twitter:image"       content="https://DOMINIO/og-image.png"/>

<!-- Favicon -->
<link rel="icon" type="image/png" href="../assets/icon.png"/>
```

Substituir `DOMINIO` pelo domínio real quando definido.

- [ ] **Step 2: Verificar no DevTools > Application > Manifest**

Confirmar que favicon carrega. Open Graph pode ser testado com og:debugger do Facebook quando houver domínio.

- [ ] **Step 3: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): SEO — Open Graph, Twitter Card, favicon"
```

---

## Task 7: Responsividade mobile

**Files:**
- Modify: `landing/index.html` — bloco `<style>`

O CSS base usa `clamp()` para fontes e `min()` para larguras — já é responsivo em grande parte. Mas em telas < 390px há dois pontos críticos:

- [ ] **Step 1: Testar no Chrome DevTools com iPhone SE (375×667)**

Ativar DevTools > Toggle Device Toolbar. Verificar:
- Cena 0: nome "dPressão" não corta
- Cena 2: números BP não transbordam (`.bpn` tem `clamp(88px,15vw,168px)`)
- Cena 4: botões ficam em coluna (`.btns { flex-wrap:wrap }` já existe)
- O Spline iframe é visível e não corta o coração

- [ ] **Step 2: Ajustar se necessário**

Se os números BP transbordam em < 375px, adicionar ao `<style>`:

```css
@media (max-width: 390px) {
  .bpn { font-size: clamp(72px, 18vw, 88px); }
  .sep { font-size: clamp(36px, 9vw, 44px); }
  .cta-ttl { font-size: clamp(28px, 8vw, 36px); }
}
```

Se o `#splineHeart` cortar o coração em portrait mobile, ajustar:

```css
@media (max-width: 480px) {
  #splineHeart {
    width: 220%;
    height: 220%;
    top: -55%;
    left: -40%;
  }
}
```

- [ ] **Step 3: Verificar touchmove no DevTools**

Com Device Toolbar ativo, fazer swipe para cima/baixo. As cenas devem avançar/retroceder.

- [ ] **Step 4: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): responsividade mobile — ajustes BP e Spline"
```

---

## Task 8: Performance — lazy Spline + `preconnect`

**Files:**
- Modify: `landing/index.html` — `<head>` e `#splineWrapper`

- [ ] **Step 1: Adicionar `preconnect` para CDNs no `<head>`**

```html
<link rel="preconnect" href="https://cdnjs.cloudflare.com"/>
<link rel="preconnect" href="https://my.spline.design"/>
<link rel="dns-prefetch" href="https://prod.spline.design"/>
```

- [ ] **Step 2: Lazy-load do iframe Spline**

O iframe Spline é pesado (~2MB). Carregar só depois que a página está visível:

Substituir o `<iframe>` estático por um placeholder e injetar via JS:

```html
<!-- no HTML: placeholder vazio -->
<div id="splineWrapper">
  <div id="splinePlaceholder" style="position:absolute;inset:0;background:radial-gradient(ellipse at 45% 45%,#1a0505 0%,#050508 70%)"></div>
</div>
```

No script, após `show(0)`:

```js
// Lazy-load Spline após 800ms (não bloqueia LCP)
setTimeout(() => {
  const wrapper = document.getElementById('splineWrapper');
  const ph = document.getElementById('splinePlaceholder');
  const iframe = document.createElement('iframe');
  iframe.id = 'splineHeart';
  iframe.src = 'https://my.spline.design/hearthealthhudfuturisticuidesign-93eAnzysBJHcHg87NPt5hzqG/?bg=false';
  iframe.frameBorder = '0';
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'position:absolute;width:190%;height:190%;top:-45%;left:-25%;border:none;pointer-events:none;z-index:0;opacity:0;';
  iframe.onload = () => {
    iframe.style.transition = 'opacity 1.2s ease';
    iframe.style.opacity = '0.92';
    ph.remove();
  };
  wrapper.appendChild(iframe);
}, 800);
```

- [ ] **Step 3: Testar transição**

Recarregar a página. O placeholder escuro deve aparecer primeiro, depois o Spline faz fade-in suavemente. A cena 0 ("dPressão") deve ser visível durante todo o processo.

- [ ] **Step 4: Commit**

```bash
git add landing/index.html
git commit -m "perf(landing): lazy-load Spline iframe + preconnect CDNs"
```

---

## Task 9: Fallback SVG se Spline falhar

**Files:**
- Modify: `landing/index.html` — script

O `#heartOuter` com o SVG fallback já existe no HTML mas está `display:none`. Ativar se o Spline não carregar em 8s:

- [ ] **Step 1: Adicionar timeout de fallback no lazy-load**

Dentro do `setTimeout(() => { ... }, 800)` do Task 8, após criar o iframe:

```js
const fallbackTimer = setTimeout(() => {
  // Spline demorou demais — mostrar SVG fallback
  document.getElementById('heartOuter').style.display = 'block';
  ph.style.display = 'none';
}, 8000);

iframe.onload = () => {
  clearTimeout(fallbackTimer);
  iframe.style.transition = 'opacity 1.2s ease';
  iframe.style.opacity = '0.92';
  ph.remove();
};
```

- [ ] **Step 2: Testar fallback**

No DevTools > Network, throttle para "Offline" e recarregar. Após ~8s o SVG do coração deve aparecer pulsando.

- [ ] **Step 3: Commit**

```bash
git add landing/index.html
git commit -m "feat(landing): fallback SVG coração se Spline falhar em 8s"
```

---

## Task 10: Review final e limpeza

**Files:**
- Modify: `landing/index.html`

- [ ] **Step 1: Remover código de debug**

Verificar se `window._show` e `window._go` devem ficar (úteis para QA) ou ser removidos em prod. Decisão: manter comentados:

```js
// debug: window._show(i), window._go(frac)
// window._show = i => applyFrac(i / (SCENES - 1));
// window._go   = applyFrac;
```

- [ ] **Step 2: Validar HTML no W3C Validator**

Acessar `validator.w3.org` e colar o HTML. Corrigir warnings críticos (erros de atributos, elementos mal fechados).

- [ ] **Step 3: Lighthouse audit**

DevTools > Lighthouse > Mobile. Verificar:
- Performance > 70 (o Spline é pesado, lazy-load já ajuda)
- Accessibility > 80 (adicionar `aria-label` nos botões se necessário)
- SEO > 90

Se acessibilidade < 80, adicionar aos botões:
```html
<a ... aria-label="Baixar dPressão na App Store">
<a ... aria-label="Baixar dPressão no Google Play">
```

E ao `#hint`:
```html
<div id="hint" aria-hidden="true">
```

- [ ] **Step 4: Commit final**

```bash
git add landing/index.html
git commit -m "chore(landing): limpeza debug, acessibilidade, pronto para deploy"
```

---

## Notas Técnicas Importantes

### Bug crítico resolvido: position:fixed + scroll no Chrome
Quando `scrollY > 0`, o Chrome falha em renderizar conteúdo dentro de `position:fixed` — só os últimos ~60px ficam visíveis. A solução é **nunca deixar a página scrollar**: `wheel`/`touchmove` com `preventDefault()` mantém `scrollY = 0` para sempre. O estado de progresso vive em `wheelFrac` (0–1).

### Spline URL
O iframe aponta para a cena publicada em:
```
https://my.spline.design/hearthealthhudfuturisticuidesign-93eAnzysBJHcHg87NPt5hzqG/?bg=false
```
O parâmetro `?bg=false` tenta ocultar o fundo do Spline (nem sempre funciona dependendo da cena). O fundo padrão da cena HUD é escuro, compatível com `#050508`.

### Sensibilidade do scroll
`WHEEL_SENSITIVITY = 0.0003` significa que ~3333 unidades de `deltaY` percorrem 100% das cenas. Em trackpads Mac isso é ~1 swipe completo por cena. Ajustar se necessário.

### `anime.remove(el)` antes de `anime({targets:el})`
O `show()` chama `anime.remove(el)` para cancelar qualquer animação em andamento antes de iniciar nova. Isso evita que uma cena que não terminou de sair interfira na que está entrando.

### Sensitividade touch
`touchmove` usa `WHEEL_SENSITIVITY * 3` para compensar que `dy` em pixels é menor que `deltaY` de wheel.
