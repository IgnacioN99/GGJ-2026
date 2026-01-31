import { EnemyTypes } from "./types";

export abstract class BaseEnemy {
  speed: number;
  type: EnemyTypes;
  spritePath: string;
  sprite: Phaser.GameObjects.Image;
  width: number = 50;
  height: number = 50;

  abstract move(): void;
  abstract getDistanceToHouse(): void;

  setSprite(x: number, y: number, scene: Phaser.Scene): void {
    this.sprite = scene.add.image(x, y, this.spritePath);
    this.sprite.displayWidth = this.width;
    this.sprite.displayHeight = this.height;
  }
  /**
   * Returns true if this enemy's sprite has fully left the screen
   */
  isOutOfBounds(_scene: Phaser.Scene): boolean {
    return this.sprite.x < 0;
  }

  /** Removes this enemy's sprite from the scene. Caller should remove from spawn list. */
  removeFromScene(): void {
    if (this.sprite.scene) {
      console.log("[BaseEnemy] Enemy destroyed", this.type);
      this.sprite.destroy();
    }
  }
}
