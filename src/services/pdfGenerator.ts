import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Participant, CourseConfig, GenerationBenchmark } from '../types';

/**
 * Pre-renders an SVG string to a Base64 PNG image using an offscreen canvas
 * for lightning-fast embedding into jsPDF.
 */
async function svgToDataUrl(svgString: string, width = 300, height = 390): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, width === height ? height : width, width, height);
        // Better draw
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } else {
        URL.revokeObjectURL(url);
        resolve('');
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
}

// Cached SVG Assets to prevent repeated conversions
let cachedSGExPng = '';
let cachedBAdmPng = '';
let cachedSignaturePng = '';

const SGEX_SVG = `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
  <path d="M 16 12 H 184 V 162 C 184 224, 100 250, 100 250 C 100 250, 16 224, 16 162 Z" fill="#FFCA08" stroke="#D49000" stroke-width="1.5"/>
  <path d="M 20 16 H 180 V 68 H 20 Z" fill="#D91023"/>
  <rect x="20" y="32" width="160" height="32" fill="#0671CE" stroke="#FFCA08" stroke-width="2"/>
  <text x="100" y="56" text-anchor="middle" fill="#FFFFFF" stroke="#FFD700" stroke-width="1" font-family="Times New Roman, serif" font-weight="900" font-size="25" letter-spacing="4">S G EX</text>
  <path d="M 20 68 H 180 V 160 C 180 218, 100 244, 100 244 C 100 244, 20 218, 20 160 Z" fill="#D91023"/>
  <polygon points="100,74 174,152 100,230 26,152" fill="#FFFFFF"/>
  <g>
    <line x1="48" y1="184" x2="148" y2="114" stroke="#B84A04" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="48" y1="184" x2="148" y2="114" stroke="#E68A00" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 44 186 C 40 190, 48 200, 56 194 C 62 188, 54 180, 48 184" fill="#E68A00" stroke="#7A2E00" stroke-width="1.5"/>
    <circle cx="43" cy="188" r="3.5" fill="#B84A04"/>
  </g>
  <g>
    <line x1="152" y1="184" x2="52" y2="114" stroke="#B84A04" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="152" y1="184" x2="52" y2="114" stroke="#E68A00" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 156 186 C 160 190, 152 200, 144 194 C 138 188, 146 180, 152 184" fill="#E68A00" stroke="#7A2E00" stroke-width="1.5"/>
    <circle cx="157" cy="188" r="3.5" fill="#B84A04"/>
  </g>
  <g>
    <line x1="100" y1="94" x2="100" y2="216" stroke="#8C1D04" stroke-width="4" stroke-linecap="round"/>
    <line x1="100" y1="94" x2="100" y2="212" stroke="#E68A00" stroke-width="2" stroke-linecap="round"/>
    <path d="M 100 94 C 95 102, 95 110, 100 114 C 105 110, 105 102, 100 94 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 96 C 97 103, 97 108, 100 112 C 103 108, 103 103, 100 96 Z" fill="#E68A00"/>
    <path d="M 100 110 C 90 116, 88 128, 100 134 C 100 134, 100 110, 100 110 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 110 C 110 116, 112 128, 100 134 C 100 134, 100 110, 100 110 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 113 C 93 118, 92 125, 100 130 Z" fill="#E68A00"/>
    <path d="M 100 113 C 107 118, 108 125, 100 130 Z" fill="#E68A00"/>
    <path d="M 100 130 C 88 138, 86 152, 100 158 C 100 158, 100 130, 100 130 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 130 C 112 138, 114 152, 100 158 C 100 158, 100 130, 100 130 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 133 C 91 140, 90 148, 100 154 Z" fill="#E68A00"/>
    <path d="M 100 133 C 109 140, 110 148, 100 154 Z" fill="#E68A00"/>
    <path d="M 100 154 C 90 162, 88 174, 100 180 C 100 180, 100 154, 100 154 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 154 C 110 162, 112 174, 100 180 C 100 180, 100 154, 100 154 Z" fill="#C81820" stroke="#7A0000" stroke-width="1"/>
    <path d="M 100 157 C 92 164, 91 170, 100 176 Z" fill="#E68A00"/>
    <path d="M 100 157 C 108 164, 109 170, 100 176 Z" fill="#E68A00"/>
    <polygon points="98,180 102,180 101,216 99,216" fill="#8C1D04"/>
    <polygon points="99,206 101,206 100.5,216 99.5,216" fill="#FFCA08"/>
  </g>
</svg>`;

