import type Player from "../entities/Player";
import { EnemyTypes } from "./types";

/** Contribución máxima de sonido por enemigo (1 al spawn, hasta este valor al acercarse). */
export const ENEMY_MAX_SOUND_CONTRIBUTION = 10;

/** Frame rate for the sprite/sprite2 walk animation. */
const ENEMY_WALK_FRAME_RATE = 4;

export abstract class BaseEnemy {
  speed: number = 0.5;
  type: EnemyTypes;
  spritePath: string;
  sprite: Phaser.GameObjects.Sprite;
  width: number = 125;
  height: number = 150;
  life: number = 100;
  canMove: boolean = true;
  /** Posición X donde spawneó (origen del tablero). */
  spawnX: number = 0;
  /** Contribución actual al sonido de la Wife (1..ENEMY_MAX_SOUND_CONTRIBUTION). 0 = aún no registrado. */
  soundContribution: number = 0;

  move(): void {
    const nextX = this.calculateNextX();

    if (this.getDistanceToHouse() > 270 && this.canMove) {
      this.sprite.x = nextX;
    }
  }

  getDistanceToHouse(): number {
    return this.sprite.x;
  }

  /** Called when this enemy collides with the player. Override in subclasses. */
  onCollisionWithPlayer(_player: Player): void {
    console.log("[BaseEnemy] Enemy collided with player", this.type);
  }

  setSprite(x: number, y: number, scene: Phaser.Scene): void {
    this.spawnX = x;
    const sprite2Path = this.spritePath.replace("sprite.png", "sprite2.png");
    const animKey = `enemy-walk-${this.type}`;

    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: [{ key: this.spritePath }, { key: sprite2Path }],
        frameRate: ENEMY_WALK_FRAME_RATE,
        repeat: -1,
      });
    }

    this.sprite = scene.add.sprite(x, y, this.spritePath);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.displayWidth = this.width;
    this.sprite.displayHeight = this.height;
    this.sprite.play(animKey);
  }

  calculateNextX(): number {
    return this.sprite.x - this.speed;
  }

  /** Removes this enemy's sprite from the scene. Caller should remove from spawn list. */
  removeFromScene(): void {
    if (this.sprite.scene) {
      console.log("[BaseEnemy] Enemy destroyed", this.type);
      this.sprite.destroy();
    }
  }
}
