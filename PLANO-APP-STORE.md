# dPressao - Do MVP ao Lançamento na App Store

## Contexto
O app dPressao (monitoramento de pressão arterial) está no estado MVP Fase 1: 3 telas (Home, Histórico, Nova Medição), 2 componentes (BPBadge, ReadingCard), armazenamento local via AsyncStorage, e classificação médica em 5 categorias. Para ser lançado na App Store e Google Play, precisa de features essenciais, compliance médico/legal, e configuração de build/submit.

---

## Fase 1: Completar Features Core

### 1A. Tela de Configurações + Nome do Usuário
- **Criar:** `src/screens/SettingsScreen.tsx`, `src/storage/settings.ts`
- **Modificar:** `src/types/index.ts` (adicionar `AppSettings: { userName, reminderEnabled, reminderTime }`), `App.tsx` (nova tab "Ajustes" com emoji ⚙️), `HomeScreen.tsx` (trocar "Gianluka" por `settings.userName`)
- Seções: Perfil (nome), Sobre (versão, disclaimer, privacidade), Dados (exportar, limpar tudo)

### 1B. Tela de Detalhe da Medição
- **Criar:** `src/screens/ReadingDetailScreen.tsx`
- **Modificar:** `App.tsx` (adicionar ao Stack), `ReadingCard.tsx` (navegar no tap), `HomeScreen.tsx` (tap no card principal)
- Conteúdo: valor grande + BPBadge, data/hora, sistólica/diastólica/pulso, nota, botões editar/excluir

### 1C. Editar Medição
- **Modificar:** `NewReadingScreen.tsx` — aceitar `readingId` param opcional, pré-preencher campos, usar `updateReading()` (já existe em `readings.ts` mas nunca é chamado)
- Título muda para "Editar Medição" em modo de edição

### 1D. Tipagem de Navegação
- **Criar:** `src/types/navigation.ts` com `RootStackParamList` e `TabParamList`
- **Modificar:** todas as telas — trocar `useNavigation<any>()` por hooks tipados

**Verificação:** Criar medição → tap para ver detalhe → editar → confirmar que persiste. Mudar nome em Ajustes → verificar saudação na Home.

---

## Fase 2: Gráficos de Tendência

### 2A. Gráfico de Linhas Customizado
- **Dependência:** `react-native-svg` (`npx expo install react-native-svg`)
- **Criar:** `src/components/BPLineChart.tsx` — gráfico SVG leve com linha sistólica (vermelha), diastólica (azul), linhas de referência 120/80

### 2B. Tela de Tendências
- **Criar:** `src/screens/TrendScreen.tsx`
- **Modificar:** `App.tsx` (nova tab "Tendências" com emoji 📊, entre Histórico e Ajustes)
- Seletor de período: 7d, 30d, 90d, Todos
- Estatísticas: média, min, max, contagem
- Distribuição por classificação

**Verificação:** Criar 10+ medições em datas diferentes → abrir Tendências → verificar gráfico e filtros de período.

---

## Fase 3: Compliance Médico e Legal (OBRIGATÓRIO para aprovação)

### 3A. Disclaimer Médico
- **Criar:** `src/screens/DisclaimerScreen.tsx` (tela cheia no primeiro acesso), `src/components/MedicalDisclaimer.tsx`
- **Modificar:** `App.tsx` (verificar `disclaimerAcceptedAt` no AsyncStorage), `HomeScreen.tsx` (footer com aviso), `settings.ts` (adicionar campo)
- Texto obrigatório: "Aplicativo para registro pessoal apenas", "Não substitui consulta médica", "Em crise hipertensiva, procure emergência", "Classificações baseadas nas diretrizes AHA"

### 3B. Política de Privacidade
- **Criar:** `src/screens/PrivacyPolicyScreen.tsx` (viewer in-app)
- **Hospedar:** URL pública (GitHub Pages ou página estática) — ambas as stores exigem URL
- Conteúdo: dados armazenados localmente apenas, sem analytics, sem terceiros, usuário pode deletar tudo

### 3C. Tela Sobre
- **Criar:** `src/screens/AboutScreen.tsx` (versão, créditos, links para disclaimer e privacidade)
- **Modificar:** `SettingsScreen.tsx` (link para Sobre)

**Verificação:** Limpar AsyncStorage → reabrir → disclaimer deve aparecer. Aceitar → não aparece novamente. Navegar para privacidade via Ajustes.

---

## Fase 4: Exportação de Dados (PDF + CSV + Backup)

### 4A. Geração de PDF
- **Dependências:** `npx expo install expo-print expo-sharing expo-file-system expo-document-picker`
- **Criar:** `src/utils/pdfReport.ts` (gera HTML → PDF), `src/utils/exportData.ts` (CSV + JSON backup/restore)
- PDF: nome do paciente, período, estatísticas, tabela de medições com cores, disclaimer no rodapé

