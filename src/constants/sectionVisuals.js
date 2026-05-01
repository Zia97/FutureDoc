export const UCAT_SECTIONS = {
  VR: {
    id: 'VR',
    shortLabel: 'VR',
    title: 'Verbal Reasoning',
    icon: 'book',
    accentKey: 'blue',
  },
  DM: {
    id: 'DM',
    shortLabel: 'DM',
    title: 'Decision Making',
    icon: 'person-cog',
    accentKey: 'teal',
  },
  QR: {
    id: 'QR',
    shortLabel: 'QR',
    title: 'Quantitative Reasoning',
    icon: 'calculator',
    accentKey: 'purple',
  },
  SJ: {
    id: 'SJ',
    shortLabel: 'SJ',
    title: 'Situational Judgement',
    icon: 'stethoscope',
    accentKey: 'mint',
  },
};

export const LEARN_FEATURE_ICON = 'graduation-cap';

export function getSectionVisuals(section) {
  return UCAT_SECTIONS[section] ?? {
    id: section,
    shortLabel: section,
    title: section,
    icon: 'target',
    accentKey: 'blue',
  };
}