const BADM_SVG = `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
  <path d="M 16 12 H 184 V 162 C 184 224, 100 250, 100 250 C 100 250, 16 224, 16 162 Z" fill="#FFCA08" stroke="#D49000" stroke-width="1.5"/>
  <path d="M 20 16 H 180 V 66 H 20 Z" fill="#D91023"/>
  <rect x="20" y="30" width="160" height="30" fill="#0C4AA6" stroke="#FFCA08" stroke-width="2"/>
  <text x="100" y="53" text-anchor="middle" fill="#FFFFFF" stroke="#FFD700" stroke-width="0.9" font-family="Times New Roman, serif" font-weight="900" font-size="17" letter-spacing="1">B ADM QGEX</text>
  <path d="M 20 66 H 180 V 160 C 180 218, 100 244, 100 244 C 100 244, 20 218, 20 160 Z" fill="#D91023"/>
  <path d="M 36 80 H 164 V 156 C 164 204, 100 228, 100 228 C 100 228, 36 204, 36 156 Z" fill="#FFFFFF" stroke="#D91023" stroke-width="2"/>
  <g stroke="#A65B12" fill="none">
    <line x1="50" y1="134" x2="150" y2="134" stroke="#A65B12" stroke-width="3" stroke-linecap="round"/>
    <polygon points="73,90 77,90 80,134 70,134" fill="#A65B12" stroke="#7A3E05" stroke-width="1"/>
    <path d="M 55 132 C 54 116, 110 114, 146 134" stroke="#A65B12" stroke-width="3.5"/>
    <path d="M 66 134 C 70 123, 106 122, 136 134" stroke="#A65B12" stroke-width="2"/>
    <line x1="126" y1="128" x2="128" y2="134" stroke="#A65B12" stroke-width="2"/>
  </g>
  <g>
    <polygon points="100,144 96,150 96,192 104,192 104,150" fill="#E68A00" stroke="#7A3E05" stroke-width="1.2"/>
    <line x1="100" y1="145" x2="100" y2="192" stroke="#FFF" stroke-width="1"/>
    <rect x="88" y="192" width="24" height="4" rx="2" fill="#A65B12" stroke="#7A3E05" stroke-width="1"/>
    <rect x="97.5" y="196" width="5" height="12" fill="#7A3E05"/>
    <circle cx="100" cy="211" r="3.5" fill="#A65B12" stroke="#7A3E05" stroke-width="1"/>
    <ellipse cx="86" cy="180" rx="3.5" ry="8" transform="rotate(-40 86 180)" fill="#C87A1E" stroke="#7A3E05" stroke-width="0.8"/>
    <ellipse cx="78" cy="172" rx="3.5" ry="7.5" transform="rotate(-55 78 172)" fill="#E68A00" stroke="#7A3E05" stroke-width="0.8"/>
    <ellipse cx="114" cy="180" rx="3.5" ry="8" transform="rotate(40 114 180)" fill="#C87A1E" stroke="#7A3E05" stroke-width="0.8"/>
    <ellipse cx="122" cy="172" rx="3.5" ry="7.5" transform="rotate(55 122 172)" fill="#E68A00" stroke="#7A3E05" stroke-width="0.8"/>
    <path d="M 94 195 C 90 198, 92 203, 97 200 C 95 197, 95 195, 94 195 Z" fill="#A65B12" stroke="#7A3E05" stroke-width="0.7"/>
    <path d="M 106 195 C 110 198, 108 203, 103 200 C 105 197, 105 195, 106 195 Z" fill="#A65B12" stroke="#7A3E05" stroke-width="0.7"/>
  </g>
</svg>`;

const SIGNATURE_SVG = `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 25 52 C 20 40, 30 18, 48 20 C 62 22, 60 48, 45 58 C 30 65, 22 50, 35 35 C 50 18, 70 30, 75 48 C 78 58, 88 32, 95 38 C 102 44, 98 60, 110 42 C 118 30, 128 35, 132 48 C 136 60, 148 35, 155 42 C 160 48, 158 58, 170 45 C 180 32, 195 30, 185 55 C 175 75, 130 68, 85 64 C 45 60, 15 58, 65 52 C 115 46, 175 42, 215 48" fill="none" stroke="#1E40AF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/**
 * Initialize image cache
 */
export async function initPdfAssets(): Promise<void> {
  if (!cachedSGExPng) {
    cachedSGExPng = await svgToDataUrl(SGEX_SVG, 400, 520);
  }
  if (!cachedBAdmPng) {
    cachedBAdmPng = await svgToDataUrl(BADM_SVG, 400, 520);
  }
  if (!cachedSignaturePng) {
    cachedSignaturePng = await svgToDataUrl(SIGNATURE_SVG, 240, 80);
  }
}

/**
 * Draws the ornate certificate border in A4 landscape (297 x 210 mm)
 */
function drawCertificateBorder(doc: jsPDF) {
  const margin = 8;
  const pageWidth = 297;
  const pageHeight = 210;

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

  // Soft watermark background in center (Subtle Monument Arch)
  doc.setDrawColor(235, 235, 235);
  doc.setFillColor(250, 250, 250);
  doc.circle(148.5, 105, 45, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.8);
  // Monument Arch silhouette
  doc.ellipse(148.5, 125, 40, 15, 'S');
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
  currentY = 150;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(dataEmissao, pageWidth / 2, currentY, { align: 'center' });

  // 9. Director General Signature (Left Bottom)
  if (config.incluirAssinaturaImagem && cachedSignaturePng) {
    doc.addImage(cachedSignaturePng, 'PNG', 32, 160, 48, 16);
  }
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(26, 178, 86, 178);

  if (config.nomeDiretor) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(config.nomeDiretor, 56, 183, { align: 'center' });
  }

  if (config.cargoDiretor) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(config.cargoDiretor, 56, 187, { align: 'center' });
  }

  if (config.cpfDiretor) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 60, 80);
    doc.text(config.cpfDiretor, 56, 191, { align: 'center' });
  }

  // 10. Military Base Unit / CNPJ Footer (Right Bottom)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(config.cnpj, pageWidth - 26, 185, { align: 'right' });
  doc.setFontSize(7.5);
  doc.text(config.nomeUnidade, pageWidth - 26, 190, { align: 'right' });
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

  // Table Header
  doc.setFillColor(241, 245, 249);
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
    // Alternating row background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
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
