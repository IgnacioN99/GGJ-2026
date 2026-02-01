import { Events } from "phaser";
import type { ItemConfig, ItemState, ItemEventPayload } from "./type";
import { ItemEventTypes, ItemTypes } from "./type";

/**
 * Clase abstracta base para items con cooldown y tiempo de uso.
 * Extiende EventEmitter para emitir eventos de estado.
 *
 * Flujo:
 * 1. equip() - Equipa el item
 * 2. tryUse() - Inicia el uso si está "ready"
 * 3. Durante useDurationMs el item está "using"
 * 4. Al terminar el uso, se ejecuta onUseEffect() y emite UseCompleted
 * 5. Entra en cooldown por cooldownMs
 * 6. Al terminar cooldown emite CooldownComplete y vuelve a "ready"
 */
export abstract class BaseItem extends Events.EventEmitter {
  readonly cooldownMs: number;
  readonly useDurationMs: number;
  readonly blocksItems: boolean;
  abstract readonly itemType: ItemTypes;

  private _state: ItemState = "ready";
  private _useProgressMs = 0;
  private _cooldownRemainingMs = 0;
  private _isEquipped = false;

  constructor(config: ItemConfig) {
    super();
    this.cooldownMs = config.cooldownMs;
    this.useDurationMs = config.useDurationMs;
    this.blocksItems = config.blocksItems ?? true;
  }

  get state(): ItemState {
    return this._state;
  }

  get isReady(): boolean {
    return this._state === "ready";
  }

  get isUsing(): boolean {
    return this._state === "using";
  }

  get isOnCooldown(): boolean {
    return this._state === "cooldown";
  }

  get isEquipped(): boolean {
    return this._isEquipped;
  }

  /** Progreso del uso actual (0 a 1). 0 si no está usando. */
  get useProgress(): number {
    if (this._state !== "using") return 0;
    return Math.min(1, this._useProgressMs / this.useDurationMs);
  }

  /** Progreso del cooldown restante (0 a 1). 0 si no está en cooldown. */
  get cooldownProgress(): number {
    if (this._state !== "cooldown") return 0;
    return 1 - this._cooldownRemainingMs / this.cooldownMs;
  }

  /** Tiempo restante de cooldown en ms */
  get cooldownRemainingMs(): number {
    return this._cooldownRemainingMs;
  }

  /** Payload base para eventos */
  protected getEventPayload(): ItemEventPayload {
    return { itemType: this.itemType };
  }

  /** Equipa el item. Retorna true si se equipó correctamente. */
  equip(): boolean {
    if (this._isEquipped) return false;
    if (this._state === "cooldown") return false;

    this._isEquipped = true;
    this.emit(ItemEventTypes.Equipped, {
      type: ItemEventTypes.Equipped,
      payload: this.getEventPayload(),
    });
    return true;
  }

  /** Desequipa el item. */
  unequip(): void {
    if (!this._isEquipped) return;

    this._isEquipped = false;
    this.emit(ItemEventTypes.Unequipped, {
      type: ItemEventTypes.Unequipped,
      payload: this.getEventPayload(),
    });
  }

  /**
   * Intenta usar el item. Retorna true si el uso comenzó, false si no está listo.
   */
  tryUse(): boolean {
    if (this._state !== "ready") return false;
    if (!this._isEquipped) return false;

    this._state = "using";
    this._useProgressMs = 0;
    this.emit(ItemEventTypes.UseStarted, {
      type: ItemEventTypes.UseStarted,
      payload: this.getEventPayload(),
    });
    this.onUseStart?.();
    return true;
  }

  /**
   * Actualiza los temporizadores. Llamar desde Scene.update(time, delta).
   */
  update(delta: number): void {
    if (this._state === "using") {
      this._useProgressMs += delta;
      if (this._useProgressMs >= this.useDurationMs) {
        this._state = "cooldown";
        this._cooldownRemainingMs = this.cooldownMs;
        this.onUseEffect();
        // Desequipar automáticamente al terminar el uso
        this._isEquipped = false;
        this.emit(ItemEventTypes.UseCompleted, {
          type: ItemEventTypes.UseCompleted,
          payload: this.getEventPayload(),
        });
        this.emit(ItemEventTypes.Unequipped, {
          type: ItemEventTypes.Unequipped,
          payload: this.getEventPayload(),
        });
      }
    } else if (this._state === "cooldown") {
      this._cooldownRemainingMs -= delta;
      if (this._cooldownRemainingMs <= 0) {
        this._state = "ready";
        this._cooldownRemainingMs = 0;
        this.emit(ItemEventTypes.CooldownComplete, {
          type: ItemEventTypes.CooldownComplete,
          payload: this.getEventPayload(),
        });
        this.onCooldownComplete?.();
      }
    }
  }

  /**
   * Llamado cuando el tiempo de uso termina. Implementar el efecto del item aquí.
   */
  protected abstract onUseEffect(): void;

  /**
   * Opcional: llamado cuando comienza el uso (útil para feedback visual).
   */
  protected onUseStart?(): void;

  /**
   * Opcional: llamado cuando el cooldown termina.
   */
  protected onCooldownComplete?(): void;
}

export type {
  ItemConfig,
  ItemState,
  ItemEventPayload,
  ItemEmittedAction,
  UseStartedAction,
  UseCompletedAction,
  CooldownCompleteAction,
  EquippedAction,
  UnequippedAction,
} from "./type";
export { ItemEventTypes, ItemTypes } from "./type";
