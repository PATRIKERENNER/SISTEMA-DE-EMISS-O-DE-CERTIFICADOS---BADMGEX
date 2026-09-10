export type SignatureType = 'manual' | 'imagem' | 'qrcode';

export interface SignatureItem {
  id: string;
  nome: string;
  cargo: string;
  cpf?: string;
  tipoAssinatura?: SignatureType;
  imagemUrl?: string; // base64 data URL
  dadosQrCode?: string; // text or link for Gov.br / ICP-Brasil / signature verification
  qrCodeDataUrl?: string; // generated QR code image
}

export interface Participant {
  id: string;
  numeroCertificado: string; // ex: 001/CVTE/2026
  nome: string;
  cpf: string;
  registro: string;
  categoria: string; // ex: AD, AB, D, E
  periodo?: string; // se customizado por aluno, senão usa o geral
  cargaHoraria?: string; // ex: 50h/a
  dataEmissao?: string;
  notaLegislacao?: string;
  notaDirecao?: string;
  notaSocorros?: string;
  notaConvivio?: string;
  codigoVerificacao?: string; // ex: SGCERT-2026-MOPP-8B3E-21A9
  tipoCursoId?: string; // id do curso vinculado (ex: mopp, cargas, cve, escolar, coletivo)
}

export interface DisciplineItem {
  id: string;
  nome: string;
  cargaHoraria: string;
  avaliacaoPadrao: string;
  instrutor: string;
}

export type CourseTypeId = 
  | 'cvte' 
  | 'mopp' 
  | 'ctcp' 
  | 'cvtci' 
  | 'cve' 
  | 'cargas_indivisiveis' 
  | 'transporte_coletivo' 
  | 'transporte_escolar' 
  | 'personalizado';

export interface CoursePreset {
  id: CourseTypeId;
  nomeCurto: string; // ex: MOPP
  nomeCompleto: string;
  subtitulo: string;
  sigla: string;
  descricaoBreve: string;
  cargaHorariaPadrao: string;
  resolucaoPadrao: string;
  disciplinas: DisciplineItem[];
}

export interface CourseConfig {
  tipoCursoId?: CourseTypeId;
  nomeCurso: string; // ex: Curso Especializado para Condutores de Veículos de Transporte de Emergência
  subtituloCurso: string; // ex: Condutores de Veículos de Transporte de Emergência
  siglaCurso: string; // ex: CVTE
  numeroTurma?: string; // ex: 001/CVTE/2026 - Número da turma idêntico para todos os alunos no canto superior direito
  ano: string; // ex: 2026
  instituicao: string; // ex: Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias
  instrucaoDetran: string; // ex: Instrução Nº 592, de 10 de agosto de 2020/Detran-DF
  resolucaoContran: string; // ex: Resolução Nº 1.020/2025 do CONTRAN
  periodoGeral: string; // ex: 08 a 16 de junho de 2026
  cargaHorariaGeral: string; // ex: 50h/a
  validadeAnos: string; // ex: cinco anos
  localDataGeral: string; // ex: Brasília-DF, 18 de junho de 2026
  nomeDiretor?: string; // legacy fallback
  cargoDiretor?: string; // legacy fallback
  cpfDiretor?: string; // legacy fallback
  assinaturas: SignatureItem[];
  cnpj: string; // ex: 21.744.847/0001-50
  nomeUnidade: string; // ex: BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO
  incluirVerso: boolean;
  incluirAssinaturaImagem?: boolean;
  incluirCodigoVerificacao?: boolean;
  disciplinas: DisciplineItem[];
}

export interface CertificateVerificationRecord {
  codigoVerificacao: string;
  numeroCertificado: string;
  nomeAluno: string;
  cpf: string;
  registro: string;
  categoria: string;
  cursoNome: string;
  cursoSigla: string;
  cargaHoraria: string;
  periodo: string;
  dataEmissao: string;
  instituicao: string;
  cnpj: string;
  unidade: string;
  resolucaoContran: string;
  assinaturas: {
    nome: string;
    cargo: string;
    cpf?: string;
  }[];
  timestampRegistro: string;
  status: 'valido' | 'revogado';
}

export interface GenerationBenchmark {
  totalCount: number;
  timeMs: number;
  timeSeconds: number;
  averagePerCertMs: number;
  certsPerSecond: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  timestamp: string;
}
