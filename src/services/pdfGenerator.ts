import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Participant, CourseConfig, GenerationBenchmark } from '../types';
import { SGEX_BASE64_PNG, BADM_BASE64_PNG } from '../data/officialLogosBase64';

/**
 * Loads an image from URL/path and returns base64 data URL
 */
async function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
          return;
        }
      } catch (e) {
        console.warn('Canvas export fallback', e);
      }
      resolve(src);
    };
    img.onerror = () => {
      resolve(src);
    };
    img.src = src;
  });
}

// Cached Official Image Assets directly from /public directory
let cachedSGExPng = SGEX_BASE64_PNG;
let cachedBAdmPng = BADM_BASE64_PNG;
let cachedSignaturePng = '';

/**
 * Initialize image cache with the exact images from /public
 */
export async function initPdfAssets(): Promise<void> {
  try {
    const [sgex, badm] = await Promise.all([
      loadImageAsDataUrl('/Secretaria-Geral redimen.png'),
      loadImageAsDataUrl('/badmqgex.min.png'),
    ]);
    if (sgex && sgex.startsWith('data:image')) {
      cachedSGExPng = sgex;
    }
    if (badm && badm.startsWith('data:image')) {
      cachedBAdmPng = badm;
    }
  } catch {
    // Fallback to embedded official base64 if fetch fails
    cachedSGExPng = SGEX_BASE64_PNG;
    cachedBAdmPng = BADM_BASE64_PNG;
  }
}

/**
 * Draws the ornate certificate border in A4 landscape (297 x 210 mm) with pure white background
 */
function drawCertificateBorder(doc: jsPDF) {
  const margin = 8;
  const pageWidth = 297;
  const pageHeight = 210;

  // Pure White Base Background (No shading or watermarks)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer primary black border
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

  // Inner thin border
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - 2 * (margin + 2.5), pageHeight - 2 * (margin + 2.5));

  // Corner decorative flourishes
  const cornerSize = 14;
  const corners = [
    { x: margin + 3, y: margin + 3, dx: 1, dy: 1 },
    { x: pageWidth - margin - 3, y: margin + 3, dx: -1, dy: 1 },
    { x: margin + 3, y: pageHeight - margin - 3, dx: 1, dy: -1 },
    { x: pageWidth - margin - 3, y: pageHeight - margin - 3, dx: -1, dy: -1 },
  ];

  doc.setFillColor(30, 41, 59);
  corners.forEach((c) => {
    // Decorative corner triangles and arcs
    doc.triangle(
      c.x, c.y,
      c.x + c.dx * cornerSize, c.y,
      c.x, c.y + c.dy * cornerSize,
      'FD'
    );
    doc.circle(c.x + c.dx * 6, c.y + c.dy * 6, 2, 'F');
  });
}

/**
 * Draws Front Page (Frente do Certificado)
 */
