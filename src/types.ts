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
}

export interface SignatureItem {
  id: string;
  nome: string;
  cargo: string;
  cpf?: string;
}

export interface DisciplineItem {
  id: string;
  nome: string;
  cargaHoraria: string;
  avaliacaoPadrao: string;
  instrutor: string;
}

export interface CourseConfig {
  nomeCurso: string; // ex: Curso Especializado para Condutores de Veículos de Transporte de Emergência
  subtituloCurso: string; // ex: Condutores de Veículos de Transporte de Emergência
  siglaCurso: string; // ex: CVTE
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
  disciplinas: DisciplineItem[];
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
