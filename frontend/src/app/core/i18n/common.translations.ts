import { TranslationSet } from './language';

/**
 * Strings that would otherwise be repeated in every component's
 * `translations.ts`. Spread them in: `pt: { ...common.pt, title: '…' }`.
 */
export interface CommonTranslations {
  save: string;
  saving: string;
  cancel: string;
  close: string;
  edit: string;
  remove: string;
  create: string;
  done: string;
  loading: string;
  yes: string;
  no: string;
  required: string;
  error: string;
  success: string;
  warning: string;
  name: string;
  email: string;
  phone: string;
  actions: string;
  noClass: string;
  genericError: string;
}

export const common: TranslationSet<CommonTranslations> = {
  pt: {
    save: 'Guardar',
    saving: 'A guardar…',
    cancel: 'Cancelar',
    close: 'Fechar',
    edit: 'Editar',
    remove: 'Remover',
    create: 'Criar',
    done: 'Concluído',
    loading: 'A carregar…',
    yes: 'Sim',
    no: 'Não',
    required: 'Obrigatório',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Atenção',
    name: 'Nome',
    email: 'E-mail',
    phone: 'Telefone',
    actions: 'Ações',
    noClass: 'Sem turma',
    genericError: 'Não foi possível concluir. Tente de novo.'
  }
};
