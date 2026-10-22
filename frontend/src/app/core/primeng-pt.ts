import { Translation } from 'primeng/api';

/** PrimeNG's built-in texts (calendar months, week days, "Hoje"…) in European Portuguese. */
export const PRIMENG_PT: Translation = {
  dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  monthNames: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ],
  monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  today: 'Hoje',
  clear: 'Limpar',
  weekHeader: 'Sem',
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy',
  accept: 'Sim',
  reject: 'Não',
  emptyMessage: 'Sem resultados',
  emptyFilterMessage: 'Sem resultados',
  chooseYear: 'Escolher ano',
  chooseMonth: 'Escolher mês',
  chooseDate: 'Escolher data',
  prevYear: 'Ano anterior',
  nextYear: 'Ano seguinte',
  prevMonth: 'Mês anterior',
  nextMonth: 'Mês seguinte',
  prevDecade: 'Década anterior',
  nextDecade: 'Década seguinte'
};