export function renderCertificateFront(
  doc: jsPDF,
  participant: Participant,
  config: CourseConfig
): void {
  const pageWidth = 297;

  // 1. Decorative border & watermark
  drawCertificateBorder(doc);

  // 2. Official Crest Logos
  if (cachedSGExPng) {
    doc.addImage(cachedSGExPng, 'PNG', 24, 18, 22, 28.6);
  }
  if (cachedBAdmPng) {
    doc.addImage(cachedBAdmPng, 'PNG', pageWidth - 46, 18, 22, 28.6);
  }

  // 3. Header: CERTIFICADO
  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(217, 119, 6); // Golden Amber / Bronze tone (#D97706)
  doc.text('CERTIFICADO', pageWidth / 2, 34, { align: 'center' });

  // 4. Subtitle: Condutores de Veículos de Transporte de Emergência
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(config.subtituloCurso, pageWidth / 2, 44, { align: 'center' });

  // 5. Header Flourish Divider
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.8);
  doc.line(110, 49, 187, 49);
  doc.setFillColor(30, 41, 59);
  doc.circle(pageWidth / 2, 49, 2, 'F');
  doc.circle(pageWidth / 2 - 8, 49, 1.5, 'F');
  doc.circle(pageWidth / 2 + 8, 49, 1.5, 'F');

  // 6. Certificate Registration Number (Right under B ADM logo)
  const numCert = participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(numCert, pageWidth - 46 + 11, 56, { align: 'center' });

  // 7. Main Certificate Text (Rich formatted paragraph with dynamic participant details)
  const periodo = participant.periodo || config.periodoGeral;
  const cargaHoraria = participant.cargaHoraria || config.cargaHorariaGeral;

  // Let's write the text cleanly
  doc.setFont('times', 'normal');
  doc.setFontSize(12.5);
  doc.setTextColor(20, 20, 20);

  const startX = 22;
  const textWidth = pageWidth - 44; // 253mm
  let currentY = 78;

  const fullText = `${config.instituicao} (${config.instrucaoDetran}) certifica que ${participant.nome}, inscrito no CPF nº ${participant.cpf} e no Nº REGISTRO ${participant.registro}, categoria “${participant.categoria}”, concluiu com aproveitamento o ${config.nomeCurso}, ministrado pela IET - Forte Caxias, no período de ${periodo}, com carga horária de ${cargaHoraria}, com validade de ${config.validadeAnos} após o término do curso, conforme ${config.resolucaoContran}.`;

  const lines = doc.splitTextToSize(fullText, textWidth);
  doc.text(lines, startX, currentY, { align: 'justify', maxWidth: textWidth, lineHeightFactor: 1.55 });

  // 8. Issue Date (Center-bottom)
  const dataEmissao = participant.dataEmissao || config.localDataGeral;
  currentY = 149;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(dataEmissao, pageWidth / 2, currentY, { align: 'center' });

  // 9. Dynamic Signatures & Footer Section
  const activeSignatures = (config.assinaturas && config.assinaturas.length > 0)
    ? config.assinaturas
    : (config.nomeDiretor || config.cargoDiretor)
    ? [
        {
          id: 'sig-1',
          nome: config.nomeDiretor || '',
          cargo: config.cargoDiretor || '',
          cpf: config.cpfDiretor || '',
        },
      ]
    : [];

  if (activeSignatures.length <= 1) {
    // Single signature (Left side) + Footer (Right side)
    const sig = activeSignatures[0];
    if (config.incluirAssinaturaImagem && cachedSignaturePng) {
      doc.addImage(cachedSignaturePng, 'PNG', 32, 160, 48, 16);
    }
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.line(26, 178, 86, 178);

    if (sig?.nome) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(sig.nome, 56, 183, { align: 'center' });
    }

    if (sig?.cargo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(sig.cargo, 56, 187, { align: 'center' });
    }

    if (sig?.cpf) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 60, 80);
      doc.text(sig.cpf, 56, 191, { align: 'center' });
    }

    // Military Base Unit / CNPJ Footer (Right Bottom)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(config.cnpj, pageWidth - 26, 185, { align: 'right' });
    doc.setFontSize(7.5);
    doc.text(config.nomeUnidade, pageWidth - 26, 190, { align: 'right' });
  } else {
    // Multiple signatures (2, 3 or more) distributed horizontally
    const numSigs = activeSignatures.length;
    const startX = 26;
    const totalWidth = 245; // 297 - 52
    const lineWidth = Math.min(64, Math.floor(totalWidth / numSigs - 8));
    const step = totalWidth / numSigs;

    activeSignatures.forEach((sig, index) => {
      const centerX = startX + step * index + step / 2;
      const lineStartX = centerX - lineWidth / 2;
      const lineEndX = centerX + lineWidth / 2;

      // Draw signature line
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.3);
      doc.line(lineStartX, 176, lineEndX, 176);

      if (index === 0 && config.incluirAssinaturaImagem && cachedSignaturePng) {
        doc.addImage(cachedSignaturePng, 'PNG', centerX - 24, 159, 48, 16);
      }

      let lineY = 180.5;
      if (sig.nome) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(sig.nome, centerX, lineY, { align: 'center', maxWidth: lineWidth + 4 });
        lineY += 4;
      }

      if (sig.cargo) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(sig.cargo, centerX, lineY, { align: 'center', maxWidth: lineWidth + 4 });
        lineY += 3.5;
      }

      if (sig.cpf) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(70, 80, 95);
        doc.text(sig.cpf, centerX, lineY, { align: 'center', maxWidth: lineWidth + 4 });
      }
    });

    // Sub-footer below multiple signatures
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 60, 80);
    doc.text(config.nomeUnidade, 26, 197);
    doc.text(config.cnpj, pageWidth - 26, 197, { align: 'right' });
  }
}

