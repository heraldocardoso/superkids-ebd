import { TranslationSet } from '../../core/i18n/language';
import { common, CommonTranslations } from '../../core/i18n/common.translations';

export interface RollCallTranslations extends CommonTranslations {
  classes: string;
  noClassesTitle: string;
  noClassesText: string;
  createClasses: string;
  lessonDate: string;
  lessonDetails: string;
  lessonDetailsHint: string;
  teachers: string;
  teachersPlaceholder: string;
  topic: string;
  topicPlaceholder: string;
  present: string;
  bibles: string;
  bible: string;
  addStudent: string;
  addStudentShort: string;
  legendPresent: string;
  legendBible: string;
  legendToggle: string;
  quickTitle: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  quickHint: string;
  quickSubmit: string;
  quickMissing: string;
  quickAdded: string;
  emptyClass: string;
  iconsTitle: string;
  iconsHint: string;
  dayList: string;
  presentNoBible: string;
  presentWithBible: string;
  openRecordOf: string;
  attendanceOf: string;
}

export const rollCallTranslations: TranslationSet<RollCallTranslations> = {
  pt: {
    ...common.pt,
    classes: 'Turma',
    noClassesTitle: 'Ainda não há turmas',
    noClassesText: 'Crie a primeira turma para começar a chamada.',
    createClasses: 'Criar turmas',
    lessonDate: 'Data da aula',
    lessonDetails: 'Dados da aula',
    lessonDetailsHint: 'aparecem na lista do dia',
    teachers: 'Professora(s)',
    teachersPlaceholder: 'Ana e Marta',
    topic: 'Lição aplicada',
    topicPlaceholder: 'Lição 10 – Conhecer Deus pela fé',
    present: 'presentes',
    bibles: 'Bíblias',
    bible: 'Bíblia',
    addStudent: 'Adicionar aluno à chamada',
    addStudentShort: 'Aluno',
    legendPresent: 'Presente',
    legendBible: 'Com Bíblia',
    legendToggle: '· toque de novo para desmarcar',
    quickTitle: 'Adicionar aluno à chamada',
    firstName: 'Nome',
    lastName: 'Apelido',
    birthDate: 'Data de nascimento',
    quickHint: 'Só o nome é obrigatório. Fica marcado como presente e a ficha fica com alerta até completar o que falta.',
    quickSubmit: 'Adicionar e marcar presença',
    quickMissing: 'Escreva pelo menos o nome.',
    quickAdded: '{name} adicionado e marcado presente',
    emptyClass: 'Ainda não há alunos nesta turma. Toque em “+ Aluno” para adicionar.',
    iconsTitle: 'O que significam os ícones?',
    iconsHint: 'Toque num ícone do cartão para ver o detalhe (por exemplo, a que é alérgico). A seta azul quer dizer que a criança já passou da idade da turma: a liderança decide quando muda.',
    dayList: 'Lista do dia (PDF)',
    presentNoBible: 'Presente sem Bíblia',
    presentWithBible: 'Presente com Bíblia',
    openRecordOf: 'Abrir ficha de',
    attendanceOf: 'Presença de'
  }
};
