import { TranslationSet } from '../../core/i18n/language';
import { common, CommonTranslations } from '../../core/i18n/common.translations';

export interface ReportsTranslations extends CommonTranslations {
  title: string;
  tabAttendance: string;
  tabBirthdays: string;
  class: string;
  allClasses: string;
  date: string;
  download: string;
  preview: string;
  attendanceTitle: string;
  teachers: string;
  topic: string;
  presentOf: string;
  withBible: string;
  colName: string;
  colAge: string;
  colBible: string;
  noRollCall: string;
  period: string;
  week: string;
  month: string;
  weekOf: string;
  monthLabel: string;
  birthdaysTitle: string;
  colDay: string;
  colTurning: string;
  colContact: string;
  noBirthdays: string;
  years: string;
  countBirthdays: string;
}

export const reportsTranslations: TranslationSet<ReportsTranslations> = {
  pt: {
    ...common.pt,
    title: 'Relatórios',
    tabAttendance: 'Presenças do dia',
    tabBirthdays: 'Aniversariantes',
    class: 'Turma',
    allClasses: 'Todas as turmas',
    date: 'Data',
    download: 'Descarregar PDF',
    preview: 'Pré-visualização',
    attendanceTitle: 'Lista de presenças',
    teachers: 'Professora(s)',
    topic: 'Lição aplicada',
    presentOf: '{p} de {n} presentes',
    withBible: '{n} com Bíblia',
    colName: 'Nome',
    colAge: 'Idade',
    colBible: 'Bíblia',
    noRollCall: 'Sem chamada neste dia',
    period: 'Período',
    week: 'Semana',
    month: 'Mês',
    weekOf: 'Semana de',
    monthLabel: 'Mês',
    birthdaysTitle: 'Aniversariantes',
    colDay: 'Dia',
    colTurning: 'Faz',
    colContact: 'Contacto do encarregado',
    noBirthdays: 'Sem aniversariantes neste período',
    years: '{n} anos',
    countBirthdays: '{n} aniversariante(s)'
  }
};
