import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Participant, CourseConfig, GenerationBenchmark } from '../types';
import { SGEX_BASE64_PNG, BADM_BASE64_PNG } from '../data/officialLogosBase64';
import { CERTIFICATE_BACKGROUND_BASE64_JPG } from '../data/certificateBackgroundBase64';
import {
  generateVerificationCode,
  generateQrCodeDataUrl,
  getVerificationUrl,
  registerCertificatesInStore,
} from './verificationService';

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
let cachedBackgroundJpg = CERTIFICATE_BACKGROUND_BASE64_JPG;
let cachedSignaturePng = '';

/**
 * Initialize image cache with the exact images from /public
 */
export async function initPdfAssets(): Promise<void> {
  try {
    const [sgex, badm, bg] = await Promise.all([
      loadImageAsDataUrl('/Secretaria-Geral redimen.png'),
      loadImageAsDataUrl('/badmqgex.min.png'),
      loadImageAsDataUrl('/fundo-certificado.jpg'),
    ]);
    if (sgex && sgex.startsWith('data:image')) {
      cachedSGExPng = sgex;
    }
    if (badm && badm.startsWith('data:image')) {
      cachedBAdmPng = badm;
    }
    if (bg && bg.startsWith('data:image')) {
      cachedBackgroundJpg = bg;
    }
  } catch {
    // Fallback to embedded official base64 if fetch fails
    cachedSGExPng = SGEX_BASE64_PNG;
    cachedBAdmPng = BADM_BASE64_PNG;
    cachedBackgroundJpg = CERTIFICATE_BACKGROUND_BASE64_JPG;
  }
}

/**
 * Draws the ornate certificate border in A4 landscape (297 x 210 mm) with background watermark
 */