### 4B. Pontos de Integração
- **Modificar:** `HistoryScreen.tsx` (botão "📄 PDF" no header), `SettingsScreen.tsx` ("Exportar Dados"), `ReadingDetailScreen.tsx` (compartilhar medição individual)
- Formatos: PDF (médico), CSV (planilha), JSON (backup completo)

### 4C. Importar/Restaurar
- **Modificar:** `SettingsScreen.tsx` ("Importar Dados"), `readings.ts` (adicionar `importReadings()` com merge sem duplicar)

**Verificação:** Exportar PDF → abrir → dados corretos. Exportar JSON → limpar dados → importar → medições restauradas.

---

## Fase 5: Notificações de Lembrete

- **Dependência:** `npx expo install expo-notifications`
- **Criar:** `src/utils/notifications.ts` (schedule/cancel helpers)
- **Modificar:** `SettingsScreen.tsx` (toggle + seletor de horário), `App.tsx` (request permission se habilitado)
- Texto: "Hora de medir sua pressão! 🫀"
- iOS: solicitar permissão. Android 13+: `POST_NOTIFICATIONS`

**Verificação:** Habilitar lembrete → definir horário → verificar que notificação dispara. Desabilitar → sem notificações.

---

## Fase 6: Polish e Preparação para App Store

### 6A. Ícone e Splash Screen
- Redesenhar `assets/icon.png` (1024x1024, tema coração/BP, fundo escuro #0F1117)
- Atualizar `adaptive-icon.png` e `splash-icon.png`
- Sem texto no ícone (Apple rejeita se ilegível em tamanho pequeno)

### 6B. Configuração EAS Build
- **Criar:** `eas.json` com profiles: development, preview, production
- **Modificar:** `app.json` — adicionar `eas.projectId`, `owner`, `ios.buildNumber`, `android.versionCode`, `plugins` para notificações
- Comandos: `npx eas init`, `npx eas build`, `npx eas submit`

### 6C. Metadados das Stores
- Screenshots: iPhone 6.7" e 6.5" (mínimo 3), Android (mínimo 2)
- Feature graphic Google Play: 1024x500
- Descrição curta (80 chars): "Monitore sua pressão arterial de forma simples"
- Descrição completa (~300 palavras em pt-BR)
- Keywords, categoria Saúde/Fitness
- Privacy policy URL

### 6D. Polimento Final
- `HomeScreen.tsx` — footer disclaimer
- `ReadingCard.tsx` — feedback háptico no delete (opcional: expo-haptics)
- **Criar:** `src/components/ErrorBoundary.tsx`
- Verificar safe areas em todos os devices

**Verificação:** `npx eas build --profile preview` para iOS e Android. Instalar em dispositivos. Testar todas as features. Submeter ao TestFlight / Google Play Internal Testing.

---

## Resumo de Dependências por Fase

| Fase | Dependências | Comando |
|------|-------------|---------|
| 1-3 | Nenhuma nova | — |
| 2 | react-native-svg | `npx expo install react-native-svg` |
| 4 | expo-print, expo-sharing, expo-file-system, expo-document-picker | `npx expo install expo-print expo-sharing expo-file-system expo-document-picker` |
| 5 | expo-notifications | `npx expo install expo-notifications` |
| 6 | expo-build-properties | `npx expo install expo-build-properties` |

**Nota:** `react-native-vector-icons` está instalado mas não é usado → remover para reduzir bundle.

---

## Novos Arquivos (Total)

```
src/components/BPLineChart.tsx        (Fase 2)
src/components/ErrorBoundary.tsx      (Fase 6)
src/components/MedicalDisclaimer.tsx  (Fase 3)
src/screens/AboutScreen.tsx           (Fase 3)
src/screens/DisclaimerScreen.tsx      (Fase 3)
src/screens/PrivacyPolicyScreen.tsx   (Fase 3)
src/screens/ReadingDetailScreen.tsx   (Fase 1)
src/screens/SettingsScreen.tsx        (Fase 1)
src/screens/TrendScreen.tsx           (Fase 2)
src/storage/settings.ts               (Fase 1)
src/types/navigation.ts               (Fase 1)
src/utils/exportData.ts               (Fase 4)
src/utils/notifications.ts            (Fase 5)
src/utils/pdfReport.ts                (Fase 4)
eas.json                              (Fase 6)
```

---

## Lançamento Mínimo Viável (se tempo limitado)

Se precisar lançar rápido, o mínimo para aprovação nas stores:
1. **Fase 1** — UX completa (Settings + Detail + Edit)
2. **Fase 3** — Compliance obrigatório (Disclaimer + Privacy Policy)
3. **Fase 6B/C** — Build e metadados (EAS + screenshots)

Isso dá um app de 5 telas (Home, Histórico, Detalhe, Nova/Editar, Ajustes) com compliance legal. Charts, exportação e notificações podem vir como updates.

---

## Fase 7 (Pós-Lançamento)

Features para futuras atualizações:
- Tags de contexto (manhã/noite/pós-exercício)
- Integração HealthKit / Google Fit
- Tracking de medicação
- Biometria (Face ID/Fingerprint) via expo-local-authentication
- Internacionalização (i18n)
