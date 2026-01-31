import { Scene } from "phaser";
import { CascabelEnemy } from "../BaseEnemy/CascabelEnemy";
import { BaseEnemy } from "../BaseEnemy/index";

const SPAWN_X_OFFSET: number = 50;
let SPAWN_Y_OFFSET: number = 50;

export class EnemySpawner {
  private spawnedEnemies: BaseEnemy[] = [];
  public forceSpawn: boolean = false;

  private introSpawnStrategy(
    scene: Scene,
    enemy: BaseEnemy,
    x: number,
    y: number,
  ): void {
    if (this.spawnedEnemies.length === 0 || this.forceSpawn) {
      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      console.log("[EnemySpawner] Enemy spawned", enemy.type);
      return;
    }
  }

  public spawnEnemyOnScreen(scene: Scene, level: number): void {
    const enemy = new CascabelEnemy();
    // pick a random lane (1 to 4)
    const lane = Math.floor(Math.random() * 4);
    const x = scene.scale.width + SPAWN_X_OFFSET;

    SPAWN_Y_OFFSET = enemy.height / 2;
    const y = (scene.scale.height / 4) * lane + SPAWN_Y_OFFSET + 10;

    // spawn
    if (level === 1) {
      this.introSpawnStrategy(scene, enemy, x, y);
    }
  }

  public getSpawnedEnemies(): BaseEnemy[] {
    return this.spawnedEnemies;
  }

  public moveEnemies(scene: Phaser.Scene): void {
    // remove enemies that are out of bounds
    this.spawnedEnemies = this.spawnedEnemies.filter((enemy) => {
      if (enemy.isOutOfBounds(scene)) {
        enemy.removeFromScene();
        return false;
      }
      return true;
    });
    // move enemies
    this.spawnedEnemies.forEach((enemy) => {
      enemy.sprite.x -= enemy.speed;
    });
  }
}
