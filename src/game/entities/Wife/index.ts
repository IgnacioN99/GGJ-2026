import { Events } from 'phaser';
import { DEFAULT_MAX_SOUND, WifeEventTypes } from './const';
import type { SoundAddedAction, SoundReducedAction } from './type';

/**
 * Entidad que representa la vida/base que el jugador defiende.
 * La Wife tiene un tope de sonido soportable; si el sonido lo supera, pierde el jugador.
 * No tiene representación visual en el juego, solo estado y eventos.
 */
export class Wife extends Events.EventEmitter {
  private _currentSound: number;
  private _maxSound: number;

  constructor(maxSound: number = DEFAULT_MAX_SOUND, scene: Phaser.Scene) {
    super();
    this._maxSound = Math.max(1, maxSound);
    this._currentSound = 0;

    scene.events.on(WifeEventTypes.SoundAdded, (action: SoundAddedAction) => this.addSound(action.payload), this);
    scene.events.on(WifeEventTypes.SoundReduced, (action: SoundReducedAction) => this.reduceSound(action.payload), this);
  }

  get currentSound(): number {
    return this._currentSound;
  }

  get maxSound(): number {
    return this._maxSound;
  }

  /** Añade sonido. Emite SoundAdded y Overwhelmed si supera el tope. */
  addSound(amount: number): void {
    if (amount <= 0 || this.isOverwhelmed()) return;

    const prev = this._currentSound;
    this._currentSound = Math.min(this._maxSound, this._currentSound + amount);
    const actualAdded = this._currentSound - prev;

    if (actualAdded > 0) {
      this.emit(WifeEventTypes.SoundAdded, {
        type: WifeEventTypes.SoundAdded,
        payload: {
          amount: actualAdded,
          currentSound: this._currentSound,
          maxSound: this._maxSound
        }
      });
    }

    if (this._currentSound >= this._maxSound) {
      this.emit(WifeEventTypes.Overwhelmed, { type: WifeEventTypes.Overwhelmed });
    }
  }

  /** Reduce sonido (ej. cuando hay calma). Emite SoundReduced. */
  reduceSound(amount: number): void {
    if (amount <= 0 || this._currentSound <= 0) return;

    const prev = this._currentSound;
    this._currentSound = Math.max(0, this._currentSound - amount);
    const actualReduced = prev - this._currentSound;

    if (actualReduced > 0) {
      this.emit(WifeEventTypes.SoundReduced, {
        type: WifeEventTypes.SoundReduced,
        payload: {
          amount: actualReduced,
          currentSound: this._currentSound,
          maxSound: this._maxSound
        }
      });
    }
  }

  isOverwhelmed(): boolean {
    return this._currentSound >= this._maxSound;
  }

  /** Reinicia el sonido a 0. Emite WifeEventTypes.Reset. */
  reset(): void {
    this._currentSound = 0;
    this.emit(WifeEventTypes.Reset, {
      type: WifeEventTypes.Reset,
      payload: { currentSound: this._currentSound, maxSound: this._maxSound }
    });
  }
}

export type { WifeState, WifeSceneAction, WifeEmittedAction } from './type';
export {
  DEFAULT_MAX_SOUND,
  WifeEventTypes,
  soundAdded,
  soundReduced,
  WIFE_LIFE_IMAGE_KEYS,
  getWifeLifeImageIndex
} from './const';
