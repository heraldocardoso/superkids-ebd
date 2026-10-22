/**
 * Texto da autorização RGPD que o encarregado lê antes de assinar na app.
 *
 * Preencha CHURCH com os dados reais da igreja antes de pôr a app a uso.
 * Ao mudar o texto, suba CONSENT_VERSION: cada assinatura guarda a versão
 * que a pessoa leu.
 */
export const CHURCH = {
  name: '[Nome da Igreja]',
  contact: '[e-mail ou telefone]',
  retention: '12 meses'
};

export const CONSENT_VERSION = 'v1';

export interface ConsentSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export function consentText(): ConsentSection[] {
  return [
    {
      title: 'Quem trata os dados',
      paragraphs: [
        `A ${CHURCH.name} é responsável pelos dados recolhidos na ficha da Escola Bíblica Dominical (Super Kids EBD). Contacto: ${CHURCH.contact}.`
      ]
    },
    {
      title: 'Que dados guardamos',
      bullets: [
        'Da criança: nome, data de nascimento, morada, turma, se é alfabetizada, se tem Bíblia, irmãos e fotografia (só se autorizar).',
        'Da mãe, do pai e do encarregado: nome, contacto e Instagram (opcional).',
        'Saúde e cuidados (só se autorizar): alergias, alimentação, medicação, necessidades especiais, autismo.',
        'Presenças em cada aula e se trouxe a Bíblia.'
      ]
    },
    {
      title: 'Para quê',
      paragraphs: [
        'Organizar as turmas e a chamada, cuidar da segurança da criança, contactar o encarregado e fazer estatísticas internas. Não vendemos nem publicamos os dados.'
      ]
    },
    {
      title: 'Quem tem acesso',
      paragraphs: [
        'Só as professoras da EBD e a coordenação do ministério infantil. Os dados de saúde só são comunicados a terceiros numa emergência.'
      ]
    },
    {
      title: 'Quanto tempo',
      paragraphs: [`Enquanto a criança frequentar a EBD e até ${CHURCH.retention} depois.`]
    },
    {
      title: 'Os seus direitos',
      paragraphs: [
        'Pode consultar, corrigir, apagar ou pedir cópia dos dados, opor-se ao tratamento e retirar o consentimento a qualquer momento, sem custos. Pode reclamar à CNPD (www.cnpd.pt). Base legal: consentimento (RGPD, art. 6.º, n.º 1, a) e art. 9.º, n.º 2, a); Lei n.º 58/2019).'
      ]
    }
  ];
}

export const CONSENT_QUESTIONS = [
  'Autorizo a guarda dos dados de identificação, contacto e presenças.',
  'Autorizo a guarda dos dados de saúde e cuidados (alergias, alimentação, medicação, necessidades especiais, autismo).',
  'Autorizo a fotografia da criança na ficha (não é publicada).'
] as const;
