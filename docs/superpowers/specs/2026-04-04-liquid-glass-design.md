# Design: Sistema de Temas — Visual Clássico e Liquid Glass

**Data:** 2026-04-04  
**Status:** Aprovado

---

## Contexto

O dPressão usa um design estático com tema claro (azul-ardósia). O objetivo é adicionar um segundo tema visual chamado "Visual Liquid Glass" — inspirado no design language iOS 26 da Apple — com fundo escuro carmim, superfícies translúcidas e reflexo de luz nos cards. O usuário escolhe o tema em Ajustes. O tema clássico permanece intacto como opção padrão.

---

## Abordagem

Theme Context: um `ThemeContext` envolve o app inteiro. Componentes substituem `import { colors } from '../theme'` por `const { colors } = useTheme()`. A preferência é salva em `AppSettings.theme` via AsyncStorage.

---

## Tokens Visuais — Liquid Glass (`src/theme/liquidGlass.ts`)

### Fundo e superfícies

| Token | Valor | Uso |
|---|---|---|
| `background` | `#1C0A0A` | Base de todas as telas |
| `haloColor` | `rgba(220,38,38,0.35)` | Halo radial vermelho (top-right) |
| `surface` | `rgba(255,255,255,0.10)` | Cards, modais, tab bar |
| `surfaceLight` | `rgba(255,255,255,0.06)` | Chips, linhas secundárias |
| `border` | `rgba(255,255,255,0.20)` | Bordas de todos os elementos |
| `glassHighlight` | `rgba(255,255,255,0.20)` | inset shadow no topo (reflexo de luz) |
| `overlay` | `rgba(0,0,0,0.6)` | Overlays de modal |

### Texto

| Token | Valor |
|---|---|
| `text` | `#FFFFFF` |
| `textSecondary` | `rgba(255,255,255,0.65)` |
| `textMuted` | `rgba(255,255,255,0.40)` |

### Status médico (inalterados em ambos os temas)

| Token | Valor |
|---|---|
| `normal` | `#22C55E` |
| `elevated` | `#EAB308` |
| `hypertension1` | `#F97316` |
| `hypertension2` | `#DC2626` |
| `crisis` | `#991B1B` |
| `normalBg` | `rgba(34,197,94,0.15)` |
| `elevatedBg` | `rgba(234,179,8,0.15)` |
| `hypertension1Bg` | `rgba(249,115,22,0.15)` |
| `hypertension2Bg` | `rgba(220,38,38,0.15)` |
| `crisisBg` | `rgba(153,27,27,0.15)` |

### Outros tokens (idênticos ao clássico)

`primary`, `primaryLight`, `primaryDark`, `danger`, `accent`, `spacing.*`, `borderRadius.*`, `fontSize.*` — sem alteração entre temas.

### Navegação no tema Liquid Glass

- **Tab bar:** `backgroundColor: rgba(255,255,255,0.08)`, `borderTopColor: rgba(255,255,255,0.15)`, `borderTopWidth: 1`
- **Stack header:** `backgroundColor: #1C0A0A`, títulos e ícones brancos
- **StatusBar:** `barStyle: 'light-content'` sempre

---

## Arquitetura

### `src/contexts/ThemeContext.tsx` (novo)

```typescript
type AppTheme = 'classic' | 'liquidGlass';

interface ThemeContextValue {
  theme: AppTheme;
  isLiquidGlass: boolean;
  colors: typeof classicColors;  // mesmo shape em ambos os temas
  setTheme: (theme: AppTheme) => Promise<void>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element
export function useTheme(): ThemeContextValue
```

- Carrega `settings.theme` do AsyncStorage via `getSettings()` na inicialização
- `setTheme` chama `updateSettings({ theme })` e atualiza o estado
- `colors` retorna `classicColors` ou `liquidGlassColors` conforme o tema ativo

### `src/theme/liquidGlass.ts` (novo)

Exporta `liquidGlassColors` — objeto com o mesmo shape de `classicColors` de `src/theme/index.ts`, preenchido com os tokens da tabela acima.

### `src/components/GlassBackground.tsx` (novo)

Container de tela. Uso:
```tsx
<GlassBackground>
  <ScrollView>...</ScrollView>
</GlassBackground>
```