function drawCertificateBorder(doc: jsPDF, config?: CourseConfig) {
  const margin = 8;
  const pageWidth = 297;
  const pageHeight = 210;

  // Pure White Base Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Background Watermark Image (Praça dos Cristais / Concha Acústica QGEx com Bandeira Nacional)
  const shouldIncludeWatermark = config ? config.incluirMarcaDagua !== false : true;
  if (shouldIncludeWatermark && cachedBackgroundJpg) {
    try {
      doc.addImage(
        cachedBackgroundJpg,
        'JPEG',
        margin + 2.5,
        margin + 2.5,
        pageWidth - 2 * (margin + 2.5),
        pageHeight - 2 * (margin + 2.5),
        'bg_cert_watermark',
        'FAST'
      );
    } catch (e) {
      console.warn('Failed to render background watermark image', e);
    }
  }

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
 * Helper to ensure electronic signature QR codes are prepared
 */
async function prepareSignatures(config: CourseConfig): Promise<void> {
  if (!config.assinaturas) return;
  for (const sig of config.assinaturas) {
    if (sig.tipoAssinatura === 'qrcode' && sig.dadosQrCode && !sig.qrCodeDataUrl) {
      try {
        sig.qrCodeDataUrl = await generateQrCodeDataUrl(sig.dadosQrCode, 120);
      } catch (e) {
        console.warn('Erro ao gerar QR Code da assinatura:', e);
      }
    }
  }
}

interface TextSegment {
  text: string;
  bold: boolean;
}

interface TextWord {
  text: string;
  isSpace: boolean;
  bold: boolean;
}

/**
 * Draws a cleanly justified paragraph supporting mixed normal and bold styles
 */
function drawFormattedJustifiedParagraph(
  doc: jsPDF,
  segments: TextSegment[],
  startX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words: TextWord[] = [];
  segments.forEach((seg) => {
    const parts = seg.text.split(/(\s+)/);
    parts.forEach((p) => {
      if (!p) return;
      if (/^\s+$/.test(p)) {
        words.push({ text: ' ', isSpace: true, bold: seg.bold });
      } else {
        words.push({ text: p, isSpace: false, bold: seg.bold });
      }
    });
  });

  function getWordWidth(w: TextWord): number {
    doc.setFont('times', w.bold ? 'bold' : 'normal');
    return doc.getTextWidth(w.text);
  }

  doc.setFont('times', 'normal');
  const normalSpaceWidth = doc.getTextWidth(' ');

  const lines: TextWord[][] = [];
  let currentLine: TextWord[] = [];
  let currentLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const item = words[i];
    if (item.isSpace) continue;

    const wWidth = getWordWidth(item);
    const spaceNeeded = currentLine.length > 0 ? normalSpaceWidth : 0;

    if (currentLine.length > 0 && currentLineWidth + spaceNeeded + wWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = [item];
      currentLineWidth = wWidth;
    } else {
      currentLine.push(item);
      currentLineWidth += spaceNeeded + wWidth;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  let y = startY;
  lines.forEach((line, lineIndex) => {
    const isLastLine = lineIndex === lines.length - 1;

    let totalTextWidth = 0;
    line.forEach((w) => {
      totalTextWidth += getWordWidth(w);
    });

    const numGaps = line.length - 1;
    let spaceWidth = normalSpaceWidth;
    if (!isLastLine && numGaps > 0) {
      const remainingSpace = maxWidth - totalTextWidth;
      spaceWidth = Math.max(normalSpaceWidth, remainingSpace / numGaps);
    }

    let x = startX;
    line.forEach((w, wIdx) => {
      doc.setFont('times', w.bold ? 'bold' : 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(w.text, x, y);
      x += getWordWidth(w);
      if (wIdx < numGaps) {
        x += spaceWidth;
      }
    });

    y += lineHeight;
  });

  return y;
}

/**
 * Draws Front Page (Frente do Certificado)
 */
export function renderCertificateFront(
  doc: jsPDF,
  participant: Participant,
  config: CourseConfig,
  _verificationQrDataUrl?: string
): void {
  const pageWidth = 297;

  // 1. Decorative border & watermark
  drawCertificateBorder(doc, config);

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

  // 6. Certificate Registration Number (Right under B ADM logo) - Número da Turma (em negrito)
  const numTurma = config.numeroTurma || participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(numTurma, pageWidth - 46 + 11, 56, { align: 'center' });

  // 7. Main Certificate Text: ALL VARIABLE DATA IN BOLD
  const periodo = participant.periodo || config.periodoGeral;
  const cargaHoraria = participant.cargaHoraria || config.cargaHorariaGeral;

  const startX = 22;
  const textWidth = pageWidth - 44; // 253mm
  const currentY = 78;

  doc.setFontSize(12.5);

  const segments: TextSegment[] = [
    { text: `${config.instituicao} (${config.instrucaoDetran}) certifica que `, bold: false },
    { text: participant.nome, bold: true },
    { text: ', inscrito no CPF nº ', bold: false },
    { text: participant.cpf, bold: true },
    { text: ' e no Nº REGISTRO ', bold: false },
    { text: participant.registro, bold: true },
    { text: ', categoria ', bold: false },
    { text: `“${participant.categoria}”`, bold: true },
    { text: ', concluiu com aproveitamento o ', bold: false },
    { text: config.nomeCurso, bold: true },
    { text: ', ministrado pela IET - Forte Caxias, no período de ', bold: false },
    { text: periodo, bold: true },
    { text: ', com carga horária de ', bold: false },
    { text: cargaHoraria, bold: true },
    { text: ', com validade de ', bold: false },
    { text: `${config.validadeAnos}`, bold: true },
    { text: ' após o término do curso, conforme ', bold: false },
    { text: config.resolucaoContran, bold: true },
    { text: '.', bold: false },
  ];

  drawFormattedJustifiedParagraph(doc, segments, startX, currentY, textWidth, 9.5);

  // 8. Issue Date (Center-bottom) - em negrito
  const dataEmissao = participant.dataEmissao || config.localDataGeral;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(dataEmissao, pageWidth / 2, 149, { align: 'center' });

  // 9. Signatures & Footer Section (Clean official layout without QR Code)
  const activeSignatures = (config.assinaturas && config.assinaturas.length > 0)
    ? config.assinaturas
    : (config.nomeDiretor || config.cargoDiretor)
    ? [
        {
          id: 'sig-1',
          nome: config.nomeDiretor || '',
          cargo: config.cargoDiretor || '',
          cpf: config.cpfDiretor || '',
          tipoAssinatura: 'manual' as const,
        },
      ]
    : [];

  if (activeSignatures.length <= 1) {
    // Single signature (Left side) + Footer (Right side)
    const sig = activeSignatures[0];
    if (sig) {
      if (sig.tipoAssinatura === 'imagem' && sig.imagemUrl) {
        try {
          doc.addImage(sig.imagemUrl, 'PNG', 36, 160, 40, 16);
        } catch (e) {
          console.warn('Erro ao inserir imagem de assinatura:', e);
        }
      } else if (config.incluirAssinaturaImagem && cachedSignaturePng) {
        doc.addImage(cachedSignaturePng, 'PNG', 32, 160, 48, 16);
      }
    }

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(26, 178, 86, 178);

    if (sig?.nome) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(sig.nome, 56, 183, { align: 'center' });
    }

    if (sig?.cargo) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(sig.cargo, 56, 187, { align: 'center' });
    }

    if (sig?.cpf) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 60, 80);
      doc.text(`CPF: ${sig.cpf}`, 56, 191, { align: 'center' });
    }

    // Military Base Unit / CNPJ Footer (Right Bottom) - em negrito, sem QR Code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(config.cnpj, pageWidth - 26, 185, { align: 'right' });
    doc.setFontSize(8);
    doc.text(config.nomeUnidade, pageWidth - 26, 190, { align: 'right' });
  } else {
    // Multiple signatures distributed horizontally (without QR Code)
    const numSigs = activeSignatures.length;
    const startX = 26;
    const totalWidth = 245;
    const lineWidth = Math.min(64, Math.floor(totalWidth / numSigs - 8));
    const step = totalWidth / numSigs;

    activeSignatures.forEach((sig, index) => {
      const centerX = startX + step * index + step / 2;
      const lineStartX = centerX - lineWidth / 2;
      const lineEndX = centerX + lineWidth / 2;

      if (sig.tipoAssinatura === 'imagem' && sig.imagemUrl) {
        try {
          doc.addImage(sig.imagemUrl, 'PNG', centerX - 20, 159, 40, 15);
        } catch (e) {
          console.warn('Erro ao renderizar imagem de assinatura:', e);
        }
      } else if (index === 0 && config.incluirAssinaturaImagem && cachedSignaturePng) {
        doc.addImage(cachedSignaturePng, 'PNG', centerX - 24, 159, 48, 16);
      }

      // Draw signature line
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.4);
      doc.line(lineStartX, 176, lineEndX, 176);

      let lineY = 180.5;
      if (sig.nome) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(sig.nome, centerX, lineY, { align: 'center', maxWidth: lineWidth + 4 });
        lineY += 4;
      }

      if (sig.cargo) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(sig.cargo, centerX, lineY, { align: 'center', maxWidth: lineWidth + 4 });
        lineY += 3.5;
      }

      if (sig.cpf) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(70, 80, 95);
        doc.text(`CPF: ${sig.cpf}`, centerX, lineY, { align: 'center', maxWidth: lineWidth + 4 });
      }
    });

    // Sub-footer below multiple signatures
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 60, 80);
    doc.text(config.nomeUnidade, 26, 197);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(config.cnpj, pageWidth - 26, 197, { align: 'right' });
  }
}

