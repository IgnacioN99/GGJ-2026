import { Events } from 'phaser';
import {
  DEFAULT_MAX_SOUND,
  WIFE_EVENT_SOUND_ADDED,
  WIFE_EVENT_SOUND_REDUCED,
  WIFE_EVENT_OVERWHELMED,
  WIFE_EVENT_RESET
} from './const';

/**
 * Entidad que representa la vida/base que el jugador defiende.
 * La Wife tiene un tope de sonido soportable; si el sonido lo supera, pierde el jugador.
 * No tiene representación visual en el juego, solo estado y eventos.
 */
export class Wife extends Events.EventEmitter {
  private _currentSound: number;
  private _maxSound: number;

  constructor(maxSound: number = DEFAULT_MAX_SOUND) {
    super();
    this._maxSound = Math.max(1, maxSound);
    this._currentSound = 0;
  }

  get currentSound(): number {
    return this._currentSound;
  }

  get maxSound(): number {
    return this._maxSound;
  }

  /** Añade sonido. Emite WIFE_EVENT_SOUND_ADDED y WIFE_EVENT_OVERWHELMED si supera el tope. */
  addSound(amount: number): void {
    if (amount <= 0 || this.isOverwhelmed()) return;

    const prev = this._currentSound;
    this._currentSound = Math.min(this._maxSound, this._currentSound + amount);
    const actualAdded = this._currentSound - prev;

    if (actualAdded > 0) {
      this.emit(WIFE_EVENT_SOUND_ADDED, {
        amount: actualAdded,
        currentSound: this._currentSound,
        maxSound: this._maxSound
      });
    }

    if (this._currentSound >= this._maxSound) {
      this.emit(WIFE_EVENT_OVERWHELMED);
    }
  }

  /** Reduce sonido (ej. cuando hay calma). Emite WIFE_EVENT_SOUND_REDUCED. */
  reduceSound(amount: number): void {
    if (amount <= 0 || this._currentSound <= 0) return;

    const prev = this._currentSound;
    this._currentSound = Math.max(0, this._currentSound - amount);
    const actualReduced = prev - this._currentSound;

    if (actualReduced > 0) {
      this.emit(WIFE_EVENT_SOUND_REDUCED, {
        amount: actualReduced,
        currentSound: this._currentSound,
        maxSound: this._maxSound
      });
    }
  }

  isOverwhelmed(): boolean {
    return this._currentSound >= this._maxSound;
  }

  /** Reinicia el sonido a 0. Emite WIFE_EVENT_RESET. */
  reset(): void {
    this._currentSound = 0;
    this.emit(WIFE_EVENT_RESET, { currentSound: this._currentSound, maxSound: this._maxSound });
  }
}

export type { WifeState } from './type';
export {
  DEFAULT_MAX_SOUND,
  WIFE_EVENT_SOUND_ADDED,
  WIFE_EVENT_SOUND_REDUCED,
  WIFE_EVENT_OVERWHELMED,
  WIFE_EVENT_RESET
} from './const';
