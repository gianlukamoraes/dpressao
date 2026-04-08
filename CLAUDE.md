# dPressão — Guia para Claude

## Projeto

App React Native de monitoramento de pressão arterial. Desenvolvido por Gianluka, publicação pendente nas lojas.

**Princípio central:** dados ficam 100% no dispositivo. Nunca sugerir backends, cloud sync ou analytics de usuário sem pedido explícito.

## Stack

- React Native 0.81.5 / Expo SDK 54 / EAS Build
- Navegação: @react-navigation (stack + bottom tabs)
- Armazenamento: AsyncStorage (local only)
- Gráficos: react-native-gifted-charts
- Tema: `src/theme/index.ts` — Azul Ardósia + Verde Saúde

## Estrutura

```
src/
  screens/       # telas do app
  components/    # componentes reutilizáveis
  theme/         # cores, espaçamento, tipografia
  utils/         # helpers (bp classification, etc.)
landing/
  index.html     # landing page estática (single-file)
  og-image.png   # imagem para compartilhamentos sociais
temp/
  landing-mockup/  # mockup de referência (não editar)
docs/
  superpowers/
    plans/       # planos de implementação
    specs/       # specs de design
```

## Workflow

1. Brainstorm com spec antes de qualquer implementação
2. Salvar plano em `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
3. Executar com subagent-driven development
4. Commits semânticos: `feat`, `fix`, `perf`, `chore`, `docs`

## Convenções de commit

```
feat(escopo): descrição curta
fix(escopo): descrição curta
perf(escopo): descrição curta
```

## Landing page

Arquivo: `landing/index.html` — não usar bundler, tudo inline.

**Bug crítico resolvido:** `position:fixed` + `overflow:hidden` + `scrollY > 0` causa clip no Chrome. Solução: manter `scrollY=0` sempre via wheel events com `{passive:false}` + `e.preventDefault()`. Nunca adicionar `overflow:hidden` no `.stage`.

Spline embed URL: `https://my.spline.design/hearthealthhudfuturisticuidesign-93eAnzysBJHcHg87NPt5hzqG/?bg=false`

## Pendências conhecidas

- Links App Store / Google Play nos botões CTA ainda são `href="#"` (app não publicado)
- Domínio `dpressao.app` não configurado (og-image e og:url apontam para lá)
