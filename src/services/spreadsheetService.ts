import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { Participant } from '../types';
import { CSV_SAMPLE_TEXT } from '../data/sampleData';

/**
 * Normalizes text to lower-case without accents or special chars for fuzzy column matching
 */
function normalizeHeaderKey(key: string): string {
  return String(key || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Parses raw tabular row objects into structured Participant entities
 */
export function mapRowsToParticipants(rows: Record<string, any>[]): Participant[] {
  const participants: Participant[] = [];

  rows.forEach((rawRow, index) => {
    // Map normalized keys to values
    const normalizedRow: Record<string, any> = {};
    Object.keys(rawRow).forEach((origKey) => {
      const norm = normalizeHeaderKey(origKey);
      normalizedRow[norm] = rawRow[origKey];
    });

    // Skip entirely empty rows
    const hasValues = Object.values(normalizedRow).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== ''
    );
    if (!hasValues) return;

    // Flexible column matchers
    const nome =
      normalizedRow['nome'] ||
      normalizedRow['aluno'] ||
      normalizedRow['participante'] ||
      normalizedRow['nomecompleto'] ||
      normalizedRow['nomedoaluno'] ||
      normalizedRow['militar'] ||
      `Participante ${index + 1}`;

    const cpf =
      normalizedRow['cpf'] ||
      normalizedRow['cpfn'] ||
      normalizedRow['documento'] ||
      normalizedRow['doc'] ||
      '000.000.000-00';

    const registro =
      normalizedRow['registro'] ||
      normalizedRow['cnh'] ||
      normalizedRow['matricula'] ||
      normalizedRow['nregistro'] ||
      normalizedRow['noregistro'] ||
      normalizedRow['renach'] ||
      `0000000000${index + 1}`;

    const categoria =
      normalizedRow['categoria'] ||
      normalizedRow['cat'] ||
      normalizedRow['categoriacnh'] ||
      normalizedRow['categoriadacnh'] ||
      'AD';

    const numero =
      normalizedRow['numero'] ||
      normalizedRow['cert'] ||
      normalizedRow['numerocertificado'] ||
      normalizedRow['numcert'] ||
      normalizedRow['ncertificado'] ||
      `${String(index + 1).padStart(3, '0')}/CVTE/2026`;

    const periodo =
      normalizedRow['periodo'] ||
      normalizedRow['datas'] ||
      normalizedRow['periododocurso'] ||
      undefined;

    const cargaHoraria =
      normalizedRow['cargahoraria'] ||
      normalizedRow['ch'] ||
      normalizedRow['cargahorariatotal'] ||
      undefined;

    const dataEmissao =
      normalizedRow['dataemissao'] ||
      normalizedRow['datadeemissao'] ||
      normalizedRow['data'] ||
      undefined;

    // Grade fields
    const notaLegislacao =
      normalizedRow['notalegislacao'] ||
      normalizedRow['legislacao'] ||
      normalizedRow['leg'] ||
      undefined;

    const notaDirecao =
      normalizedRow['notadirecao'] ||
      normalizedRow['direcao'] ||
      normalizedRow['direcaodefensiva'] ||
      normalizedRow['dd'] ||
      undefined;

    const notaSocorros =
      normalizedRow['notasocorros'] ||
      normalizedRow['socorros'] ||
      normalizedRow['primeirossocorros'] ||
      normalizedRow['ps'] ||
      undefined;

    const notaConvivio =
      normalizedRow['notaconvivio'] ||
      normalizedRow['convivio'] ||
      normalizedRow['relacionamentointerpessoal'] ||
      normalizedRow['meioambiente'] ||
      undefined;

    participants.push({
      id: `imported-${Date.now()}-${index}`,
      numeroCertificado: String(numero).trim(),
      nome: String(nome).trim().toUpperCase(),
      cpf: String(cpf).trim(),
      registro: String(registro).trim(),
      categoria: String(categoria).trim().toUpperCase(),
      periodo: periodo ? String(periodo).trim() : undefined,
      cargaHoraria: cargaHoraria ? String(cargaHoraria).trim() : undefined,
      dataEmissao: dataEmissao ? String(dataEmissao).trim() : undefined,
      notaLegislacao: notaLegislacao !== undefined ? String(notaLegislacao).trim() : undefined,
      notaDirecao: notaDirecao !== undefined ? String(notaDirecao).trim() : undefined,
      notaSocorros: notaSocorros !== undefined ? String(notaSocorros).trim() : undefined,
      notaConvivio: notaConvivio !== undefined ? String(notaConvivio).trim() : undefined,
    });
  });

  return participants;
}

/**
 * Parses an Excel (.xlsx, .xls) file using SheetJS
 */
export async function parseExcelFile(file: File): Promise<Participant[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, raw: false });

  // Pick first sheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('A planilha de Excel não possui abas de dados.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (!jsonData || jsonData.length === 0) {
    throw new Error('A aba da planilha está vazia.');
  }

  return mapRowsToParticipants(jsonData);
}