- Tema clássico: `View` com `flex: 1, backgroundColor: colors.background`
- Tema Liquid Glass: `View` com `#1C0A0A` + `View` absoluto circular (`width: 300, height: 300, borderRadius: 150, backgroundColor: rgba(220,38,38,0.35)`) posicionado em `top: -80, right: -80`

### `src/components/GlassView.tsx` (novo)

Drop-in para cards e superfícies elevadas. Uso:
```tsx
<GlassView style={styles.card}>...</GlassView>
```

- Tema clássico: `View` com `backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border`
- Tema Liquid Glass: `View` com `backgroundColor: rgba(255,255,255,0.10)`, `borderWidth: 1`, `borderColor: rgba(255,255,255,0.20)`, `shadowColor: '#FFFFFF'`, `shadowOpacity: 0.20`, `shadowOffset: {width:0,height:-1}`, `shadowRadius: 0` (reflexo no topo simulando specular highlight)

### `src/types/index.ts` (modificar)

Adicionar ao `AppSettings`:
```typescript
theme?: 'classic' | 'liquidGlass';  // default 'classic'
```

### `src/storage/settings.ts` (verificar)

Confirmar que `getSettings()` retorna `theme` e que `updateSettings()` persiste o campo. Se `theme` for `undefined` (install antigo), tratar como `'classic'`.

### `App.tsx` (modificar)

Envolver o Navigator com `<ThemeProvider>`. Passar `screenOptions` dinâmicos baseados no tema para `Tab.Navigator` e `Stack.Navigator`.

### `src/screens/SettingsScreen.tsx` (modificar)

Nova seção "🎨 Aparência" antes da seção de Perfil:
- Dois chips horizontais: "Visual Clássico" e "Visual Liquid Glass"
- Chip ativo: borda + fundo na cor `colors.primary`
- Troca imediata sem reload

---

## Migração dos Componentes Existentes

### Padrão de migração

Cada arquivo que importa `colors` de `'../theme'` (ou `'../../theme'`):

1. Remover `import { colors } from '../theme'`
2. Adicionar `const { colors } = useTheme()` dentro do componente
3. Mover valores de cor de `StyleSheet.create` para inline styles

```typescript
// Antes (module level):
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border }
})

// Depois:
// StyleSheet.create mantém apenas layout/spacing/borderRadius:
const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.md, borderWidth: 1 }
})
// Cores ficam inline:
<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
```

### Arquivos a migrar (15 arquivos)

**Componentes:**
- `src/components/BPBadge.tsx`
- `src/components/BPLineChart.tsx`
- `src/components/ReadingCard.tsx`
- `src/components/MedicalDisclaimer.tsx`
- `src/components/AnimatedCard.tsx`
- `src/components/LoadingSkeleton.tsx`
- `src/components/SwipeableCard.tsx`

**Telas:**
- `src/screens/HomeScreen.tsx`
- `src/screens/TrendScreen.tsx`
- `src/screens/HistoryScreen.tsx`
- `src/screens/NewReadingScreen.tsx`
- `src/screens/ReadingDetailScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `src/screens/AboutScreen.tsx`

`DisclaimerScreen.tsx` e `PrivacyPolicyScreen.tsx` também migram pelo mesmo padrão.

---

## Arquivos Modificados/Criados

| Arquivo | Ação |
|---|---|
| `src/theme/liquidGlass.ts` | Criar — tokens do tema LG |
| `src/contexts/ThemeContext.tsx` | Criar — context, provider, hook |
| `src/components/GlassBackground.tsx` | Criar — container de tela |
| `src/components/GlassView.tsx` | Criar — card de vidro |
| `src/types/index.ts` | Modificar — `theme` em AppSettings |
| `App.tsx` | Modificar — ThemeProvider + screenOptions dinâmicos |
| `src/screens/SettingsScreen.tsx` | Modificar — seletor de tema |
| 15 componentes/telas | Modificar — migração de cores para useTheme() |

---

## Verificação

1. Abrir app — tema padrão é "Visual Clássico", visual idêntico ao atual
2. Ir em Ajustes → Aparência → selecionar "Visual Liquid Glass"
3. Todas as telas mudam para fundo carmim + glass imediatamente
4. Fechar e reabrir o app — tema persiste
5. Voltar para "Visual Clássico" — app retorna ao visual original sem rastros do LG
6. Verificar tab bar e header em ambos os temas
7. Verificar que badges de status (Normal/Hipertensão/Crise) mantêm as cores médicas em ambos os temas
