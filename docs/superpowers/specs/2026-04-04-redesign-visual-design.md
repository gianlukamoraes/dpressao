# dPressão — Spec de Redesign Visual

**Data:** 2026-04-04  
**Status:** Aprovado  
**Escopo:** Design system + correções de UX/bugs em todas as telas

---

## 1. Contexto

O app dPressão tinha um design "Brutalist Medical + Warmth" com fundo off-white e bordas pretas pesadas. Após brainstorming com o usuário, decidiu-se migrar para uma paleta **Azul Ardósia** com bordas suaves, botão principal verde, e correções de classificação seguindo as diretrizes brasileiras (SBC 2020).

---

## 2. Design Tokens (novo sistema)

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#EEF2F7` | Fundo de todas as telas |
| `surface` | `#F8FAFC` | Cards, inputs, modais |
| `surfaceLight` | `#F1F5F9` | Superfície levemente mais escura |
| `border` | `#E2E8F0` | Bordas (substituiu preto `#000000`) |
| `text` | `#0F172A` | Texto principal |
| `textSecondary` | `#64748B` | Texto secundário |
| `textMuted` | `#94A3B8` | Labels, metadados |
| `primary` | `#16A34A` | Botão de ação principal (verde saúde) |
| `danger` | `#DC3545` | Ações destrutivas exclusivamente (excluir) |
| `shadow` | `0 1px 4px rgba(0,0,0,0.05)` | Cards |
| `shadowPrimary` | `0 3px 10px rgba(22,163,74,0.25)` | Botão primário |

**Cores de status (sem alteração):**

| Status | Cor | Fundo |
|--------|-----|-------|
| Normal | `#22C55E` | `#F0FDF4` |
| Elevada | `#FBBF24` | `#FFFBEB` |
| Hipertensão 1 | `#FB923C` | `#FEF3C7` |
| Hipertensão 2 | `#EF4444` | `#FEE2E2` |
| Crise | `#A855F7` | `#F3E8FF` |

---

## 3. Mudanças de UI

### 3.1 Bordas
- **Antes:** `2-3px solid #000000` em todos os elementos
- **Depois:** `1.5px solid #E2E8F0` + `box-shadow: 0 1px 4px rgba(0,0,0,0.05)`
- Cards de classificação (última medição, badges): mantêm borda colorida do status, mas mais fina (`2px`)
- Border radius: aumentar de 4-6px para 8-12px (menos brutalist, mais iOS)

### 3.2 Botão principal
- **Antes:** `#DC3545` (vermelho) para "Nova Medição" e "Salvar"
- **Depois:** `#16A34A` (verde saúde) para todas as ações primárias positivas
- Vermelho `#DC3545` reservado exclusivamente para ações destrutivas (excluir medição, limpar dados)
- Sombra suave no botão: `box-shadow: 0 3px 10px rgba(22,163,74,0.25)`

### 3.3 Badges de classificação
- **Antes:** retangulares com `borderRadius: 6-8px`
- **Depois:** pílula com `borderRadius: 20px` (full pill)

### 3.4 Filtros e seleção ativa
- **Antes:** chip ativo com fundo vermelho
- **Depois:** chip ativo com fundo verde `#16A34A`, texto branco

### 3.5 Tabela de Referência (HomeScreen)
- Aumentar `paddingHorizontal` das linhas de `spacing.md` para `spacing.lg`
- Manter dots coloridos por categoria (já implementado)

### 3.6 Card "Última Medição" (HomeScreen)
- Row de estatísticas embaixo mostra **apenas pulso** (`💓 72 bpm`) — sem repetir sistólica/diastólica
- Layout: ícone + valor + unidade centralizados horizontalmente

---

## 4. Mudanças de UX

### 4.1 Classificação BP — migração para SBC 2020

**Antes (AHA 2017):**
```
Normal:         < 120 / < 80
Elevated:       120–129 / < 80
Hypertension 1: 130–139 OU diastólica 80–89  ← bug: 120/80 vira Hiper 1
Hypertension 2: ≥ 140 OU ≥ 90
Crisis:         > 180 OU > 120
```

**Depois (SBC 2020):**
```
Ótima:        < 120 / < 80       → label "Normal", cor verde
Normal:       120–129 / 80–84    → label "Normal", cor verde
Limítrofe:    130–139 / 85–89    → label "Elevada", cor âmbar
Hipertensão 1: 140–159 / 90–99  → label "Hipertensão Estágio 1", cor laranja
Hipertensão 2: 160–179 / 100–109 → label "Hipertensão Estágio 2", cor vermelha
Hipertensão 3: ≥ 180 / ≥ 110    → label "Crise Hipertensiva", cor roxa
```

> **Impacto direto:** 120/80 passa a ser classificado como "Normal" (verde) em vez de "Hipertensão 1" (laranja).

---

## 5. Correções de bugs

### 5.1 Singular/plural em "medições"
- **Local:** `HistoryScreen.tsx` — card de resumo
- **Fix:** `${count} ${count === 1 ? 'medição' : 'medições'}`

### 5.2 Overflow no card de resumo (HistoryScreen)
- O valor `avgSystolic/avgDiastolic` pode quebrar se longo
- Já tem `adjustsFontSizeToFit` + `numberOfLines={1}` — garantir que `width: '100%'` está aplicado

### 5.3 Quebra de texto em valores de PA
- Já corrigido em sessão anterior com `adjustsFontSizeToFit` + `numberOfLines={1}` em `HomeScreen`, `HistoryScreen` e `ReadingCard`

---

## 6. Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/theme/index.ts` | Novos tokens de cor (background, surface, border, primary, shadow) |
| `src/utils/bloodPressure.ts` | Lógica de classificação → SBC 2020 |
| `src/screens/HomeScreen.tsx` | Bordas, botão verde, card só com pulso, tabela com mais padding |
| `src/screens/HistoryScreen.tsx` | Bordas, filtros verdes, fix singular/plural |
| `src/screens/NewReadingScreen.tsx` | Bordas, botão verde |
| `src/screens/TrendScreen.tsx` | Bordas, filtros de período verdes |
| `src/screens/SettingsScreen.tsx` | Bordas, botão de salvar verde |
| `src/components/ReadingCard.tsx` | Bordas, badges pill |
| `src/components/BPBadge.tsx` | Border radius pill (`borderRadius: 20`) |
| `DESIGN_SYSTEM.md` | Atualizar com nova paleta e princípios |

---

## 7. O que NÃO muda

- Estrutura de navegação e telas
- Fonte (system font, pesos 700/900)
- Cores de status (verde/âmbar/laranja/vermelho/roxo)
- Cards de classificação com fundo colorido por categoria
- Tab bar com Ionicons (já implementado)
- Lógica de dados, storage, exportação

---

## 8. Critérios de aceitação

- [ ] Fundo `#EEF2F7` em todas as telas
- [ ] Zero bordas `#000000` — todas substituídas por `#E2E8F0`
- [ ] Botão "Nova Medição" e "Salvar" em verde `#16A34A`
- [ ] Vermelho usado apenas em ações destrutivas
- [ ] 120/80 classificado como "Normal" (verde)
- [ ] "1 medição" / "2 medições" (singular/plural correto)
- [ ] Badges com border-radius pill em todos os componentes
- [ ] Card home mostra só pulso na row inferior
