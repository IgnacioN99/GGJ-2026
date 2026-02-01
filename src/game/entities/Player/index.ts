import { Scene } from "phaser";
import type { PlayerDirection } from "./type";
import { MOVE_SPEED, PlayerEventTypes } from "./type";
import type { BaseItem } from "../Item";
import { ItemEventTypes, ItemTypes } from "../Item";

// ─── Sprite del jugador (movimiento + uso de items) ──────────────────────────

class Player extends Phaser.GameObjects.Sprite {
  private targetX: number;
  private targetY: number;
  public isMoving: boolean = false;
  private moveSpeed: number = MOVE_SPEED;
  private _equippedItem: BaseItem | null = null; // Item equipado; null si ninguno
  private _isBlocked: boolean = false; // true mientras usa un item (no puede moverse)
  private _isInGlobalCooldown: boolean = false; // true = no puede equipar otro item
  private _itemInGlobalCooldown: BaseItem | null = null; // Referencia para desuscribirse cuando termine el cooldown
  /** Si true, permite moverse sin item (p. ej. cuando no hay enemigos). Lo establece la escena. */
  private _allowMoveWithoutItem: boolean = false;
  /** Si true, volumen casi al tope (wife a punto de despertar); se muestra sprite sorpresa en idle. */
  private _aboutToLose: boolean = false;

