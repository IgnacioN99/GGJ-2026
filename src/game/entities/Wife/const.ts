import { WifeEventTypes } from './type';
import type { SoundAddedAction, SoundReducedAction } from './type';

/** Tope de sonido soportable por defecto */
export const DEFAULT_MAX_SOUND = 100;

const soundAdded = (payload: number): SoundAddedAction => ({
  type: WifeEventTypes.SoundAdded,
  payload
});

const soundReduced = (payload: number): SoundReducedAction => ({
  type: WifeEventTypes.SoundReduced,
  payload
});

export { WifeEventTypes, soundAdded, soundReduced };
