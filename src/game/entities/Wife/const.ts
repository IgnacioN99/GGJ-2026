import { WifeEventTypes } from './type';
import type { SoundAddedAction, SoundReducedAction } from './type';

/** Tope de sonido soportable por defecto */
export const DEFAULT_MAX_SOUND = 100;

/** Claves de textura para la barra de vida (1 = 100% vida, 4 = 0% vida) */
export const WIFE_LIFE_IMAGE_KEYS = ['wife_life_1', 'wife_life_2', 'wife_life_3', 'wife_life_4'] as const;

/**
 * Índice de imagen de vida (1-4) a partir del estado de sonido.
 * currentSound 0 → vida 100% → imagen 1; currentSound = maxSound → imagen 4.
 */
export function getWifeLifeImageIndex(currentSound: number, maxSound: number): 1 | 2 | 3 | 4 {
  if (maxSound <= 0) return 1;
  const lifeRatio = 1 - currentSound / maxSound;
  const index = Math.min(4, Math.max(1, 5 - Math.ceil(lifeRatio * 4)));
  return index as 1 | 2 | 3 | 4;
}

const soundAdded = (payload: number): SoundAddedAction => ({
  type: WifeEventTypes.SoundAdded,
  payload
});

const soundReduced = (payload: number): SoundReducedAction => ({
  type: WifeEventTypes.SoundReduced,
  payload
});

export { WifeEventTypes, soundAdded, soundReduced };
