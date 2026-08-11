import { LogEvent } from '../types/log';

export interface LabInfo {
  labCode: string;
  labLabel: string;
  position?: string;
  assetTag?: string;
}

/**
 * Extracts Laboratory details from standard SENAI hostnames such as "PT-L5-02-60000":
 * - PT: Porto (unidade)
 * - L5 / L05 / C02: Laboratório (Lab 05)
 * - 02: Posição do computador no laboratório
 * - 60000: Patrimônio
 */
export function extractLabInfo(hostname?: string): LabInfo {
  if (!hostname || hostname === 'N/A' || hostname === '-') {
    return { labCode: 'OUTROS', labLabel: 'Outros / Não identificado' };
  }

  const clean = hostname.trim().toUpperCase();
  const parts = clean.split('-');

  // Check 1: Standard 4-part hostname e.g. PT-L5-02-60000 or BM-L1-05-50002
  if (parts.length >= 3) {
    const labPart = parts[1];
    const posPart = parts[2];
    const assetPart = parts[3];

    // Matches L5, L05, L1, LAB05, C02, etc.
    const labMatch = labPart.match(/^(L|LAB|C)(\d+)$/i);
    if (labMatch) {
      const type = labMatch[1].toUpperCase();
      const numStr = labMatch[2];
      const numFormatted = numStr.padStart(2, '0');
      const labCode = `L${numFormatted}`;
      const prefix = type === 'C' ? 'Lab C' : 'Lab ';
      
      return {
        labCode,
        labLabel: `${prefix}${numFormatted}`,
        position: posPart,
        assetTag: assetPart,
      };
    }
  }

  // Check 2: Loose pattern matching anywhere in the hostname
  const match = clean.match(/(?:^|-)(L\d+|C\d+|LAB\d+)(?:-|$)/i);
  if (match) {
    const rawCode = match[1].toUpperCase();
    const digits = rawCode.replace(/\D/g, '');
    const numFormatted = digits ? digits.padStart(2, '0') : rawCode;
    const labCode = rawCode.startsWith('C') ? `C${numFormatted}` : `L${numFormatted}`;
    const prefix = rawCode.startsWith('C') ? 'Lab C' : 'Lab ';

    return {
      labCode,
      labLabel: `${prefix}${numFormatted}`,
    };
  }

  return {
    labCode: 'OUTROS',
    labLabel: 'Outros / Não identificado',
  };
}

/**
 * Helper to parse a Brazilian date/time string (DD/MM/YYYY HH:mm:ss) or ISO timestamp into milliseconds
 */
export function getLogTimestampMs(log: LogEvent): number {
  const dateStr = log.dataHora || log.timestamp;
  if (!dateStr) return 0;

  // Format: "DD/MM/YYYY HH:mm:ss" or "DD/MM/YYYY HH:mm"
  const brMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    const hour = parseInt(brMatch[4] || '0', 10);
    const min = parseInt(brMatch[5] || '0', 10);
    const sec = parseInt(brMatch[6] || '0', 10);
    return new Date(year, month, day, hour, min, sec).getTime();
  }

  // Fallback to JS Date parse
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Sorts an array of LogEvents from most recent (newest) date/time to oldest
 */
export function sortLogsMostRecentFirst(logs: LogEvent[]): LogEvent[] {
  return [...logs].sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
}

/**
 * Dynamically extracts all available laboratories from logs with count of unique cataloged computers
 */
export function getAvailableLabs(logs: LogEvent[]): { code: string; label: string; count: number }[] {
  const labMap: Record<string, { label: string; computers: Set<string> }> = {};

  logs.forEach((log) => {
    const comp = log.computador || log.computer?.hostname || '';
    if (!comp) return;
    const { labCode, labLabel } = extractLabInfo(comp);
    
    if (!labMap[labCode]) {
      labMap[labCode] = { label: labLabel, computers: new Set() };
    }
    labMap[labCode].computers.add(comp);
  });

  return Object.entries(labMap)
    .map(([code, data]) => ({
      code,
      label: data.label,
      count: data.computers.size,
    }))
    .sort((a, b) => {
      if (a.code === 'OUTROS') return 1;
      if (b.code === 'OUTROS') return -1;
      return a.code.localeCompare(b.code);
    });
}
