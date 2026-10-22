import { Student } from './student.service';

/** The care icons shown on a student's card, in this order. */
export type CareKind = 'noBible' | 'autism' | 'allergy' | 'diet' | 'needs' | 'medication' | 'siblings';

export interface CareItem {
  kind: CareKind;
  label: string;
  detail: string | null;
}

export const CARE_LABELS: Record<CareKind, string> = {
  noBible: 'Não tem Bíblia em casa',
  autism: 'Perturbação do espetro do autismo',
  allergy: 'Alergia',
  diet: 'Restrição alimentar',
  needs: 'Necessidades especiais',
  medication: 'Medicação',
  siblings: 'Tem irmãos'
};

/** Short names for the legend. */
export const CARE_SHORT: Record<CareKind, string> = {
  noBible: 'Não tem Bíblia',
  autism: 'Autismo',
  allergy: 'Alergia',
  diet: 'Restrição alimentar',
  needs: 'Necessidades especiais',
  medication: 'Medicação',
  siblings: 'Tem irmãos'
};

export const CARE_ORDER: CareKind[] = ['noBible', 'autism', 'allergy', 'diet', 'needs', 'medication', 'siblings'];

export function careItems(s: Student): CareItem[] {
  const h = s.health;
  const items: CareItem[] = [];
  const add = (kind: CareKind, on: boolean | null, detail: string | null = null) => {
    if (on) items.push({ kind, label: CARE_LABELS[kind], detail: detail?.trim() || null });
  };
  add('noBible', s.hasBible === false);
  add('autism', h.autism);
  add('allergy', h.allergy, h.allergyDetail);
  add('diet', h.dietaryRestriction, h.dietaryDetail);
  add('needs', h.specialNeeds, h.specialNeedsDetail);
  add('medication', h.medication, h.medicationDetail);
  add('siblings', s.family.siblings, s.family.siblingsDetail);
  return items;
}
