export interface ExcelValidationError {
  row: number;               // Excel row number (1-based)
  column: string;            // Column header
  value: any;                // Actual cell value
  message: string;           // What is wrong
  expected?: string;         // What is expected
  severity: 'ERROR' | 'WARN';// Block upload or just warn
  suggestion?: string;       // What CP should do
}
