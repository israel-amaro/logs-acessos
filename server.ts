import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const SHEET_ID = '1rqubaQZ0XTWiz1HiittFR7jTvHvyG21aGTrIT2_VKqY';

const SHEET_TABS = [
  { unit: 'PORTO', gid: '0', isNotebook: false },
  { unit: 'NOTEBOOK PORTO', gid: '1386592444', isNotebook: true },
  { unit: 'BEIRA MAR', gid: '539769481', isNotebook: false },
  { unit: 'NOTEBOOK BEIRA MAR', gid: '1754592129', isNotebook: true },
];

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  function parseRow(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
      } else if (c === ',' && !inQ) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const rawHeaders = parseRow(lines[0]);
  const headers = rawHeaders.map((h) => h.replace(/^"|"$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const rowObj: Record<string, string> = {};
    let hasData = false;
    headers.forEach((h, idx) => {
      let val = values[idx] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      val = val.replace(/""/g, '"').trim();
      rowObj[h] = val;
      if (val) hasData = true;
    });
    if (hasData) {
      rows.push(rowObj);
    }
  }

  return rows;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to fetch Google Sheets data without browser CORS issues
  app.get('/api/sheets', async (req, res) => {
    try {
      const allRows: any[] = [];
      const tabDetails: Record<string, number> = {};

      const fetchPromises = SHEET_TABS.map(async (tab) => {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${tab.gid}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          console.warn(`Failed to fetch tab ${tab.unit} (gid: ${tab.gid}): ${response.status}`);
          return { tab, rows: [] };
        }

        const csvText = await response.text();
        const rows = parseCSV(csvText);
        return { tab, rows };
      });

      const results = await Promise.allSettled(fetchPromises);

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { tab, rows } = result.value;
          tabDetails[tab.unit] = rows.length;

          rows.forEach((row) => {
            allRows.push({
              ...row,
              Unidade: tab.unit,
              isNotebook: tab.isNotebook,
            });
          });
        }
      });

      return res.json({
        success: true,
        message: 'Planilha sincronizada via servidor com sucesso!',
        rows: allRows,
        tabs: tabDetails,
        total: allRows.length,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
    } catch (error: any) {
      console.error('Error in /api/sheets:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados da planilha no servidor.',
        error: error.toString(),
      });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
