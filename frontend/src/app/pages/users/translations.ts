import { TranslationSet } from '../../core/i18n/language';
import { common, CommonTranslations } from '../../core/i18n/common.translations';

export interface UsersTranslations extends CommonTranslations {
  title: string;
  subtitle: string;
  newUser: string;
  editUser: string;
  password: string;
  passwordHint: string;
  passwordKeep: string;
  role: string;
  roleAdmin: string;
  roleTeacher: string;
  active: string;
  inactive: string;
  status: string;
  you: string;
  removeTitle: string;
  removeConfirm: string;
  created: string;
  updated: string;
  removed: string;
  fillAll: string;
  empty: string;
}

export const usersTranslations: TranslationSet<UsersTranslations> = {
  pt: {
    ...common.pt,
    title: 'Professoras',
    subtitle: 'Quem pode entrar na app da EBD.',
    newUser: 'Nova professora',
    editUser: 'Editar acesso',
    password: 'Palavra-passe',
    passwordHint: 'Mínimo 6 caracteres.',
    passwordKeep: 'Deixe em branco para manter a atual.',
    role: 'Perfil',
    roleAdmin: 'Administrador',
    roleTeacher: 'Professora',
    active: 'Ativa',
    inactive: 'Inativa',
    status: 'Estado',
    you: 'você',
    removeTitle: 'Remover acesso',
    removeConfirm: 'Remover o acesso de {name}?',
    created: 'Acesso criado',
    updated: 'Acesso atualizado',
    removed: 'Acesso removido',
    fillAll: 'Preencha nome, e-mail e uma palavra-passe com pelo menos 6 caracteres.',
    empty: 'Ainda não há utilizadores.'
  }
};
