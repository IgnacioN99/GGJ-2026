import { CascabelEnemy } from "../BaseEnemy/CascabelEnemy";
import { BaseEnemy } from "../BaseEnemy/index";
import { cellToWorld, DEFAULT_BOARD_CONFIG } from "../Board";
import { Game } from "../scenes/Game";

export class EnemySpawner {
  private spawnedEnemies: BaseEnemy[] = [];
  public forceSpawn: boolean = false;

  private introSpawnStrategy(
    scene: Game,
    enemy: BaseEnemy,
    x: number,
    y: number,
  ): void {
    if (this.spawnedEnemies.length === 0 || this.forceSpawn) {
      this.forceSpawn = false;
      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      return;
    }
  }

  public spawnEnemyOnScreen(scene: Game, level: number): void {
    const enemy = new CascabelEnemy();
    const fila = Math.floor(Math.random() * 4);
    const { y } = cellToWorld(0, fila, scene, DEFAULT_BOARD_CONFIG);
    const x = scene.scale.width;

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
