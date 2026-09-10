import QRCode from 'qrcode';
import { Participant, CourseConfig, CertificateVerificationRecord } from '../types';

const STORAGE_KEY = 'sgcert_verified_certificates_v1';

/**
 * Creates a deterministic 8-character hex hash from a seed string
 */
function createHash(seed: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase();
  return (combined + 'ABCDEF012345').slice(0, 8);
}

/**
 * Generates an official validation code for a participant
 * Format: SGCERT-[ANO]-[SIGLA]-[XXXX-XXXX]
 */
export function generateVerificationCode(participant: Participant, config: CourseConfig): string {
  if (participant.codigoVerificacao && participant.codigoVerificacao.trim() !== '') {
    return participant.codigoVerificacao.trim().toUpperCase();
  }

  const cleanCpf = (participant.cpf || '').replace(/\D/g, '');
  const cleanNum = (participant.numeroCertificado || '').replace(/[^a-zA-Z0-9]/g, '');
  const sigla = (config.siglaCurso || 'CVTE').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const ano = config.ano || '2026';

  const seed = `${cleanCpf}-${cleanNum}-${sigla}-${ano}-${participant.nome}`;
  const rawHash = createHash(seed);
  const part1 = rawHash.slice(0, 4);
  const part2 = rawHash.slice(4, 8);

  return `SGCERT-${ano}-${sigla}-${part1}-${part2}`;
}

/**
 * Returns the public verification URL for a given code
 */
export function getVerificationUrl(verificationCode: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?validar=${encodeURIComponent(verificationCode)}`;
  }
  return `https://sgcert-pro.eb.mil.br/verificar?codigo=${encodeURIComponent(verificationCode)}`;
}

/**
 * Generates a QR Code as Base64 PNG Data URL
 */
export async function generateQrCodeDataUrl(text: string, size = 200): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.warn('Error generating QR code:', err);
    return '';
  }
}

/**
 * Loads all registered certificates from LocalStorage
 */
export function getAllRegisteredCertificates(): CertificateVerificationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as CertificateVerificationRecord[];
  } catch (err) {
    console.error('Failed to load certificates registry:', err);
    return [];
  }
}

/**
 * Registers one or more certificates into the local verification store
 */
export function registerCertificatesInStore(
  participants: Participant[],
  config: CourseConfig
): CertificateVerificationRecord[] {
  const existing = getAllRegisteredCertificates();
  const existingMap = new Map<string, CertificateVerificationRecord>();
  existing.forEach((r) => existingMap.set(r.codigoVerificacao, r));

  const now = new Date().toLocaleString('pt-BR');
  const addedRecords: CertificateVerificationRecord[] = [];

  participants.forEach((p) => {
    const code = generateVerificationCode(p, config);
    const record: CertificateVerificationRecord = {
      codigoVerificacao: code,
      numeroCertificado: p.numeroCertificado,
      nomeAluno: p.nome,
      cpf: p.cpf,
      registro: p.registro,
      categoria: p.categoria,
      cursoNome: config.nomeCurso,
      cursoSigla: config.siglaCurso,
      cargaHoraria: p.cargaHoraria || config.cargaHorariaGeral,
      periodo: p.periodo || config.periodoGeral,
      dataEmissao: p.dataEmissao || config.localDataGeral,
      instituicao: config.instituicao,
      cnpj: config.cnpj,
      unidade: config.nomeUnidade,
      resolucaoContran: config.resolucaoContran,
      assinaturas: (config.assinaturas || []).map((s) => ({
        nome: s.nome,
        cargo: s.cargo,
        cpf: s.cpf,
      })),
      timestampRegistro: now,
      status: 'valido',
    };

    existingMap.set(code, record);
    addedRecords.push(record);
  });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(existingMap.values())));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  return addedRecords;
}

/**
 * Searches for a certificate by verification code, certificate number, or CPF
 */
export function findCertificateVerification(
  query: string
): CertificateVerificationRecord | null {
  if (!query || query.trim() === '') return null;
  const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
  const all = getAllRegisteredCertificates();

  // 1. Exact match on verification code
  const exact = all.find(
    (c) => c.codigoVerificacao.toUpperCase().replace(/\s+/g, '') === cleanQuery
  );
  if (exact) return exact;

  // 2. Partial match or without hyphens
  const queryNoHyphen = cleanQuery.replace(/-/g, '');
  const matchNoHyphen = all.find((c) => {
    const codeNoHyphen = c.codigoVerificacao.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return codeNoHyphen.includes(queryNoHyphen) || queryNoHyphen.includes(codeNoHyphen);
  });
  if (matchNoHyphen) return matchNoHyphen;

  // 3. Match on certificate number or CPF
  const matchOther = all.find((c) => {
    const numClean = c.numeroCertificado.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cpfClean = c.cpf.replace(/\D/g, '');
    return (
      numClean === cleanQuery.replace(/[^A-Z0-9]/g, '') ||
      (cpfClean.length >= 6 && cleanQuery.replace(/\D/g, '') === cpfClean)
    );
  });

  return matchOther || null;
}
