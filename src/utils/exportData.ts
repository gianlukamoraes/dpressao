import { BloodPressureReading } from '../types';
import { getReadings, saveReading } from '../storage/readings';

/**
 * Export readings as CSV format
 */
export function exportAsCSV(readings: BloodPressureReading[]): string {
  // CSV Header
  const headers = ['ID', 'Data', 'Sistólica', 'Diastólica', 'Pulso', 'Nota'];
  const csvContent = [
    headers.join(','),
    ...readings.map((r) => {
      const date = new Date(r.date).toLocaleString('pt-BR');
      const note = r.note ? `"${r.note.replace(/"/g, '""')}"` : '';
      return `${r.id},${date},${r.systolic},${r.diastolic},${r.pulse},${note}`;
    }),
  ].join('\n');

  return csvContent;
}

/**
 * Export readings as JSON format for backup/restore
 */
export function exportAsJSON(readings: BloodPressureReading[]): string {
  return JSON.stringify(readings, null, 2);
}

/**
 * Get readings formatted for display
 */
export function getReadingsForDisplay(readings: BloodPressureReading[]): Array<{
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  note?: string;
}> {
  return readings.map((r) => ({
    id: r.id,
    date: new Date(r.date).toLocaleString('pt-BR'),
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse,
    note: r.note,
  }));
}

/**
 * Parse and import readings from JSON backup
 * Merges with existing readings without duplicates
 */
export async function importFromJSON(jsonContent: string): Promise<number> {
  try {
    const importedReadings = JSON.parse(jsonContent) as BloodPressureReading[];

    if (!Array.isArray(importedReadings)) {
      throw new Error('Invalid JSON format: expected array');
    }

    // Validate readings
    importedReadings.forEach((r) => {
      if (
        !r.id ||
        typeof r.systolic !== 'number' ||
        typeof r.diastolic !== 'number' ||
        typeof r.pulse !== 'number' ||
        !r.date
      ) {
        throw new Error('Invalid reading format');
      }
    });

    const existingReadings = await getReadings();
    const existingIds = new Set(existingReadings.map((r) => r.id));

    // Add only new readings (avoid duplicates)
    let importedCount = 0;
    for (const reading of importedReadings) {
      if (!existingIds.has(reading.id)) {
        await saveReading(reading);
        importedCount++;
      }
    }

    return importedCount;
  } catch (error) {
    throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse and import readings from CSV
 * CSV format: ID,Date,Systolic,Diastolic,Pulse,Note
 */
export async function importFromCSV(csvContent: string): Promise<number> {
  try {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    const existingReadings = await getReadings();
    const existingIds = new Set(existingReadings.map((r) => r.id));

    let importedCount = 0;
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (doesn't handle quoted values with commas)
      const parts = line.split(',');
      if (parts.length < 5) continue;

      const id = parts[0].trim();
      const date = parts[1].trim();
      const systolic = parseInt(parts[2], 10);
      const diastolic = parseInt(parts[3], 10);
      const pulse = parseInt(parts[4], 10);
      const note = parts[5]?.trim().replace(/^"|"$/g, '') || undefined;

      if (!id || isNaN(systolic) || isNaN(diastolic) || isNaN(pulse)) {
        continue;
      }

      if (!existingIds.has(id)) {
        try {
          // Try to parse date - if it fails, use current date
          const dateObj = new Date(date);
          const isoDate = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();

          await saveReading({
            id,
            systolic,
            diastolic,
            pulse,
            date: isoDate,
            note,
          });
          importedCount++;
        } catch {
          // Skip invalid rows
          continue;
        }
      }
    }

    return importedCount;
  } catch (error) {
    throw new Error(`Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
