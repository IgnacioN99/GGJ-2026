import { Events } from 'phaser';
import { GAME_DURATION_SECONDS, GameTimerEventTypes } from './const';
import type { GameTimerConfig, GameTimerState } from './type';

/**
 * Modela el tiempo de partida. La partida dura aproximadamente 20 minutos;
 * cuando termina el tiempo, el jugador gana (se emite GameTimerEventTypes.Finished).
 * La escena debe llamar a update(delta) en cada frame desde Scene.update().
 */
export class GameTimer extends Events.EventEmitter {
  private _elapsedMs = 0;
  private _durationSeconds: number;
  private _isPaused = false;
  private _hasFinished = false;

  constructor(config: GameTimerConfig = {}) {
    super();
    this._durationSeconds = config.durationSeconds ?? GAME_DURATION_SECONDS;
  }

  /** Avanza el tiempo. Llamar desde Scene.update(time, delta). */
  update(delta: number): void {
    if (this._isPaused || this._hasFinished) return;

    this._elapsedMs += delta;
    const durationMs = this._durationSeconds * 1000;

    if (this._elapsedMs >= durationMs) {
      this._elapsedMs = durationMs;
      this._hasFinished = true;
      this.emit(GameTimerEventTypes.Finished, { type: GameTimerEventTypes.Finished });
    }
  }

  /** Devuelve el estado actual del tiempo (tiempo transcurrido, restante, si terminó). */
  getCurrentTime(): GameTimerState {
    const elapsedSeconds = this._elapsedMs / 1000;
    const remainingSeconds = Math.max(0, this._durationSeconds - elapsedSeconds);
    return {
      elapsedSeconds,
      durationSeconds: this._durationSeconds,
      remainingSeconds,
      isFinished: this._hasFinished
    };
  }

  /** Tiempo transcurrido en segundos. */
  get elapsedSeconds(): number {
    return this._elapsedMs / 1000;
  }

  /** Tiempo restante en segundos (>= 0). */
  get remainingSeconds(): number {
    return Math.max(0, this._durationSeconds - this._elapsedMs / 1000);
  }

  /** Duración total en segundos. */
  get durationSeconds(): number {
    return this._durationSeconds;
  }

  /** Si la partida ya terminó por tiempo (victoria). */
  get isFinished(): boolean {
    return this._hasFinished;
  }

  /** Pausa el temporizador. */
  pause(): void {
    this._isPaused = true;
  }

  /** Reanuda el temporizador. */
  resume(): void {
    this._isPaused = false;
  }

  /** Si el temporizador está pausado. */
  get isPaused(): boolean {
    return this._isPaused;
  }
}

export type { GameTimerState, GameTimerConfig, GameTimerEmittedAction, FinishedAction } from './type';
export { GAME_DURATION_SECONDS, GameTimerEventTypes, gameTimerFinished } from './const';
