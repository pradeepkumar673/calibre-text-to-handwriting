import type { PaperTemplate } from './types';

export const PAPER_PRESET_IDS = ['a4', 'a5', 'us-letter'] as const;
export type PaperPresetId = (typeof PAPER_PRESET_IDS)[number];

// Default margins are 20 mm on every side. Ruling is 8 mm pitch in light grey.
const DEFAULT_MARGINS = { top: 20, right: 20, bottom: 20, left: 20 } as const;

function ruled(): PaperTemplate['ruling'] {
  return { kind: 'ruled', lineSpacingMm: 8, color: '#b8c4d6', strokeWidthMm: 0.2 };
}

// Built-in starting points. Each call returns fresh objects, so callers can change them safely.
export const PAPER_PRESETS: Readonly<Record<PaperPresetId, () => PaperTemplate>> = {
  a4: () => ({
    id: 'a4',
    name: 'A4',
    widthMm: 210,
    heightMm: 297,
    margins: { ...DEFAULT_MARGINS },
    ruling: ruled(),
  }),
  a5: () => ({
    id: 'a5',
    name: 'A5',
    widthMm: 148,
    heightMm: 210,
    margins: { ...DEFAULT_MARGINS },
    ruling: ruled(),
  }),
  'us-letter': () => ({
    id: 'us-letter',
    name: 'US Letter',
    widthMm: 216,
    heightMm: 279,
    margins: { ...DEFAULT_MARGINS },
    ruling: ruled(),
  }),
};

export function getPreset(id: PaperPresetId): PaperTemplate {
  return PAPER_PRESETS[id]();
}