/**
 * Parses a CSV file using PapaParse
 */
export function parseCsvFile(file: File): Promise<Participant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('O arquivo CSV selecionado está vazio.'));
          return;
        }
        const participants = mapRowsToParticipants(results.data as Record<string, any>[]);
        resolve(participants);
      },
      error: (err) => {
        reject(new Error(`Erro ao ler CSV: ${err.message}`));
      },
    });
  });
}

/**
 * Automatically detects file type and parses either .xlsx, .xls or .csv
 */
export async function parseSpreadsheetFile(file: File): Promise<Participant[]> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelFile(file);
  }
  return parseCsvFile(file);
}

/**
 * Downloads a pre-formatted Excel (.xlsx) template with column headers and helper layout
 */
export function downloadExcelTemplate(): void {
  const templateRows = [
    {
      Numero: '001/CVTE/2026',
      Nome: 'NOME COMPLETO DO ALUNO',
      CPF: '000.000.000-00',
      Registro: '00000000000',
      Categoria: 'AD',
      Periodo: '08 a 16 de junho de 2026',
      CargaHoraria: '50h/a',
      DataEmissao: 'Brasília-DF, 18 de junho de 2026',
      NotaLegislacao: '10',
      NotaDirecao: '10',
      NotaSocorros: '10',
      NotaConvivio: '10',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);

  // Set column widths for comfortable Excel viewing
  worksheet['!cols'] = [
    { wch: 18 }, // Numero
    { wch: 38 }, // Nome
    { wch: 18 }, // CPF
    { wch: 16 }, // Registro
    { wch: 12 }, // Categoria
    { wch: 28 }, // Periodo
    { wch: 14 }, // CargaHoraria
    { wch: 32 }, // DataEmissao
    { wch: 16 }, // NotaLegislacao
    { wch: 14 }, // NotaDirecao
    { wch: 16 }, // NotaSocorros
    { wch: 16 }, // NotaConvivio
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'modelo_planilha_certificados.xlsx');
}

/**
 * Downloads a CSV template
 */
export function downloadCsvTemplate(): void {
  const blob = new Blob([CSV_SAMPLE_TEXT], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'modelo_planilha_certificados.csv');
}

/**
 * Exports currently loaded participants list to an .xlsx file
 */
export function exportParticipantsToExcel(participants: Participant[], courseTitle = 'Curso'): void {
  const exportRows = participants.map((p) => ({
    Numero: p.numeroCertificado,
    Nome: p.nome,
    CPF: p.cpf,
    Registro: p.registro,
    Categoria: p.categoria,
    Periodo: p.periodo || '',
    CargaHoraria: p.cargaHoraria || '',
    DataEmissao: p.dataEmissao || '',
    NotaLegislacao: p.notaLegislacao || '',
    NotaDirecao: p.notaDirecao || '',
    NotaSocorros: p.notaSocorros || '',
    NotaConvivio: p.notaConvivio || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 38 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 28 },
    { wch: 14 },
    { wch: 32 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `lista_participantes_${courseTitle.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
}
