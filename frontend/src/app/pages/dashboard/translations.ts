import { TranslationSet } from '../../core/i18n/language';
import { common, CommonTranslations } from '../../core/i18n/common.translations';

export interface DashboardTranslations extends CommonTranslations {
  pill: string;
  headlineStart: string;
  headlineHighlight: string;
  createClasses: string;
  presentOn: string;
  present: string;
  withBible: string;
  enrolled: string;
  pendingConsents: string;
  incompleteForms: string;
  toMove: string;
  toMoveOne: string;
  pendingConsentsOne: string;
  incompleteFormsOne: string;
  seeStudents: string;
  attendance: string;
  totalPresent: string;
  ofThemBible: string;
  noRollCall: string;
  byClass: string;
  day: string;
  barBible: string;
  barNoBible: string;
  barTotal: string;
  noClasses: string;
  biblesAtHome: string;
  fromForms: string;
  have: string;
  haveNot: string;
  unknown: string;
  mayNeedOne: string;
  seeUnknown: string;
  noStudents: string;
  weekBirthdays: string;
  noBirthdays: string;
  today: string;
  turning: string;
  bibles: string;
}

export const dashboardTranslations: TranslationSet<DashboardTranslations> = {
  pt: {
    ...common.pt,
    pill: 'Escola Bíblica Dominical',
    headlineStart: 'Cada criança',
    headlineHighlight: 'conta',
    createClasses: 'Criar turmas',
    presentOn: 'presentes em',
    present: 'presentes',
    withBible: 'com Bíblia',
    enrolled: 'alunos inscritos',
    pendingConsents: 'autorizações de dados (RGPD) por recolher.',
    incompleteForms: 'fichas com informação importante em falta.',
    toMove: 'crianças já passaram da idade da turma. A liderança decide quando mudam.',
    toMoveOne: 'criança já passou da idade da turma. A liderança decide quando muda.',
    pendingConsentsOne: 'autorização de dados (RGPD) por recolher.',
    incompleteFormsOne: 'ficha com informação importante em falta.',
    seeStudents: 'Ver alunos',
    attendance: 'Frequência',
    totalPresent: 'Total de presentes',
    ofThemBible: 'Destes, com Bíblia',
    noRollCall: 'Ainda não há chamadas registadas. A frequência aparece aqui depois da primeira chamada.',
    byClass: 'Por turma',
    day: 'Dia',
    barBible: 'Com Bíblia',
    barNoBible: 'Sem Bíblia',
    barTotal: 'a barra toda = total de presentes',
    noClasses: 'Crie as turmas para ver a frequência de cada uma.',
    biblesAtHome: 'Têm Bíblia em casa?',
    fromForms: 'segundo as fichas',
    have: 'têm',
    haveNot: 'não têm',
    unknown: 'por saber',
    mayNeedOne: 'Não têm Bíblia (podem precisar de uma)',
    seeUnknown: 'Ver fichas sem esta informação',
    noStudents: 'Aparece aqui quando houver alunos inscritos.',
    weekBirthdays: 'Aniversariantes da semana',
    noBirthdays: 'Nenhum aniversário de segunda a domingo desta semana.',
    today: 'Hoje!',
    turning: 'faz',
    bibles: 'Bíblias'
  }
};
