export type LogSeverity = 'info' | 'warning' | 'error' | 'success';

export type UnitType = 'PORTO' | 'NOTEBOOK PORTO' | 'BEIRA MAR' | 'NOTEBOOK BEIRA MAR';

export interface ComputerInfo {
  hostname: string;
  ip?: string;
  mac?: string;
  os?: string;
  domain?: string;
  department?: string;
  location?: string;
}

export interface UserInfo {
  username: string;
  fullName?: string;
  email?: string;
  role?: string;
  department?: string;
}

export interface RequestInfo {
  clientIp?: string;
  userAgent?: string;
  port?: number;
  protocol?: string;
}

export interface ResponseInfo {
  statusCode?: number;
  statusMessage?: string;
  duration?: string;
}

export interface LogEvent {
  id: string;
  timestamp: string; // Data/Hora ISO or formatted string
  dataHora: string;   // Data/Hora da Planilha (ex: 05/08/2026 12:31:00)
  computador: string; // Nome do Computador na Planilha
  usuario: string;    // Usuário na Planilha
  tela: string;       // Status da Tela (ex: OK, Defeito)
  teclado: string;    // Status do Teclado (ex: OK, Defeito)
  mouse: string;      // Status do Mouse (ex: OK, Defeito)
  touchpad?: string;  // Status do TouchPad (para Notebooks)
  internet: string;   // Status da Internet (ex: OK, Sem Conexão)
  gabinete: string;   // Status do Gabinete/PC (ex: OK, Não Liga ou - para Notebooks)
  statusGeral: string;// Status Geral (ex: OK, ATENÇÃO / DEFEITO)
  isRedRow: boolean;  // Identifica linha vermelha na planilha
  isNotebook?: boolean;// Identifica se é do checklist de Notebook
  unit: UnitType;     // Unidade/Local: 'PORTO' | 'NOTEBOOK PORTO' | 'BEIRA MAR' | 'NOTEBOOK BEIRA MAR'

  severity: LogSeverity;
  computer: ComputerInfo;
  user: UserInfo;
  action?: string;
  message: string;
  traceId?: string;
  latencyMs?: number;
  authMethod?: string;
  metadata?: Record<string, any>;
  request?: RequestInfo;
  response?: ResponseInfo;
}

export interface FilterState {
  searchQuery: string;
  period: string; // '15m' | '1h' | '24h' | '7d' | '30d' | 'custom'
  severity: LogSeverity | 'all';
  unit: string; // 'all' | 'PORTO' | 'NOTEBOOK PORTO' | 'BEIRA MAR' | 'NOTEBOOK BEIRA MAR'
  lab?: string; // 'all' or specific Lab code (e.g. 'L5', 'L1', 'C02', 'OUTROS')
  user: string; // 'all' or specific username
  computer: string; // 'all' or specific hostname
  department: string; // 'all' or specific department
  actionType: string; // 'all' or specific action
  customStartDate?: string;
  customEndDate?: string;
}

export interface HistogramBucket {
  timestamp: string;
  displayTime: string;
  info: number;
  warning: number;
  error: number;
  success: number;
  total: number;
}

export interface SavedQuery {
  id: string;
  title: string;
  query: string;
  description: string;
  createdAt: string;
  filters: Partial<FilterState>;
}
