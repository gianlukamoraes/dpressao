# Redesign Visual — Azul Ardósia + Verde Saúde

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o design do dPressão para paleta Azul Ardósia (#EEF2F7), bordas suaves, botão principal verde (#16A34A), e corrigir classificação de PA pelas diretrizes SBC 2020.

**Architecture:** A maioria das mudanças cascateia automaticamente via tokens em `src/theme/index.ts` (todos os componentes referenciam `colors.primary`, `colors.border`, `colors.background` diretamente). Mudanças manuais pontuais são necessárias em `BPBadge`, `HomeScreen` (card de pulso), `HistoryScreen` (plural) e `bloodPressure.ts` (lógica SBC).

**Tech Stack:** React Native, Expo, TypeScript, StyleSheet

---

## Mapa de arquivos

| Arquivo | O que muda |
|---------|------------|
| `src/theme/index.ts` | Tokens de cor — foundation de tudo |
| `src/utils/bloodPressure.ts` | Lógica de classificação SBC 2020 |
| `src/components/BPBadge.tsx` | Border radius pill |
| `src/components/ReadingCard.tsx` | Sombra suave, shadow no card |
| `src/screens/HomeScreen.tsx` | Card com só pulso, tabela com padding |
| `src/screens/HistoryScreen.tsx` | Singular/plural fix, sombra no summary |
| `DESIGN_SYSTEM.md` | Atualizar documentação |

> `NewReadingScreen`, `TrendScreen`, `SettingsScreen` — atualizam automaticamente via tokens. Nenhuma mudança manual necessária nesses arquivos.

---

## Task 1: Atualizar tokens de cor no tema

**Files:**
- Modify: `src/theme/index.ts`

- [ ] **Substituir o objeto `colors` inteiro:**

```typescript
export const colors = {
  // Ação principal — Verde Saúde
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',

  // Ações destrutivas — Vermelho (apenas excluir/cancelar)
  danger: '#DC3545',
  dangerLight: '#E07080',
  dangerDark: '#A02838',

  // Backgrounds & Surfaces — Azul Ardósia
  background: '#EEF2F7',
  surface: '#F8FAFC',
  surfaceLight: '#F1F5F9',
  border: '#E2E8F0',          // Bordas suaves (substituiu #000000)

  // Text hierarchy
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Accent
  accent: '#C9A961',
  accentLight: '#E8D4B8',

  // Status colors (sem alteração)
  normal: '#22C55E',
  normalBg: '#F0FDF4',
  elevated: '#FBBF24',
  elevatedBg: '#FFFBEB',
  hypertension1: '#FB923C',
  hypertension1Bg: '#FEF3C7',
  hypertension2: '#EF4444',
  hypertension2Bg: '#FEE2E2',
  crisis: '#A855F7',
  crisisBg: '#F3E8FF',

  overlay: 'rgba(0,0,0,0.5)',
};
```

- [ ] **Atualizar `borderRadius` para valores mais iOS-friendly:**

```typescript
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};
```

- [ ] **Atualizar `colorsDark` (mesma lógica, tema escuro):**

```typescript
export const colorsDark = {
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',
  danger: '#DC3545',
  dangerLight: '#E07080',
  dangerDark: '#A02838',
  background: '#0A0F0A',
  surface: '#111814',
  surfaceLight: '#1A2A1A',
  border: '#2A3A2A',
  text: '#F0FDF4',
  textSecondary: '#86EFAC',
  textMuted: '#4ADE80',
  accent: '#C9A961',
  accentLight: '#E8D4B8',
  normal: '#22C55E',
  normalBg: '#0F2912',
  elevated: '#FBBF24',
  elevatedBg: '#1F1A05',
  hypertension1: '#FB923C',
  hypertension1Bg: '#1F1305',
  hypertension2: '#EF4444',
  hypertension2Bg: '#2D0B0B',
  crisis: '#A855F7',
  crisisBg: '#2D1F47',
  overlay: 'rgba(255,255,255,0.5)',
};
```

- [ ] **Commitar:**

```bash
git add src/theme/index.ts
git commit -m "feat: migrar paleta para Azul Ardósia + Verde Saúde"
```

---

## Task 2: Corrigir classificação de PA — SBC 2020

**Files:**
- Modify: `src/utils/bloodPressure.ts`

- [ ] **Substituir a função `classifyBP` inteira:**

```typescript
export function classifyBP(systolic: number, diastolic: number): BPClassification {
  // Crise Hipertensiva: SBC ≥ 180 sistólica OU ≥ 110 diastólica
  if (systolic >= 180 || diastolic >= 110) {
    return {
      category: 'crisis',
      label: 'Crise Hipertensiva',
      color: colors.crisis,
      bgColor: colors.crisisBg,
      emoji: '🚨',
      description: 'Procure atendimento médico imediatamente!',
    };
  }
  // Hipertensão Estágio 2: 160–179 OU 100–109
  if (systolic >= 160 || diastolic >= 100) {
    return {
      category: 'hypertension2',
      label: 'Hipertensão Estágio 2',
      color: colors.hypertension2,
      bgColor: colors.hypertension2Bg,
      emoji: '🔴',
      description: 'Consulte seu médico em breve.',
    };
  }
  // Hipertensão Estágio 1: 140–159 OU 90–99
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'hypertension1',
      label: 'Hipertensão Estágio 1',
      color: colors.hypertension1,
      bgColor: colors.hypertension1Bg,
      emoji: '🟠',
      description: 'Atenção: monitore com frequência.',
    };
  }
  // Limítrofe (SBC): 130–139 OU 85–89
  if (systolic >= 130 || diastolic >= 85) {
    return {
      category: 'elevated',
      label: 'Pressão Elevada',
      color: colors.elevated,
      bgColor: colors.elevatedBg,
      emoji: '🟡',
      description: 'Acima do ideal. Fique atento.',
    };
  }
  // Ótima e Normal (SBC): < 130 E < 85 — inclui 120/80
  return {
    category: 'normal',
    label: 'Normal',
    color: colors.normal,
    bgColor: colors.normalBg,
    emoji: '🟢',
    description: 'Pressão arterial ideal. Continue assim!',
  };
}
```

> **Verificação:** Com esta lógica, 120/80 (sistólica 120 < 130 E diastólica 80 < 85) retorna `normal` (verde). ✓

- [ ] **Commitar:**

```bash
git add src/utils/bloodPressure.ts
git commit -m "fix: classificação BP para diretrizes SBC 2020 (120/80 = Normal)"
```

---

## Task 3: BPBadge — estilo pill

**Files:**
- Modify: `src/components/BPBadge.tsx`

- [ ] **Alterar `borderRadius` do badge base para pill:**

```typescript
// Localizar o estilo `badge` e alterar borderRadius:
badge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: borderRadius.full,   // era borderRadius.lg (8px), agora full (999)
  borderWidth: 1.5,                  // era 2
  gap: spacing.sm,
  alignSelf: 'flex-start',
},
badgeSm: {
  paddingHorizontal: spacing.sm,
  paddingVertical: 4,
  borderWidth: 1,
},
badgeLg: {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderWidth: 2,
},
```

- [ ] **Commitar:**

```bash
git add src/components/BPBadge.tsx
git commit -m "feat: badges de classificação com estilo pill"
```

---

## Task 4: ReadingCard — sombra suave

**Files:**
- Modify: `src/components/ReadingCard.tsx`

- [ ] **Adicionar sombra ao card e ajustar espaçamento:**

```typescript
card: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.md,
  borderWidth: 1.5,
  borderColor: colors.border,
  borderLeftWidth: 5,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.sm,
  overflow: 'hidden',
  // Sombra iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  // Sombra Android
  elevation: 1,
},
```

- [ ] **Commitar:**

```bash
git add src/components/ReadingCard.tsx
git commit -m "feat: sombra suave nos cards de medição"
```

---

## Task 5: HomeScreen — card com só pulso + tabela com padding

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

- [ ] **Substituir o bloco `{/* Stats row */}` dentro do `latestCardContent`:**

```tsx
{/* Só pulso — sem repetir SIS/DIA */}
<View style={styles.pulseRow}>
  <Text style={styles.pulseIcon}>💓</Text>
  <Text style={styles.pulseValue}>{latest.pulse}</Text>
  <Text style={styles.pulseUnit}>bpm</Text>
</View>
```

- [ ] **Remover os estilos antigos de stats e adicionar os novos no `StyleSheet.create`:**

Remover: `latestStats`, `statItem`, `statValue`, `statLabel`, `statDivider`

Adicionar:
```typescript
pulseRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.sm,
  backgroundColor: 'rgba(255,255,255,0.6)',
  borderRadius: borderRadius.sm,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.08)',
  paddingVertical: spacing.sm,
},
pulseIcon: {
  fontSize: fontSize.lg,
},
pulseValue: {
  fontSize: fontSize.xl2,
  fontWeight: '900',
  color: colors.text,
},
pulseUnit: {
  fontSize: fontSize.sm,
  color: colors.textMuted,
  fontWeight: '600',
},
```

- [ ] **Adicionar sombra ao `latestCard`:**

```typescript
latestCard: {
  borderRadius: borderRadius.md,
  borderWidth: 2,
  borderColor: colors.border,
  // Sombra colorida pelo status (aplicada inline via style prop)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
},
```

- [ ] **Aumentar padding horizontal das linhas da tabela de referência:**

```typescript
referenceRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing.sm + 2,
  paddingHorizontal: spacing.lg,  // era spacing.md
  gap: spacing.md,                // era spacing.sm
},
```

- [ ] **Adicionar sombra ao `referenceCard` e aos cards em geral:**

```typescript
referenceCard: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.md,
  borderWidth: 1.5,
  borderColor: colors.border,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 1,
},
```

- [ ] **Commitar:**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: card home com pulso centralizado e tabela com mais espaçamento"
```

---

## Task 6: HistoryScreen — singular/plural + sombra no summary

**Files:**
- Modify: `src/screens/HistoryScreen.tsx`

- [ ] **Corrigir singular/plural no título do summary (linha ~186):**

```tsx
<Text style={styles.summaryTitle}>
  Média dos últimos {Math.min(readings.length, 30)}{' '}
  {Math.min(readings.length, 30) === 1 ? 'registro' : 'registros'}
</Text>
```

- [ ] **Corrigir singular/plural no label de medições (linha ~201):**

```tsx
<Text style={styles.summaryLabel}>
  {readings.length === 1 ? 'medição' : 'medições'}
</Text>
```

- [ ] **Adicionar sombra ao `summaryCard`:**

```typescript
summaryCard: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.md,
  borderWidth: 1.5,
  borderColor: colors.border,
  padding: spacing.lg,
  gap: spacing.md,
  marginBottom: spacing.lg,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 1,
},
```

- [ ] **Corrigir a cor do filtro ativo (usa `colors.primary` — já vira verde com Task 1, mas garantir que o texto ativo seja branco):**

```typescript
filterLabelActive: {
  color: '#FFFFFF',   // era colors.text (preto), agora branco para contrastar com verde
  fontWeight: '900',
},
```

- [ ] **Commitar:**

```bash
git add src/screens/HistoryScreen.tsx
git commit -m "fix: singular/plural em medições e sombra no card de resumo"
```

---

## Task 7: Atualizar DESIGN_SYSTEM.md

**Files:**
- Modify: `DESIGN_SYSTEM.md`

- [ ] **Substituir a seção "Color Palette" para refletir a nova paleta:**

```markdown
## Color Palette