/**
 * Draws Back Page (Verso do Certificado / Conteúdo Programático)
 */
export function renderCertificateBack(
  doc: jsPDF,
  participant: Participant,
  config: CourseConfig
): void {
  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Ornate Border
  drawCertificateBorder(doc);

  // 2. Logos on Top
  if (cachedSGExPng) {
    doc.addImage(cachedSGExPng, 'PNG', 24, 18, 20, 26);
  }
  if (cachedBAdmPng) {
    doc.addImage(cachedBAdmPng, 'PNG', pageWidth - 44, 18, 20, 26);
  }

  // 3. Institution Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO', pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(14);
  doc.text('“FORTE CAXIAS”', pageWidth / 2, 35, { align: 'center' });

  // 4. Sub-header & Number
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('CONTEÚDO PROGRAMÁTICO', pageWidth / 2, 48, { align: 'center' });

  const numCert = participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`;
  doc.text(numCert, pageWidth - 26, 48, { align: 'right' });

  // 5. Programmatic Content Table
  const tableX = 22;
  const tableY = 56;
  const tableWidth = pageWidth - 44; // 253mm
  const colWidths = [75, 40, 38, 100]; // Total: 253mm

  // Table Header (Pure White)
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, tableY, tableWidth, 12, 'FD');
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.rect(tableX, tableY, tableWidth, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  let currentX = tableX;
  doc.text('DISCIPLINA', currentX + colWidths[0] / 2, tableY + 7.5, { align: 'center' });
  currentX += colWidths[0];
  doc.text('CARGA HORÁRIA', currentX + colWidths[1] / 2, tableY + 7.5, { align: 'center' });
  currentX += colWidths[1];
  doc.text('AVALIAÇÃO', currentX + colWidths[2] / 2, tableY + 7.5, { align: 'center' });
  currentX += colWidths[2];
  doc.text('INSTRUTOR', currentX + colWidths[3] / 2, tableY + 7.5, { align: 'center' });

  // Vertical header dividers
  currentX = tableX;
  for (let i = 0; i < 3; i++) {
    currentX += colWidths[i];
    doc.line(currentX, tableY, currentX, tableY + 12);
  }

  // Rows
  const participantGrades = [
    participant.notaLegislacao || '10',
    participant.notaDirecao || '9,0',
    participant.notaSocorros || '10',
    participant.notaConvivio || '10',
  ];

  let rowY = tableY + 12;
  const rowHeight = 22;

  config.disciplinas.forEach((disc, idx) => {
    // Pure White row background
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, rowY, tableWidth, rowHeight, 'FD');

    // Row borders
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.4);
    doc.rect(tableX, rowY, tableWidth, rowHeight, 'S');

    // Vertical lines
    let cx = tableX;
    for (let i = 0; i < 3; i++) {
      cx += colWidths[i];
      doc.line(cx, rowY, cx, rowY + rowHeight);
    }

    // Text Values
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);

    // Disciplina
    const discLines = doc.splitTextToSize(disc.nome, colWidths[0] - 8);
    const discY = rowY + (rowHeight - (discLines.length * 4)) / 2 + 3;
    doc.text(discLines, tableX + colWidths[0] / 2, discY, { align: 'center' });

    // Carga Horaria
    doc.setFont('helvetica', 'bold');
    doc.text(disc.cargaHoraria, tableX + colWidths[0] + colWidths[1] / 2, rowY + rowHeight / 2 + 1.5, { align: 'center' });

    // Avaliacao
    const grade = participantGrades[idx] || disc.avaliacaoPadrao;
    doc.text(grade, tableX + colWidths[0] + colWidths[1] + colWidths[2] / 2, rowY + rowHeight / 2 + 1.5, { align: 'center' });

    // Instrutor
    const instrLines = doc.splitTextToSize(disc.instrutor, colWidths[3] - 8);
    const instrY = rowY + (rowHeight - (instrLines.length * 4)) / 2 + 3;
    doc.text(instrLines, tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, instrY, { align: 'center' });

    rowY += rowHeight;
  });

  // Footer notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Documento registrado na Instituição de Ensino de Trânsito - IET / Forte Caxias.', pageWidth / 2, pageHeight - 14, { align: 'center' });
}

/**
 * Generates a single participant PDF document
 */
export async function generateSingleCertificatePdf(
  participant: Participant,
  config: CourseConfig
): Promise<jsPDF> {
  await initPdfAssets();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Front page
  renderCertificateFront(doc, participant, config);

  // Back page if enabled
  if (config.incluirVerso) {
    doc.addPage('a4', 'landscape');
    renderCertificateBack(doc, participant, config);
  }

  return doc;
}

/**
 * Downloads a single certificate immediately
 */
export async function downloadSingleCertificate(
  participant: Participant,
  config: CourseConfig
): Promise<void> {
  const doc = await generateSingleCertificatePdf(participant, config);
  const cleanName = participant.nome.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Certificado_${participant.numeroCertificado.replace(/\//g, '-')}_${cleanName}.pdf`);
}

