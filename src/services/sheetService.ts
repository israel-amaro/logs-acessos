import { LogEvent, UnitType } from '../types/log';
import { parseChecklistRowToLogEvent, generateInitialLogs } from '../data/mockLogs';

export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvVnnAmbv_zVtjBilNd8qu5S4LWfN_K6QZga-aE5j3UKs3NOmSBHn1SKjaCCOeSrpA/exec";
export const SHEET_ID = "1rqubaQZ0XTWiz1HiittFR7jTvHvyG21aGTrIT2_VKqY";

export const SHEET_TABS: { name: UnitType; gid: string; isNotebook: boolean }[] = [
  { name: 'PORTO', gid: '0', isNotebook: false },
  { name: 'NOTEBOOK PORTO', gid: '1386592444', isNotebook: true },
  { name: 'BEIRA MAR', gid: '539769481', isNotebook: false },
  { name: 'NOTEBOOK BEIRA MAR', gid: '1754592129', isNotebook: true },
];

export interface SheetFetchResult {
  success: boolean;
  message: string;
  data?: LogEvent[];
  raw?: any;
  lastSync?: string;
}

/**
 * Parses raw CSV text respecting quotes and commas
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseRow = (rowStr: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        if (inQuotes && rowStr[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const headers = parseRow(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    let hasValue = false;
    headers.forEach((header, idx) => {
      let val = values[idx] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).trim();
      }
      const cleanHeader = header.trim();
      obj[cleanHeader] = val;
      if (val.trim()) hasValue = true;
    });
    if (hasValue) {
      results.push(obj);
    }
  }

  return results;
}

import { sortLogsMostRecentFirst } from '../utils/labUtils';

/**
 * Syncs directly with all 4 tabs of the online Google Spreadsheet CSV export.
 */
export async function fetchSheetData(): Promise<SheetFetchResult> {
  try {
    // Attempt 1: Full-Stack Server Proxy (/api/sheets) - standard for bypassing browser CORS
    const apiRes = await fetch('/api/sheets', { cache: 'no-store' });
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success && Array.isArray(json.rows) && json.rows.length > 0) {
        const mappedLogs: LogEvent[] = json.rows.map((row: any, idx: number) =>
          parseChecklistRowToLogEvent(row, idx, row.Unidade as UnitType)
        );
        const sortedLogs = sortLogsMostRecentFirst(mappedLogs);

        return {
          success: true,
          message: `Planilha sincronizada ao vivo com sucesso! (${json.total || sortedLogs.length} registros)`,
          data: sortedLogs,
          raw: json.rows,
          lastSync: json.timestamp || new Date().toLocaleTimeString('pt-BR'),
        };
      }
    }

    // Attempt 2: Direct CSV export from client-side if server route isn't hit
    const allFetchedLogs: LogEvent[] = [];
    let successfulTabsCount = 0;

    // Fetch all 4 tabs in parallel
    const tabPromises = SHEET_TABS.map(async (tab) => {
      const tabUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${tab.gid}`;
      const res = await fetch(tabUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} para aba ${tab.name}`);
      const csvText = await res.text();
      const parsedRows = parseCSV(csvText);
      return { tab, parsedRows };
    });

    const results = await Promise.allSettled(tabPromises);

    results.forEach((result, tabIdx) => {
      if (result.status === 'fulfilled' && result.value.parsedRows.length > 0) {
        successfulTabsCount++;
        const { tab, parsedRows } = result.value;
        parsedRows.forEach((row, idx) => {
          const log = parseChecklistRowToLogEvent(row, allFetchedLogs.length + idx, tab.name);
          allFetchedLogs.push(log);
        });
      }
    });

    if (successfulTabsCount > 0 && allFetchedLogs.length > 0) {
      const sortedLogs = sortLogsMostRecentFirst(allFetchedLogs);
      return {
        success: true,
        message: `Planilha sincronizada ao vivo com sucesso! (${successfulTabsCount}/4 abas)`,
        data: sortedLogs,
        lastSync: new Date().toLocaleTimeString('pt-BR'),
      };
    }

    // Attempt Webhook/Apps Script fallback if direct CSV failed
    const scriptRes = await fetch(SCRIPT_URL, { cache: 'no-store' });
    if (scriptRes.ok) {
      const text = await scriptRes.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        const mappedLogs: LogEvent[] = parsed.map((item: any, idx: number) =>
          parseChecklistRowToLogEvent(item, idx)
        );

        return {
          success: true,
          message: 'Dados do Webhook sincronizados com sucesso!',
          data: mappedLogs,
          raw: parsed,
          lastSync: new Date().toLocaleTimeString('pt-BR'),
        };
      }
    }

    // Fallback if empty or unreachable
    return {
      success: true,
      message: 'Planilha acessada com dados locais.',
      data: generateInitialLogs(),
      lastSync: new Date().toLocaleTimeString('pt-BR'),
    };
  } catch (err: any) {
    console.warn('Google Sheet fetch error:', err);
    return {
      success: false,
      message: `Erro ao conectar com a planilha. Exibindo dados locais.`,
      data: generateInitialLogs(),
      lastSync: new Date().toLocaleTimeString('pt-BR'),
    };
  }
}

/**
 * Send a new log/checklist event to the online Google Web App
 */
export async function sendLogToSheet(payload: any): Promise<boolean> {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (e) {
    console.error('Erro ao enviar log para a planilha:', e);
    return false;
  }
}

