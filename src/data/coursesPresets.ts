import { CoursePreset, DisciplineItem } from '../types';

export const OFFICIAL_COURSE_PRESETS: CoursePreset[] = [
  {
    id: 'cvte',
    nomeCurto: 'CVTE',
    nomeCompleto: 'CURSO ESPECIALIZADO PARA CONDUTORES DE VEÍCULOS DE TRANSPORTE DE EMERGÊNCIA',
    subtitulo: 'Condutores de Veículos de Transporte de Emergência (CVTE)',
    sigla: 'CVTE',
    descricaoBreve: 'Deslocamentos com prioridade e livre circulação em situações de urgência e emergência.',
    cargaHorariaPadrao: '50h/a',
    resolucaoPadrao: 'Resolução Nº 789/2020 e Resolução Nº 1.020/2025 do CONTRAN',
    disciplinas: [
      {
        id: 'cvte-1',
        nome: 'Legislação de Trânsito e Normas para Veículos de Emergência',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'PAULO DE JESUS CAMARGO',
      },
      {
        id: 'cvte-2',
        nome: 'Direção Defensiva e Técnicas de Condução em Urgência',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
      {
        id: 'cvte-3',
        nome: 'Noções de Primeiros Socorros e Suporte Inicial em Ocorrências',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'FELIPE VILELA DA COSTA',
      },
      {
        id: 'cvte-4',
        nome: 'Comportamento, Estresse e Relacionamento Interpessoal',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
    ],
  },
  {
    id: 'mopp',
    nomeCurto: 'MOPP',
    nomeCompleto: 'CURSO ESPECIALIZADO PARA CONDUTORES DE VEÍCULOS DE TRANSPORTE DE PRODUTO PERIGOSO',
    subtitulo: 'Condutores de Veículos de Transporte de Produto Perigoso (MOPP)',
    sigla: 'MOPP',
    descricaoBreve: 'Transporte e manuseio seguro de produtos perigosos, cargas químicas e inflamáveis.',
    cargaHorariaPadrao: '50h/a',
    resolucaoPadrao: 'Resolução Nº 789/2020 e Resolução Nº 1.020/2025 do CONTRAN',
    disciplinas: [
      {
        id: 'mopp-1',
        nome: 'Legislação de Trânsito Aplicada ao Transporte de Produtos Perigosos',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'PAULO DE JESUS CAMARGO',
      },
      {
        id: 'mopp-2',
        nome: 'Direção Defensiva em Veículos de Carga Perigosa',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
      {
        id: 'mopp-3',
        nome: 'Noções de Primeiros Socorros e Movimentação de Produtos Perigosos',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'FELIPE VILELA DA COSTA',
      },
      {
        id: 'mopp-4',
        nome: 'Meio Ambiente, Prevenção de Incêndio e Gerenciamento de Riscos',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
    ],
  },
  {
    id: 'ctcp',
    nomeCurto: 'CTCP',
    nomeCompleto: 'CURSO ESPECIALIZADO PARA CONDUTORES DE TRANSPORTE COLETIVO DE PASSAGEIROS',
    subtitulo: 'Condutores de Transporte Coletivo de Passageiros (CTCP)',
    sigla: 'CTCP',
    descricaoBreve: 'Operação de ônibus e vans com foco no passageiro, acessibilidade e respeito aos usuários.',
    cargaHorariaPadrao: '50h/a',
    resolucaoPadrao: 'Resolução Nº 789/2020 e Resolução Nº 1.020/2025 do CONTRAN',
    disciplinas: [
      {
        id: 'ctcp-1',
        nome: 'Legislação de Trânsito e Regulamentação do Transporte de Passageiros',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'PAULO DE JESUS CAMARGO',
      },
      {
        id: 'ctcp-2',
        nome: 'Direção Defensiva em Transporte Coletivo Urbano e Rodoviário',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
      {
        id: 'ctcp-3',
        nome: 'Noções de Primeiros Socorros e Evacuação de Emergência',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'FELIPE VILELA DA COSTA',
      },
      {
        id: 'ctcp-4',
        nome: 'Relacionamento Interpessoal, Acessibilidade e Atendimento ao Cidadão',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
    ],
  },
  {
    id: 'cvtci',
    nomeCurto: 'CVTCI',
    nomeCompleto: 'CURSO ESPECIALIZADO PARA CONDUTORES DE VEÍCULOS DE TRANSPORTE DE CARGA INDIVISÍVEL',
    subtitulo: 'Condutores de Veículos de Transporte de Carga Indivisível (CVTCI)',
    sigla: 'CVTCI',
    descricaoBreve: 'Condução de veículos e combinações transportando cargas indivisíveis e superdimensionadas.',
    cargaHorariaPadrao: '50h/a',
    resolucaoPadrao: 'Resolução Nº 789/2020 e Resolução Nº 1.020/2025 do CONTRAN',
    disciplinas: [
      {
        id: 'cvtci-1',
        nome: 'Legislação Específica e Normas do CONTRAN para Cargas Indivisíveis',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'PAULO DE JESUS CAMARGO',
      },
      {
        id: 'cvtci-2',
        nome: 'Direção Defensiva e Operação de Veículos Superdimensionados',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
      {
        id: 'cvtci-3',
        nome: 'Noções de Primeiros Socorros e Segurança Operacional',
        cargaHoraria: '10h/a',
        avaliacaoPadrao: '10',
        instrutor: 'FELIPE VILELA DA COSTA',
      },
      {
        id: 'cvtci-4',
        nome: 'Movimentação, Amarração e Distribuição de Cargas Indivisíveis',
        cargaHoraria: '15h/a',
        avaliacaoPadrao: '10',
        instrutor: 'ERIK ANDRE RODRIGUES SANTIAGO',
      },
    ],
  },
];

export function getPresetById(id: string): CoursePreset | undefined {
  if (id === 'cve') return OFFICIAL_COURSE_PRESETS.find((p) => p.id === 'cvte');
  if (id === 'cargas_indivisiveis') return OFFICIAL_COURSE_PRESETS.find((p) => p.id === 'cvtci');
  if (id === 'transporte_coletivo') return OFFICIAL_COURSE_PRESETS.find((p) => p.id === 'ctcp');
  return OFFICIAL_COURSE_PRESETS.find((p) => p.id === id);
}
