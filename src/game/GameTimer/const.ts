import type { FinishedAction } from './type';
import { GameTimerEventTypes } from './type';

/** Duración total del juego en segundos (aprox. 20 minutos). */
export const GAME_DURATION_SECONDS = 10;

const gameTimerFinished = (): FinishedAction => ({
  type: GameTimerEventTypes.Finished
});

export { GameTimerEventTypes, gameTimerFinished };
