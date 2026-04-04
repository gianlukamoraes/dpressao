import { BloodPressureReading, ExamEntry, UserProfile } from '../types';
import { classifyBP } from './bloodPressure';

interface ReportOptions {
  userName?: string;
  startDate?: Date;
  endDate?: Date;
  profile?: UserProfile;
}

function calcAge(birthDateISO: string): number | null {
  const birth = new Date(birthDateISO);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getUTCFullYear();
  const m = today.getMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getUTCDate())) age--;
  return age;
}

function isoToBR(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

function sexLabel(sex?: string): string {
  if (sex === 'male') return 'Masculino';
  if (sex === 'female') return 'Feminino';
  if (sex === 'other') return 'Outro';
  return 'Não informado';
}

function buildPatientSection(profile: UserProfile): string {
  const age = profile.birthDate ? calcAge(profile.birthDate) : null;
  const ageStr = age !== null ? `${age} anos` : 'Não informada';
  const birthStr = profile.birthDate ? isoToBR(profile.birthDate) : '—';

  return `
    <div class="section">
      <div class="section-title">🧑‍⚕️ Identificação do Paciente</div>
      <table class="info-table">
        <tr><td class="info-label">Nome</td><td class="info-value">${profile.name || 'Não informado'}</td></tr>
        <tr><td class="info-label">Data de Nascimento</td><td class="info-value">${birthStr}${age !== null ? ` (${ageStr})` : ''}</td></tr>
        <tr><td class="info-label">Sexo</td><td class="info-value">${sexLabel(profile.biologicalSex)}</td></tr>
        ${profile.doctorName ? `<tr><td class="info-label">Médico Responsável</td><td class="info-value">${profile.doctorName}</td></tr>` : ''}
      </table>
    </div>
  `;
}

function buildClinicalSection(profile: UserProfile): string {
  const medDesc = profile.medication.uses
    ? (profile.medication.description ? `Sim — ${profile.medication.description}` : 'Sim')
    : 'Não';

  return `
    <div class="section">
      <div class="section-title">📋 Histórico Clínico</div>
      <table class="info-table">
        <tr><td class="info-label">Medicamentos</td><td class="info-value">${medDesc}</td></tr>
        <tr><td class="info-label">Diabetes</td><td class="info-value">${profile.isDiabetic ? '✅ Sim' : 'Não'}</td></tr>
        <tr><td class="info-label">Fumante</td><td class="info-value">${profile.isSmoker ? '✅ Sim' : 'Não'}</td></tr>
        ${profile.bpGoal ? `<tr><td class="info-label">Meta de Pressão</td><td class="info-value">${profile.bpGoal.systolic}/${profile.bpGoal.diastolic} mmHg</td></tr>` : ''}
      </table>
    </div>
  `;
}

function buildExamsSection(exams: ExamEntry[]): string {
  if (exams.length === 0) return '';

  const rows = exams.map((exam) => {
    const photoHtml = exam.photoBase64
      ? `<br/><img src="data:image/jpeg;base64,${exam.photoBase64}" style="max-width:100%;max-height:200px;margin-top:6px;border-radius:4px;" />`
      : '';
    return `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 8px; white-space: nowrap; vertical-align: top; color: #555; font-size: 12px;">${isoToBR(exam.date)}</td>
        <td style="padding: 8px; font-size: 12px; white-space: pre-wrap;">${exam.description}${photoHtml}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="section">
      <div class="section-title">🔬 Resultados de Exames</div>
      <table>
        <thead>
          <tr>
            <th style="width: 100px;">Data</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildSymptomsAnalysis(readings: BloodPressureReading[]): string {
  const counts: Record<string, number> = {};
  readings.forEach((r) => {
    (r.symptoms ?? []).forEach((s) => {
      counts[s] = (counts[s] ?? 0) + 1;
    });
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return '';

  const rows = sorted.map(([symptom, count]) => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 8px;">${symptom}</td>
      <td style="padding: 8px; text-align: center; font-weight: bold;">${count}</td>
      <td style="padding: 8px; text-align: center; color: #666; font-size: 11px;">${Math.round((count / readings.length) * 100)}% das medições</td>
    </tr>
  `).join('');

  return `
    <div class="section">
      <div class="section-title">🩺 Frequência de Sintomas</div>
      <table>
        <thead>
          <tr>
            <th>Sintoma</th>
            <th style="width: 80px; text-align: center;">Ocorrências</th>
            <th style="width: 140px; text-align: center;">Frequência</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/**
 * Generate PDF report as HTML string for expo-print
 */
export function generatePDFReport(
  readings: BloodPressureReading[],
  options: ReportOptions = {}
): string {
  const profile = options.profile;
  const userName = profile?.name || options.userName || 'Paciente';
  const now = new Date();
  const formattedDate = now.toLocaleString('pt-BR');

  // Statistics
  const avgSystolic = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length)
    : 0;
  const avgDiastolic = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length)
    : 0;
  const avgPulse = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length)
    : 0;
  const minSystolic = readings.length > 0 ? Math.min(...readings.map((r) => r.systolic)) : 0;
  const maxSystolic = readings.length > 0 ? Math.max(...readings.map((r) => r.systolic)) : 0;
  const minDiastolic = readings.length > 0 ? Math.min(...readings.map((r) => r.diastolic)) : 0;
  const maxDiastolic = readings.length > 0 ? Math.max(...readings.map((r) => r.diastolic)) : 0;

  const distributions = { normal: 0, elevated: 0, hypertension1: 0, hypertension2: 0, crisis: 0 };
  readings.forEach((r) => {
    const cls = classifyBP(r.systolic, r.diastolic);
    distributions[cls.category]++;
  });

  const readingsHTML = readings.map((r) => {
    const cls = classifyBP(r.systolic, r.diastolic);
    const date = new Date(r.date).toLocaleString('pt-BR');
    const categoryEmoji = { normal: '🟢', elevated: '🟡', hypertension1: '🟠', hypertension2: '🔴', crisis: '🚨' }[cls.category];
    const symptomsText = r.symptoms && r.symptoms.length > 0 ? r.symptoms.join(', ') : '—';
    const noteText = r.note ? `<br/><em style="color:#888;font-size:11px;">${r.note}</em>` : '';

    return `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 8px; font-size: 11px;">${date}</td>
        <td style="padding: 8px; text-align: center; font-weight: bold;">${r.systolic}</td>
        <td style="padding: 8px; text-align: center; font-weight: bold;">${r.diastolic}</td>
        <td style="padding: 8px; text-align: center;">${r.pulse}</td>
        <td style="padding: 8px; text-align: center;">${categoryEmoji} ${cls.label}</td>
        <td style="padding: 8px; font-size: 11px;">${symptomsText}${noteText}</td>
      </tr>
    `;
  }).join('');

  const patientSection = profile ? buildPatientSection(profile) : `
    <div class="section">
      <div class="section-title">🧑‍⚕️ Paciente</div>
      <div class="patient-info"><p><strong>Nome:</strong> ${userName}</p></div>
    </div>
  `;
  const clinicalSection = profile ? buildClinicalSection(profile) : '';
  const examsSection = profile?.exams && profile.exams.length > 0 ? buildExamsSection(profile.exams) : '';
  const symptomsAnalysis = buildSymptomsAnalysis(readings);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #fff;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 { margin: 0; color: #1976d2; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; font-size: 12px; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
        }
        .info-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 10px; }
        .info-label { width: 180px; color: #666; font-weight: bold; padding: 4px 8px; vertical-align: top; }
        .info-value { color: #333; padding: 4px 8px; }
        .stats-grid { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat-card {
          flex: 1; min-width: 120px;
          background-color: #f9f9f9;
          border: 1px solid #ddd; border-radius: 4px;
          padding: 10px; text-align: center;
        }
        .stat-card-title { font-size: 11px; color: #666; font-weight: bold; margin-bottom: 5px; }
        .stat-card-value { font-size: 18px; font-weight: bold; color: #1976d2; }
        .stat-card-unit { font-size: 10px; color: #999; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
        th { background-color: #1976d2; color: white; padding: 10px; text-align: left; font-weight: bold; }
        .distribution { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .distribution-item {
          background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;
          padding: 10px; flex: 1; min-width: 80px; text-align: center;
        }
        .distribution-emoji { font-size: 20px; margin-bottom: 5px; }
        .distribution-label { font-size: 11px; color: #666; margin-bottom: 5px; }
        .distribution-count { font-size: 16px; font-weight: bold; color: #333; }
        .disclaimer {
          background-color: #fff3e0; border-left: 4px solid #f57c00;
          padding: 10px; margin-top: 20px; font-size: 11px; color: #333; line-height: 1.4;
        }
        .footer {
          text-align: center; font-size: 10px; color: #999;
          border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Relatório de Pressão Arterial</h1>
        <p>dPressao — Monitoramento Pessoal</p>
        <p>Gerado em ${formattedDate}</p>
        <p>Total: ${readings.length} medição${readings.length !== 1 ? 'ões' : ''} · Período: ${
          readings.length > 0
            ? `${new Date(readings[readings.length - 1].date).toLocaleDateString('pt-BR')} a ${new Date(readings[0].date).toLocaleDateString('pt-BR')}`
            : 'N/A'
        }</p>
      </div>

      ${patientSection}
      ${clinicalSection}
      ${examsSection}

      <div class="section">
        <div class="section-title">📈 Estatísticas Gerais</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-title">Sistólica Média</div>
            <div class="stat-card-value">${avgSystolic}</div>
            <div class="stat-card-unit">mmHg</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Diastólica Média</div>
            <div class="stat-card-value">${avgDiastolic}</div>
            <div class="stat-card-unit">mmHg</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Pulso Médio</div>
            <div class="stat-card-value">${avgPulse}</div>
            <div class="stat-card-unit">bpm</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Sistólica (Min/Máx)</div>
            <div class="stat-card-value">${minSystolic}/${maxSystolic}</div>
            <div class="stat-card-unit">mmHg</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Diastólica (Min/Máx)</div>
            <div class="stat-card-value">${minDiastolic}/${maxDiastolic}</div>
            <div class="stat-card-unit">mmHg</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📊 Distribuição por Classificação</div>
        <div class="distribution">
          <div class="distribution-item">
            <div class="distribution-emoji">🟢</div>
            <div class="distribution-label">Normal</div>
            <div class="distribution-count">${distributions.normal}</div>
          </div>
          <div class="distribution-item">
            <div class="distribution-emoji">🟡</div>
            <div class="distribution-label">Elevada</div>
            <div class="distribution-count">${distributions.elevated}</div>
          </div>
          <div class="distribution-item">
            <div class="distribution-emoji">🟠</div>
            <div class="distribution-label">Hipertensão 1</div>
            <div class="distribution-count">${distributions.hypertension1}</div>
          </div>
          <div class="distribution-item">
            <div class="distribution-emoji">🔴</div>
            <div class="distribution-label">Hipertensão 2</div>
            <div class="distribution-count">${distributions.hypertension2}</div>
          </div>
          <div class="distribution-item">
            <div class="distribution-emoji">🚨</div>
            <div class="distribution-label">Crise</div>
            <div class="distribution-count">${distributions.crisis}</div>
          </div>
        </div>
      </div>

      ${symptomsAnalysis}

      ${readings.length > 0 ? `
        <div class="section">
          <div class="section-title">📋 Histórico de Medições</div>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Sistólica</th>
                <th>Diastólica</th>
                <th>Pulso</th>
                <th>Classificação</th>
                <th>Sintomas / Observação</th>
              </tr>
            </thead>
            <tbody>${readingsHTML}</tbody>
          </table>
        </div>
      ` : ''}

      <div class="disclaimer">
        <strong>⚠️ Aviso Importante:</strong><br/>
        Este relatório é apenas para acompanhamento pessoal e não substitui orientação médica profissional.
        Os dados apresentados são baseados em medições pessoais e classificações conforme diretrizes AHA/ACC 2017.
        Em caso de emergência hipertensiva (PA ≥ 180/120 mmHg com sintomas), procure imediatamente um pronto-socorro.
        Compartilhe este relatório com seu médico para análise profissional adequada.
      </div>

      <div class="footer">
        <p>dPressão — Aplicativo de Monitoramento de Pressão Arterial</p>
        <p>Gerado automaticamente em ${formattedDate}</p>
        <p>Dados armazenados localmente apenas em seu dispositivo</p>
      </div>
    </body>
    </html>
  `;
}
