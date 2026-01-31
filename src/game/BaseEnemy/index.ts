import { EnemyTypes } from "./types";

export abstract class BaseEnemy {
  speed: number;
  type: EnemyTypes;
  spritePath: string;
  sprite: Phaser.GameObjects.Image;
  width: number = 100;
  height: number = 150;

  abstract move(): void;
  abstract getDistanceToHouse(): void;

  setSprite(x: number, y: number, scene: Phaser.Scene): void {
    this.sprite = scene.add.image(x, y, this.spritePath);
    this.sprite.displayWidth = this.width;
    this.sprite.displayHeight = this.height;
  }
  /**
   * Returns true if this enemy's sprite has fully left the screen (any edge),
   * using sprite origin, width/height, and position.
   */
  isOutOfBounds(scene: Phaser.Scene): boolean {
    const { sprite } = this;
    if (!sprite || !sprite.scene) return true;
    const w = sprite.displayWidth;
    const h = sprite.displayHeight;
    const ox = sprite.originX;
    const oy = sprite.originY;
    const left = sprite.x - w * ox;
    const right = sprite.x + w * (1 - ox);
    const top = sprite.y - h * oy;
    const bottom = sprite.y + h * (1 - oy);
    const width = scene.scale.width;
    const height = scene.scale.height;
    return right < 0 || left > width || bottom < 0 || top > height;
  }

  /** Removes this enemy's sprite from the scene. Caller should remove from spawn list. */
  removeFromScene(): void {
    if (this.sprite.scene) {
      console.log("[BaseEnemy] Enemy destroyed", this.type);
      this.sprite.destroy();
    }
  }
}
