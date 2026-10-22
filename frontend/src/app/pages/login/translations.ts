import { TranslationSet } from '../../core/i18n/language';

export interface LoginTranslations {
  pill: string;
  headlineStart: string;
  headlineHighlight: string;
  intro: string;
  cardTitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
  signingIn: string;
  missing: string;
  invalid: string;
  offline: string;
  expired: string;
  help: string;
  brandSubtitle: string;
}

export const loginTranslations: TranslationSet<LoginTranslations> = {
  pt: {
    pill: 'Escola Bíblica Dominical',
    headlineStart: 'Cada criança',
    headlineHighlight: 'conta',
    intro: 'Chamada, fichas e relatórios da EBD num só sítio.',
    cardTitle: 'Entrar',
    email: 'E-mail',
    emailPlaceholder: 'o.seu@email.pt',
    password: 'Palavra-passe',
    passwordPlaceholder: 'A sua palavra-passe',
    signIn: 'Entrar',
    signingIn: 'A entrar…',
    missing: 'Escreva o e-mail e a palavra-passe.',
    invalid: 'E-mail ou palavra-passe inválidos.',
    offline: 'Não foi possível ligar ao servidor. Verifique a internet e tente de novo.',
    expired: 'A sessão terminou. Entre de novo.',
    help: 'Não tem conta? Peça à coordenação da EBD.',
    brandSubtitle: 'AD Santarém Casa do Pai'
  }
};
