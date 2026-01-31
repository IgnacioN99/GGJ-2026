/** Estado actual del tiempo en el juego. */
export interface GameTimerState {
  /** Tiempo transcurrido en segundos. */
  elapsedSeconds: number;
  /** Duración total en segundos. */
  durationSeconds: number;
  /** Tiempo restante en segundos (>= 0). */
  remainingSeconds: number;
  /** Si el tiempo de partida ha terminado (victoria por tiempo). */
  isFinished: boolean;
}

/** Configuración opcional del temporizador. */
export interface GameTimerConfig {
  /** Duración total en segundos. Por defecto GAME_DURATION_SECONDS. */
  durationSeconds?: number;
}

enum GameTimerEventTypes {
  /** Emitido cuando se agota el tiempo de partida (el jugador gana). */
  Finished = 'gameTimer:finished'
}

/** Acción: tiempo de partida agotado (GameTimer → listeners). Sin payload. */
type FinishedAction = {
  type: GameTimerEventTypes.Finished;
};

/** Acciones que el GameTimer emite (eventos de estado). */
type GameTimerEmittedAction = FinishedAction;

export { GameTimerEventTypes };
export type { GameTimerEmittedAction, FinishedAction };