### Backgrounds
- **Primary Background:** `#EEF2F7` (Azul Ardósia)
- **Surface (Cards):** `#F8FAFC` (Quase branco)
- **Surface Light:** `#F1F5F9` (Cinza azulado sutil)

### Text Hierarchy
- **Text (Primary):** `#0F172A` (Azul quase-preto)
- **Text Secondary:** `#64748B` (Slate médio)
- **Text Muted:** `#94A3B8` (Slate claro)

### Ações
- **Primary Action:** `#16A34A` (Verde Saúde — CTAs positivos)
- **Danger Action:** `#DC3545` (Vermelho — exclusivamente destrutivo: excluir, cancelar)
- **Border:** `#E2E8F0` (Cinza suave — substituiu preto #000000)
```

- [ ] **Atualizar a seção "Key Design Principles" — Princípio 2 (Borders):**

```markdown
### 2. **Bordas Suaves**
Cards usam `1.5px solid #E2E8F0` com sombra suave. Cards de status mantêm borda colorida `2px` na cor da classificação.

✓ Do: `borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1`
✗ Don't: `borderWidth: 2, borderColor: '#000000'`
```

- [ ] **Atualizar a seção "Design Tokens":**

```typescript
primary: '#16A34A'        // Verde Saúde — ações CTA
danger: '#DC3545'         // Vermelho — ações destrutivas
text: '#0F172A'           // Azul quase-preto
textSecondary: '#64748B'  // Slate
textMuted: '#94A3B8'      // Slate claro
border: '#E2E8F0'         // Bordas suaves
background: '#EEF2F7'     // Azul Ardósia
surface: '#F8FAFC'        // Cards
```

- [ ] **Commitar:**

```bash
git add DESIGN_SYSTEM.md
git commit -m "docs: atualizar design system para paleta Azul Ardósia"
```

---

## Checklist final

Após todas as tasks, verificar:

- [ ] Fundo `#EEF2F7` em todas as 4 telas principais (Home, Histórico, Tendências, Ajustes)
- [ ] Zero bordas pretas — todas bordas são `#E2E8F0`
- [ ] Botão "Nova Medição" verde (Home, HistoryScreen empty state)
- [ ] Botão "Salvar Medição" verde (NewReadingScreen)
- [ ] Filtros e seleções ativas verdes (History, Trends)
- [ ] Vermelho aparece apenas no swipe de delete e ações destrutivas
- [ ] 120/80 classificado como "Normal" (verde)
- [ ] "1 medição" (singular) / "2 medições" (plural) no Histórico
- [ ] Badges arredondados (pill) em todos os lugares
- [ ] Card home mostra só pulso na row inferior
