import { CascabelEnemy } from "../BaseEnemy/CascabelEnemy";
import { BaseEnemy } from "../BaseEnemy/index";
import { Game } from "../scenes/Game";

const SPAWN_X_OFFSET = 50;

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
      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      console.log("[EnemySpawner] Enemy spawned", enemy.type);
      return;
    }
  }

  public spawnEnemyOnScreen(
    scene: Game,
    level: number,
    startBoardY: number,
  ): void {
    const enemy = new CascabelEnemy();
    // pick a random lane (0 to 3)
    const lane = Math.floor(Math.random() * 4);
    const x = scene.scale.width;
    const laneHeight = (scene.scale.height - startBoardY) / 4;
    const y = startBoardY + laneHeight * lane;

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
