import { Scene } from "phaser";
import { CascabelEnemy } from "../BaseEnemy/CascabelEnemy";
import { BaseEnemy } from "../BaseEnemy/index";
import { Board } from "../Board";

export class EnemySpawner {
  private spawnedEnemies: BaseEnemy[] = [];
  private board: Board;

  public forceSpawn: boolean = false;

  constructor(board: Board) {
    this.board = board;
  }

  private introSpawnStrategy(scene: Scene, x: number, y: number): void {
    const enemy = new CascabelEnemy();
    if (this.spawnedEnemies.length === 0 || this.forceSpawn) {
      this.forceSpawn = false;
      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      console.log("[EnemySpawner] Enemy spawned", enemy.type);
      return;
    }
  }

  public spawnEnemyOnScreen(scene: Scene, level: number): void {
    // pick a random lane
    const randomRow = Math.floor(Math.random() * this.board.getTotalRows());
    const { y } = this.board.cellToWorld(0, randomRow);
    const x = scene.scale.width;

    // spawn
    if (level === 1) {
      this.introSpawnStrategy(scene, x, y);
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
