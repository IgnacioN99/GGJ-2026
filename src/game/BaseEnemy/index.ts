import type Player from "../entities/Player";
import { EnemyTypes } from "./types";

export abstract class BaseEnemy {
  speed: number = 0.5;
  type: EnemyTypes;
  spritePath: string;
  sprite: Phaser.GameObjects.Image;
  width: number = 100;
  height: number = 100;
  life: number = 100;
  canMove: boolean = true;

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
    this.sprite = scene.add.image(x, y, this.spritePath);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.displayWidth = this.width;
    this.sprite.displayHeight = this.height;
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