/**
 * Generates a single merged multi-page PDF containing all participants (Front and Back)
 */
export async function generateMergedBatchPdf(
  participants: Participant[],
  config: CourseConfig,
  onProgress?: (current: number, total: number) => void
): Promise<{ doc: jsPDF; benchmark: GenerationBenchmark }> {
  await initPdfAssets();

  const startTime = performance.now();
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (i > 0) {
      doc.addPage('a4', 'landscape');
    }

    renderCertificateFront(doc, p, config);

    if (config.incluirVerso) {
      doc.addPage('a4', 'landscape');
      renderCertificateBack(doc, p, config);
    }

    if (onProgress) {
      onProgress(i + 1, participants.length);
    }
  }

  const endTime = performance.now();
  const timeMs = Math.round(endTime - startTime);
  const timeSeconds = +(timeMs / 1000).toFixed(2);
  const totalCount = participants.length;
  const averagePerCertMs = +(timeMs / totalCount).toFixed(1);
  const certsPerSecond = +((totalCount / (timeMs / 1000)) || 0).toFixed(1);

  const benchmark: GenerationBenchmark = {
    totalCount,
    timeMs,
    timeSeconds,
    averagePerCertMs,
    certsPerSecond,
    status: 'completed',
    timestamp: new Date().toLocaleTimeString('pt-BR'),
  };

  return { doc, benchmark };
}

/**
 * Generates and downloads a ZIP archive containing all individual PDF files
 */
export async function generateAndDownloadZip(
  participants: Participant[],
  config: CourseConfig,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<GenerationBenchmark> {
  await initPdfAssets();
  const startTime = performance.now();

  const zip = new JSZip();
  const folder = zip.folder(`Certificados_${config.siglaCurso}_${config.ano}`) || zip;

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    renderCertificateFront(doc, p, config);

    if (config.incluirVerso) {
      doc.addPage('a4', 'landscape');
      renderCertificateBack(doc, p, config);
    }

    const pdfBlob = doc.output('blob');
    const cleanName = p.nome.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNum = (p.numeroCertificado || `${i + 1}`).replace(/\//g, '-');
    const fileName = `Certificado_${cleanNum}_${cleanName}.pdf`;

    folder.file(fileName, pdfBlob);

    if (onProgress) {
      onProgress(i + 1, participants.length, `Gerando certificado ${i + 1} de ${participants.length}...`);
    }
  }

  if (onProgress) {
    onProgress(participants.length, participants.length, 'Compactando arquivo ZIP final...');
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, `Certificados_Em_Lote_${config.siglaCurso}_${config.ano}_(${participants.length}_alunos).zip`);

  const endTime = performance.now();
  const timeMs = Math.round(endTime - startTime);
  const timeSeconds = +(timeMs / 1000).toFixed(2);
  const totalCount = participants.length;
  const averagePerCertMs = +(timeMs / totalCount).toFixed(1);
  const certsPerSecond = +((totalCount / (timeMs / 1000)) || 0).toFixed(1);

  return {
    totalCount,
    timeMs,
    timeSeconds,
    averagePerCertMs,
    certsPerSecond,
    status: 'completed',
    timestamp: new Date().toLocaleTimeString('pt-BR'),
  };
}
