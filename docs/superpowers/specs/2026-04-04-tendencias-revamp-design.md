# Design: Revamp da Tela de Tendências

**Data:** 2026-04-04  
**Status:** Aprovado

---

## Contexto

A tela de Tendências atual usa um gráfico SVG customizado com suporte apenas a sistólica e diastólica, sem interatividade. As seções de estatísticas são funcionais mas visualmente fragmentadas. Não há nenhuma camada de interpretação dos dados — o usuário vê números brutos sem contexto.

O objetivo é tornar essa tela útil tanto para acompanhamento pessoal quanto como suporte a consultas médicas, mantendo o escopo simples e polido (sem IA — essa fica reservada para uma versão premium futura).

---

## Abordagem

Página única scrollável em três seções: Gráfico → Insights → Estatísticas.

---

## Seção 1: Gráfico

### Biblioteca
Substituir o `BPLineChart` customizado por **`react-native-gifted-charts`** (LineChart).  
Justificativa: construída sobre `react-native-svg` (já instalado), suporta múltiplas linhas, linha de referência, tooltip ao toque, sem dependências nativas adicionais.

Instalar com: `npx expo install react-native-gifted-charts`

### Dados exibidos
- **Sistólica** — linha vermelha (`colors.hypertension2`)
- **Diastólica** — linha azul (`colors.primary`)
- **Pulso** — linha verde (`colors.normal`)
- **Linha de meta** — tracejada horizontal, visível apenas se `profile.bpGoal` estiver preenchido. Exibe duas linhas: sistólica meta e diastólica meta.

### Controles
- **Toggles de linha**: três botões abaixo do gráfico (SIS / DIA / PULSO). Cada um ativa/desativa a linha correspondente. Estado local, sem persistência.
- **Seletor de período**: 7 dias / 30 dias / 90 dias / Tudo — permanece no topo, igual ao atual.

### Interatividade
- Toque num ponto exibe tooltip com data + valores (sistólica, diastólica, pulso).
- Pontos plotados da esquerda (mais antigo) para direita (mais recente).

### Componente
Criar `src/components/BPLineChart.tsx` (substituir o atual). Aceita:
```typescript
interface BPLineChartProps {
  readings: BloodPressureReading[];
  goalSystolic?: number;
  goalDiastolic?: number;
}
```

---

## Seção 2: Insights Automáticos

Cards exibidos logo abaixo do gráfico, antes das estatísticas. Cada card tem: ícone emoji, título, valor destacado e descrição curta.

**Regra geral:** um insight só é exibido se houver pelo menos 3 medições no período selecionado. Se não houver dados suficientes para um insight específico, ele é omitido silenciosamente.

### A — Tendência vs Período Anterior
- **Lógica:** compara média sistólica do período atual com o período imediatamente anterior de mesmo tamanho. Não exibido quando o período selecionado é "Tudo" (sem período anterior definido).
- **Exibição:** `↓ 8 mmHg` (verde) ou `↑ 5 mmHg` (vermelho) ou `→ Estável` (neutro, delta ≤ 2).
- **Título:** "Tendência Sistólica"

### B — Horário Crítico
- **Lógica:** agrupa medições em 4 turnos — manhã (6h–12h), tarde (12h–18h), noite (18h–24h), madrugada (0h–6h). Calcula média sistólica de cada turno. Destaca o turno com maior média.
- **Exibição:** "Suas medições são mais altas à tarde (média 148 mmHg)"
- **Título:** "Horário de Pico"
- **Requisito mínimo:** ao menos 2 turnos com medições para haver comparação.

### C — Correlação Sintoma
- **Lógica:** para cada sintoma registrado, calcula quantas medições com aquele sintoma tinham sistólica ≥ 130. Exibe o sintoma com maior correlação percentual.
- **Exibição:** "Dor de cabeça ocorreu em 75% das medições acima de 130 mmHg"
- **Título:** "Sintoma Frequente"
- **Requisito mínimo:** ao menos 1 medição com sintoma no período.

### D — Variabilidade
- **Lógica:** `variabilidade = máx(sistólica) − mín(sistólica)` no período.
  - ≤ 20 mmHg → estável (verde)
  - 21–35 mmHg → moderada (amarelo)
  - > 35 mmHg → alta (vermelho)
- **Exibição:** "Variação de 38 mmHg — pressão instável no período"
- **Título:** "Variabilidade"

### E — % Dentro da Meta
- **Lógica:** conta medições onde `sistólica ≤ bpGoal.systolic AND diastólica ≤ bpGoal.diastolic`. Divide pelo total.
- **Exibição:** "73% das medições dentro da meta (130/80)"
- **Título:** "Meta Atingida"
- **Condicional:** só aparece se `profile.bpGoal` estiver preenchido.

### Implementação
Criar `src/utils/insights.ts` com funções puras:
```typescript
export function calcTrendInsight(current: BloodPressureReading[], previous: BloodPressureReading[]): InsightCard | null
export function calcPeakHourInsight(readings: BloodPressureReading[]): InsightCard | null
export function calcSymptomCorrelation(readings: BloodPressureReading[]): InsightCard | null
export function calcVariabilityInsight(readings: BloodPressureReading[]): InsightCard | null
export function calcGoalInsight(readings: BloodPressureReading[], goal: { systolic: number; diastolic: number }): InsightCard | null

export interface InsightCard {
  icon: string;
  title: string;
  value: string;
  description: string;
  status: 'good' | 'warning' | 'alert' | 'neutral';
}
```

Cores por status: `good` → `colors.normal`, `warning` → `colors.elevated`, `alert` → `colors.hypertension2`, `neutral` → `colors.textSecondary`.

---

## Seção 3: Estatísticas do Período

Substituir os três cards separados atuais (Médias, Min/Máx, Distribuição) por um único card unificado "📈 Estatísticas do Período".

### Subseções
1. **Médias** — linha horizontal com três valores: `sistólica/diastólica mmHg` e `pulso bpm`
2. **Intervalo** — sistólica (min→máx) e diastólica (min→máx) em duas linhas
3. **Distribuição** — para cada categoria (Normal, Elevada, Hiper 1, Hiper 2, Crise): barra de progresso proporcional + contagem + percentual. Cor da barra = cor da categoria.

Só exibir esta seção se houver medições no período.

---

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/components/BPLineChart.tsx` | Reescrito com react-native-gifted-charts |
| `src/screens/TrendScreen.tsx` | Integra novo gráfico, toggles, insights e stats unificadas |
| `src/utils/insights.ts` | Novo — funções puras de cálculo de insights |

---

## Verificação

1. Instalar `react-native-gifted-charts` e confirmar que o gráfico renderiza
2. Selecionar cada período e verificar que as 3 linhas atualizam
3. Tocar num ponto do gráfico e ver tooltip com valores
4. Ativar/desativar cada toggle de linha
5. Preencher meta no perfil e verificar linha tracejada no gráfico + insight E
6. Registrar medições com sintomas e verificar insight C
7. Verificar que insights ausentes (poucos dados) não aparecem
8. Verificar distribuição com barras proporcionais