  /** Inicializa sprite y dimensiones; posición inicial = destino. */
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "player", 0);
    this.targetX = x;
    this.targetY = y;
    this.setOrigin(0.5, 1);
    this.displayWidth = 75;
    this.displayHeight = 150;
  }

  get equippedItem(): BaseItem | null {
    return this._equippedItem;
  }

  get hasEquippedItem(): boolean {
    return this._equippedItem !== null;
  }

  get isBlocked(): boolean {
    return this._isBlocked;
  }

  get isInGlobalCooldown(): boolean {
    return this._isInGlobalCooldown;
  }

  /** Puede moverse = (tiene item equipado o allowMoveWithoutItem) y no está bloqueado. Sin item solo puede si no hay enemigos (la escena pone allowMoveWithoutItem). */
  get canMove(): boolean {
    return (this.hasEquippedItem || this._allowMoveWithoutItem) && !this._isBlocked;
  }

  /** Permite o no moverse sin item (p. ej. cuando no hay enemigos). Lo llama la escena cada frame. */
  setAllowMoveWithoutItem(allow: boolean): void {
    this._allowMoveWithoutItem = allow;
  }

  /** Indica si el volumen está casi al tope (wife a punto de despertar). En idle se muestra sprite sorpresa. */
  setAboutToLose(aboutToLose: boolean): void {
    if (this._aboutToLose === aboutToLose) return;
    this._aboutToLose = aboutToLose;
    if (this.isIdle()) this.restoreDefaultSprite();
  }

  /** Idle = no moviendo, no bloqueado, no en cooldown global (sprite mostrado es default/sorpresa). */
  private isIdle(): boolean {
    return !this.isMoving && !this._isBlocked && !this._isInGlobalCooldown;
  }

  /** Puede equipar = sin cooldown global, sin item equipado y no bloqueado. */
  get canEquipItem(): boolean {
    return !this._isInGlobalCooldown && !this.hasEquippedItem && !this._isBlocked;
  }

  /** Equipa un item; suscribe a sus eventos. Retorna false si no puede equipar. */
  equipItem(item: BaseItem): boolean {
    if (!this.canEquipItem) {
      console.log("[Player] No puede equipar item:", {
        isInGlobalCooldown: this._isInGlobalCooldown,
        hasEquippedItem: this.hasEquippedItem,
        isBlocked: this._isBlocked,
      });
      return false;
    }

    if (!item.equip()) {
      console.log("[Player] Item rechazó ser equipado");
      return false;
    }

    this._equippedItem = item;

    /**
     * Suscripciones a eventos del item:
     * - UseStarted: el item empieza a usarse → bloquea al jugador (no puede moverse ni equipar otro).
     * - UseCompleted: el item terminó de usarse → desbloquea; si blocksItems, activa cooldown global.
     * - CooldownComplete: el cooldown del item terminó → si hay cooldown global, lo finaliza y permite equipar de nuevo.
     */
    item.on(ItemEventTypes.UseStarted, this.onItemUseStarted, this);
    item.on(ItemEventTypes.UseCompleted, this.onItemUseCompleted, this);
    item.on(ItemEventTypes.CooldownComplete, this.onItemCooldownComplete, this);

    this.scene.events.emit(PlayerEventTypes.ItemEquipped, {
      type: PlayerEventTypes.ItemEquipped,
      payload: { itemType: item.itemType },
    });

    console.log("[Player] Item equipado:", item.itemType);
    return true;
  }

  /** Quita el item actual, se desuscribe de sus eventos y emite ItemUnequipped. */
  unequipItem(): void {
    if (!this._equippedItem) return;

    const item = this._equippedItem;

    // Desuscribirse de los mismos eventos suscritos en equipItem()
    item.off(ItemEventTypes.UseStarted, this.onItemUseStarted, this);
    item.off(ItemEventTypes.UseCompleted, this.onItemUseCompleted, this);
    item.off(ItemEventTypes.CooldownComplete, this.onItemCooldownComplete, this);

    item.unequip();
    this._equippedItem = null;

    this.scene.events.emit(PlayerEventTypes.ItemUnequipped, {
      type: PlayerEventTypes.ItemUnequipped,
      payload: { itemType: item.itemType },
    });

    console.log("[Player] Item desequipado:", item.itemType);
  }

  /** UseStarted: bloquea al jugador y emite Blocked. */
  private onItemUseStarted(): void {
    this._isBlocked = true;
    this.isMoving = false;
    this.scene.events.emit(PlayerEventTypes.Blocked, {
      type: PlayerEventTypes.Blocked,
    });
    console.log("[Player] Bloqueado (usando item)");
  }

  /** UseCompleted: desbloquea, desequipa, restaura sprite si era escoba; si blocksItems, activa cooldown global. */
  private onItemUseCompleted(): void {
    const item = this._equippedItem;
    this._equippedItem = null;

    // Restaurar sprite por defecto si se usó escoba o manguera
    if (item?.itemType === ItemTypes.ESCOBA || item?.itemType === ItemTypes.MANGUERA) {
      this.restoreDefaultSprite();
    }

    // Desuscribirse de UseStarted/UseCompleted para evitar listeners duplicados si se vuelve a equipar.
    // CooldownComplete lo mantenemos si hay cooldown global, para poder desbloquear cuando termine.
    if (item) {
      item.off(ItemEventTypes.UseStarted, this.onItemUseStarted, this);
      item.off(ItemEventTypes.UseCompleted, this.onItemUseCompleted, this);
    }

    // Siempre desbloquear al terminar el uso
    this._isBlocked = false;
    this.scene.events.emit(PlayerEventTypes.Unblocked, {
      type: PlayerEventTypes.Unblocked,
    });

    // Solo items con blocksItems activan cooldown global (ej. manguera).
    const triggersGlobalCooldown = item ? item.blocksItems : true;
    if (triggersGlobalCooldown) {
      this._isInGlobalCooldown = true;
      this._itemInGlobalCooldown = item; // Para desuscribirse de CooldownComplete cuando termine
      this.switchToCansadoSprite();
      this.scene.events.emit(PlayerEventTypes.GlobalCooldownStarted, {
        type: PlayerEventTypes.GlobalCooldownStarted,
      });
      console.log("[Player] Desbloqueado, entrando en cooldown global");
    } else {
      if (item) {
        item.off(ItemEventTypes.CooldownComplete, this.onItemCooldownComplete, this);
      }
      console.log("[Player] Item usado (sin blocksItems), puede equipar otro de inmediato");
    }
  }

  /** CooldownComplete: termina cooldown global, restaura sprite por defecto y permite equipar items de nuevo. */
  private onItemCooldownComplete(): void {
    // Solo terminar cooldown global si estaba activo
    if (this._isInGlobalCooldown) {
      this._isInGlobalCooldown = false;
      this.restoreDefaultSprite();
      // Desuscribirse del item que activó el cooldown global
      if (this._itemInGlobalCooldown) {
        this._itemInGlobalCooldown.off(ItemEventTypes.CooldownComplete, this.onItemCooldownComplete, this);
        this._itemInGlobalCooldown = null;
      }
      this.scene.events.emit(PlayerEventTypes.GlobalCooldownEnded, {
        type: PlayerEventTypes.GlobalCooldownEnded,
      });
      console.log("[Player] Cooldown global terminado");
    }
  }

  /** Mueve hacia (worldX, worldY). Solo funciona con item equipado y no bloqueado. */
  moveTo(worldX: number, worldY: number): boolean {
    if (!this.canMove) {
      console.log("[Player] No puede moverse:", {
        hasEquippedItem: this.hasEquippedItem,
        isBlocked: this._isBlocked,
      });
      return false;
    }

    this.targetX = worldX;
    this.targetY = worldY;
    this.isMoving = true;
    this.play("player-walk");
    return true;
  }

  /** Dirección hacia el destino (up/down/left/right) o null si está cerca. */
  getDirection(): PlayerDirection | null {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx > absDy) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  }

  /** Loop de Phaser: actualiza item equipado, avanza movimiento, usa item al llegar. */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this._equippedItem) {
      this._equippedItem.update(delta);
    }

    if (!this.isMoving || this._isBlocked) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      this.isMoving = false;
      this.onArrivedAtDestination();
      return;
    }

    const speed = (this.moveSpeed * delta) / 1000;
    const moveX = (dx / dist) * speed;
    const moveY = (dy / dist) * speed;
    this.x += moveX;
    this.y += moveY;
  }

  /** Al llegar: emite ArrivedAtDestination, restaura sprite de idle, cambia a escoba/manguera si toca, y usa el item si está listo. */
  private onArrivedAtDestination(): void {
    this.restoreDefaultSprite();
    this.scene.events.emit(PlayerEventTypes.ArrivedAtDestination, {
      type: PlayerEventTypes.ArrivedAtDestination,
      payload: { x: this.x, y: this.y },
    });
    console.log("[Player] Llegó al destino:", this.x, this.y);

    // Cambiar sprite según el item equipado antes de usarlo
    if (this._equippedItem?.itemType === ItemTypes.ESCOBA) {
      this.switchToEscobaSprite();
    } else if (this._equippedItem?.itemType === ItemTypes.MANGUERA) {
      this.switchToMangueraSprite();
    }

    // Si tiene item equipado, intentar usarlo automáticamente
    if (this._equippedItem && this._equippedItem.isReady) {
      console.log("[Player] Usando item automáticamente al llegar");
      this._equippedItem.tryUse();
    }
  }

  /** Cambia al sprite de escoba y reproduce la animación de 2 frames. */
  private switchToEscobaSprite(): void {
    this.play("player-escoba-use");
  }

  /** Cambia al sprite de manguera y reproduce la animación de 2 frames. */
  private switchToMangueraSprite(): void {
    this.play("player-manguera-use");
  }

  /** Cambia al sprite cansado (cooldown global tras usar manguera). */
  private switchToCansadoSprite(): void {
    this.stop();
    this.setTexture("player-cansado");
  }

  /** Restaura el sprite por defecto (o sorpresa si aboutToLose). Detiene la animación (que repetía durante el uso del item). */
  private restoreDefaultSprite(): void {
    this.stop();
    if (this._aboutToLose) {
      this.setTexture("player-sorpresa");
    } else {
      this.setTexture("player", 0);
    }
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}

export type {
  PlayerDirection,
  PlayerEmittedAction,
  ArrivedAtDestinationAction,
  BlockedAction,
  UnblockedAction,
} from "./type";
export { PlayerEventTypes } from "./type";
export default Player;