/**
 * Draws Back Page (Verso do Certificado / Conteúdo Programático com Notas / Menções dos Alunos Concluintes)
 */
export function renderCertificateBack(
  doc: jsPDF,
  participant: Participant,
  config: CourseConfig
): void {
  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Ornate Border & Watermark
  drawCertificateBorder(doc, config);

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
  doc.text('CONTEÚDO PROGRAMÁTICO', pageWidth / 2, 45, { align: 'center' });

  const numTurma = config.numeroTurma || participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(numTurma, pageWidth - 26, 45, { align: 'right' });

  const tableX = 22;
  const tableWidth = pageWidth - 44; // 253mm
  const withWatermark = config ? config.incluirMarcaDagua !== false : true;

  // 5. Concluinte Identification Bar (Verso) - Todos os dados variáveis em negrito
  const idBarY = 50;
  if (!withWatermark) {
    doc.setFillColor(248, 250, 252);
    doc.rect(tableX, idBarY, tableWidth, 8, 'FD');
  }
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.rect(tableX, idBarY, tableWidth, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`CONCLUENTE: ${participant.nome}`, tableX + 3, idBarY + 5.3);
  doc.text(`CPF: ${participant.cpf}    |    REG. CNH: ${participant.registro}    |    TURMA: ${numTurma}`, pageWidth - 25, idBarY + 5.3, { align: 'right' });

  // 6. Quadro de Resumo de Notas / Menções (LT / DD / PSAI / CCS)
  const notaLT = participant.notaLegislacao || '10';
  const notaDD = participant.notaDirecao || '10';
  const notaPSAI = participant.notaSocorros || '10';
  const notaCCS = participant.notaConvivio || '10';

  const gradesBarY = 60;
  const numBoxes = 4;
  const boxGap = 3;
  const boxWidth = (tableWidth - (numBoxes - 1) * boxGap) / numBoxes; // ~61mm
  const boxHeight = 13;

  const gradeBoxes = [
    { title: 'LEGISLAÇÃO (LT)', value: notaLT },
    { title: 'DIREÇÃO DEFENSIVA (DD)', value: notaDD },
    { title: '1º SOCORROS (PSAI)', value: notaPSAI },
    { title: 'CONVÍVIO SOCIAL (CCS)', value: notaCCS },
  ];

  gradeBoxes.forEach((b, i) => {
    const bx = tableX + i * (boxWidth + boxGap);
    if (!withWatermark) {
      doc.setFillColor(255, 255, 255);
      doc.rect(bx, gradesBarY, boxWidth, boxHeight, 'FD');
    }
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.rect(bx, gradesBarY, boxWidth, boxHeight, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(b.title, bx + boxWidth / 2, gradesBarY + 4.2, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(15, 23, 42);
    doc.text(b.value, bx + boxWidth / 2, gradesBarY + 10.2, { align: 'center' });
  });

  // 7. Programmatic Content Table with Grades
  const tableY = 76;
  const colWidths = [76, 37, 40, 100]; // Total: 253mm

  // Table Header
  if (!withWatermark) {
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, tableY, tableWidth, 9, 'FD');
  }
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.rect(tableX, tableY, tableWidth, 9, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  let currentX = tableX;
  doc.text('DISCIPLINA', currentX + colWidths[0] / 2, tableY + 6, { align: 'center' });
  currentX += colWidths[0];
  doc.text('CARGA HORÁRIA', currentX + colWidths[1] / 2, tableY + 6, { align: 'center' });
  currentX += colWidths[1];
  doc.text('NOTA / MENÇÃO', currentX + colWidths[2] / 2, tableY + 6, { align: 'center' });
  currentX += colWidths[2];
  doc.text('INSTRUTOR', currentX + colWidths[3] / 2, tableY + 6, { align: 'center' });

  // Vertical header dividers
  currentX = tableX;
  for (let i = 0; i < 3; i++) {
    currentX += colWidths[i];
    doc.line(currentX, tableY, currentX, tableY + 9);
  }

  // Rows
  const participantGrades = [
    notaLT,
    notaDD,
    notaPSAI,
    notaCCS,
  ];

  let rowY = tableY + 9;
  const rowHeight = 22;

  config.disciplinas.forEach((disc, idx) => {
    if (!withWatermark) {
      doc.setFillColor(255, 255, 255);
      doc.rect(tableX, rowY, tableWidth, rowHeight, 'FD');
    }

    // Row borders
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.rect(tableX, rowY, tableWidth, rowHeight, 'S');

    // Vertical lines
    let cx = tableX;
    for (let i = 0; i < 3; i++) {
      cx += colWidths[i];
      doc.line(cx, rowY, cx, rowY + rowHeight);
    }

    // Disciplina (em negrito)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const discLines = doc.splitTextToSize(disc.nome, colWidths[0] - 8);
    const discY = rowY + (rowHeight - (discLines.length * 4)) / 2 + 3;
    doc.text(discLines, tableX + colWidths[0] / 2, discY, { align: 'center' });

    // Carga Horaria (em negrito)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(disc.cargaHoraria, tableX + colWidths[0] + colWidths[1] / 2, rowY + rowHeight / 2 + 1.5, { align: 'center' });

    // NOTA / MENÇÃO (em destaque negrito)
    const grade = participantGrades[idx] || disc.avaliacaoPadrao || '10';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(grade, tableX + colWidths[0] + colWidths[1] + colWidths[2] / 2, rowY + rowHeight / 2 + 1.5, { align: 'center' });

    // Instrutor (em negrito)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const instrLines = doc.splitTextToSize(disc.instrutor, colWidths[3] - 8);
    const instrY = rowY + (rowHeight - (instrLines.length * 4)) / 2 + 3;
    doc.text(instrLines, tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, instrY, { align: 'center' });

    rowY += rowHeight;
  });

  // 8. Footer notes (Sem qualquer menção ou elemento de QR Code)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Documento registrado na Instituição de Ensino de Trânsito - IET / Forte Caxias.', pageWidth / 2, pageHeight - 12, { align: 'center' });

  if (config.incluirCodigoVerificacao !== false) {
    const verifCode = participant.codigoVerificacao || generateVerificationCode(participant, config);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Chave de Registro: ${verifCode}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }
}

/**
 * Generates a single participant PDF document
 */
export async function generateSingleCertificatePdf(
  participant: Participant,
  config: CourseConfig
): Promise<jsPDF> {
  await initPdfAssets();
  await prepareSignatures(config);

  registerCertificatesInStore([participant], config);

  const verifCode = participant.codigoVerificacao || generateVerificationCode(participant, config);
  participant.codigoVerificacao = verifCode;

  let qrDataUrl: string | undefined;
  if (config.incluirCodigoVerificacao !== false) {
    try {
      qrDataUrl = await generateQrCodeDataUrl(getVerificationUrl(verifCode), 120);
    } catch (e) {
      console.warn('Erro ao gerar QR Code de autenticação:', e);
    }
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Front page
  renderCertificateFront(doc, participant, config, qrDataUrl);

  // Back page if enabled
  if (config.incluirVerso) {
    doc.addPage('a4', 'landscape');
    renderCertificateBack(doc, participant, config);
  }

  return doc;
}

/**
 * Generates an OS-safe filename for a certificate PDF using the participant's name
 * Examples: "MARIA EDUARDA SILVA.pdf", "JOÃO PEDRO SANTOS.pdf"
 */
export function formatParticipantFileName(participant: Participant, fallbackIndex?: number): string {
  let studentName = (participant.nome || '').trim();

  if (!studentName) {
    studentName = `Aluno_${(fallbackIndex ?? 0) + 1}`;
  }

  // Remove characters that are illegal in file names across Windows, Linux and macOS:
  // \ / : * ? " < > |
  const sanitized = studentName
    .replace(/[\\/:*?"<>|\r\n\t]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized ? `${sanitized}.pdf` : `Aluno_${(fallbackIndex ?? 0) + 1}.pdf`;
}

/**
 * Downloads a single certificate immediately
 */
export async function downloadSingleCertificate(
  participant: Participant,
  config: CourseConfig
): Promise<void> {
  const doc = await generateSingleCertificatePdf(participant, config);
  const fileName = formatParticipantFileName(participant);
  doc.save(fileName);
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
  await prepareSignatures(config);

  registerCertificatesInStore(participants, config);

  const startTime = performance.now();
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const verifCode = p.codigoVerificacao || generateVerificationCode(p, config);
    p.codigoVerificacao = verifCode;

    let qrDataUrl: string | undefined;
    if (config.incluirCodigoVerificacao !== false) {
      try {
        qrDataUrl = await generateQrCodeDataUrl(getVerificationUrl(verifCode), 120);
      } catch (e) {
        console.warn('Erro ao gerar QR Code de verificação em lote:', e);
      }
    }

    if (i > 0) {
      doc.addPage('a4', 'landscape');
    }

    renderCertificateFront(doc, p, config, qrDataUrl);

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
  await prepareSignatures(config);

  registerCertificatesInStore(participants, config);

  const startTime = performance.now();

  const zip = new JSZip();
  const folder = zip.folder(`Certificados_${config.siglaCurso}_${config.ano}`) || zip;

  // Track filenames to prevent duplicate names from overwriting each other in the ZIP
  const usedFileNames = new Map<string, number>();

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const verifCode = p.codigoVerificacao || generateVerificationCode(p, config);
    p.codigoVerificacao = verifCode;

    let qrDataUrl: string | undefined;
    if (config.incluirCodigoVerificacao !== false) {
      try {
        qrDataUrl = await generateQrCodeDataUrl(getVerificationUrl(verifCode), 120);
      } catch (e) {
        console.warn('Erro ao gerar QR de verificação para ZIP:', e);
      }
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    renderCertificateFront(doc, p, config, qrDataUrl);

    if (config.incluirVerso) {
      doc.addPage('a4', 'landscape');
      renderCertificateBack(doc, p, config);
    }

    const pdfBlob = doc.output('blob');

    // Name of the output file in ZIP: exactly the student's name
    const baseFileName = formatParticipantFileName(p, i);
    let finalFileName = baseFileName;

    const lowerKey = baseFileName.toLowerCase();
    const count = usedFileNames.get(lowerKey) || 0;
    if (count > 0) {
      const nameWithoutExt = baseFileName.replace(/\.pdf$/i, '');
      const certNumPart = p.numeroCertificado
        ? `_${p.numeroCertificado.replace(/[\\/:*?"<>|\s]/g, '-')}`
        : `_(${count + 1})`;
      finalFileName = `${nameWithoutExt}${certNumPart}.pdf`;
    }
    usedFileNames.set(lowerKey, count + 1);

    folder.file(finalFileName, pdfBlob);

    if (onProgress) {
      onProgress(i + 1, participants.length, `Gerando certificado: ${finalFileName} (${i + 1}/${participants.length})...`);
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
