import { Participant, CourseConfig } from '../types';

export const DEFAULT_COURSE_CONFIG: CourseConfig = {
  nomeCurso: 'Curso Especializado para Condutores de Veículos de Transporte de Emergência',
  subtituloCurso: 'Condutores de Veículos de Transporte de Emergência',
  siglaCurso: 'CVTE',
  ano: '2026',
  instituicao: 'A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias –',
  instrucaoDetran: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
  resolucaoContran: 'Resolução Nº 1.020/2025 do CONTRAN',
  periodoGeral: '08 a 16 de junho de 2026',
  cargaHorariaGeral: '50h/a',
  validadeAnos: 'cinco anos',
  localDataGeral: 'Brasília-DF, 18 de junho de 2026',
  nomeDiretor: 'Carlos Henrique Ferreira De Mello',
  cargoDiretor: 'Diretor Geral',
  cpfDiretor: '981.050.007-68',
  cnpj: 'CNPJ Nº 21.744.847/0001-50',
  nomeUnidade: 'BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO',
  incluirVerso: true,
  incluirAssinaturaImagem: false,
  disciplinas: [
    {
      id: '1',
      nome: 'Legislação de Trânsito',
      cargaHoraria: '10h/a',
      avaliacaoPadrao: '10',
      instrutor: 'PAULO DE JESUS CAMARGO',
    },
    {
      id: '2',
      nome: 'Direção Defensiva',
      cargaHoraria: '15h/a',
      avaliacaoPadrao: '9,0',
      instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
    },
    {
      id: '3',
      nome: 'Primeiros Socorros e Atendimento Inicial',
      cargaHoraria: '15h/a',
      avaliacaoPadrao: '10',
      instrutor: 'FELIPE VILELA DA COSTA',
    },
    {
      id: '4',
      nome: 'Comportamento e Convívio Social',
      cargaHoraria: '10h/a',
      avaliacaoPadrao: '10',
      instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
    },
  ],
};

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const CSV_TEMPLATE_HEADER = 'Numero,Nome,CPF,Registro,Categoria,Periodo,CargaHoraria,DataEmissao,NotaLegislacao,NotaDirecao,NotaSocorros,NotaConvivio';

export const CSV_SAMPLE_TEXT = `Numero,Nome,CPF,Registro,Categoria,Periodo,CargaHoraria,DataEmissao,NotaLegislacao,NotaDirecao,NotaSocorros,NotaConvivio
001/CVTE/2026,NOME COMPLETO DO ALUNO,000.000.000-00,00000000000,AD,08 a 16 de junho de 2026,50h/a,Brasília-DF, 18 de junho de 2026,10,10,10,10`;

