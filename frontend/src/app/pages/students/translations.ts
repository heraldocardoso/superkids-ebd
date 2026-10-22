import { TranslationSet } from '../../core/i18n/language';
import { common, CommonTranslations } from '../../core/i18n/common.translations';

export interface StudentsTranslations extends CommonTranslations {
  title: string;
  newStudent: string;
  classes: string;
  search: string;
  all: string;
  incomplete: string;
  moveClass: string;
  ages: string;
  agesFrom: string;
  agesTo: string;
  agesHint: string;
  noAges: string;
  agesMissing: string;
  fillAges: string;
  agesFilled: string;
  consent: string;
  noBible: string;
  bibleUnknown: string;
  empty: string;
  emptyFilter: string;
  countOne: string;
  countMany: string;
  incompleteTag: string;
  consentPending: string;
  consentRefused: string;
  classesTitle: string;
  classesHint: string;
  newClass: string;
  newClassPlaceholder: string;
  suggestions: string;
  createAll: string;
  classesCreated: string;
  studentsIn: string;
  removeClass: string;
  removeClassConfirm: string;
  classNotEmpty: string;
  classCreated: string;
  classRemoved: string;
  onlyAdmin: string;
}

export const studentsTranslations: TranslationSet<StudentsTranslations> = {
  pt: {
    ...common.pt,
    title: 'Alunos',
    newStudent: 'Novo aluno',
    classes: 'Turmas',
    search: 'Procurar por nome',
    all: 'Todas',
    incomplete: 'Ficha incompleta',
    moveClass: 'Mudar de turma',
    ages: 'Idades',
    agesFrom: 'De',
    agesTo: 'Até',
    agesHint: 'Anos completos. “Até 14” avisa no dia em que faz 15. Deixe “Até” vazio para sem limite.',
    noAges: 'Sem idades: não avisa mudanças',
    agesMissing: 'Há turmas da EBD sem idades definidas, por isso a app ainda não avisa quando uma criança passa da idade.',
    fillAges: 'Preencher idades',
    agesFilled: 'Idades das turmas preenchidas',
    consent: 'Sem autorização RGPD',
    noBible: 'Sem Bíblia',
    bibleUnknown: 'Bíblia por saber',
    empty: 'Ainda não há alunos. Toque em “Novo aluno” para criar a primeira ficha.',
    emptyFilter: 'Nenhum aluno com estes filtros.',
    countOne: '1 aluno',
    countMany: '{n} alunos',
    incompleteTag: 'Incompleta',
    consentPending: 'RGPD por recolher',
    consentRefused: 'RGPD recusada',
    classesTitle: 'Turmas',
    classesHint: 'Só se pode apagar uma turma sem alunos. A app avisa quando uma criança passa da idade máxima da turma; quem decide a mudança é a liderança.',
    newClass: 'Nova turma',
    newClassPlaceholder: 'Nome da turma',
    suggestions: 'Turmas da EBD',
    createAll: 'Criar todas',
    classesCreated: '{n} turmas criadas',
    studentsIn: '{n} alunos',
    removeClass: 'Apagar turma',
    removeClassConfirm: 'Apagar a turma {name}?',
    classNotEmpty: 'Mude os alunos de turma antes de a apagar.',
    classCreated: 'Turma criada',
    classRemoved: 'Turma apagada',
    onlyAdmin: 'Só um administrador pode apagar turmas.'
  }
};
