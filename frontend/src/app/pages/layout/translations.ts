import { TranslationSet } from '../../core/i18n/language';

export interface LayoutTranslations {
  sections: string;
  dashboard: string;
  rollCall: string;
  students: string;
  reports: string;
  users: string;
  logout: string;
  subtitle: string;
}

export const layoutTranslations: TranslationSet<LayoutTranslations> = {
  pt: {
    sections: 'Secções',
    dashboard: 'Painel',
    rollCall: 'Chamada',
    students: 'Alunos',
    reports: 'Relatórios',
    users: 'Professoras',
    logout: 'Sair',
    subtitle: 'Escola Bíblica Dominical'
  }
};
