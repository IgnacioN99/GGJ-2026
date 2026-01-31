import { Scene } from "phaser";
import { CascabelEnemy } from "../BaseEnemy/CascabelEnemy";
import { BaseEnemy } from "../BaseEnemy/index";
import { Board } from "../Board";
import { TamborEnemy } from "../BaseEnemy/TamborEnemy";
import { DiabloEnemy } from "../BaseEnemy/DiabloEnemy";
import type Player from "../entities/Player";

export class EnemySpawner {
  private introEnemies: BaseEnemy[] = [
    new CascabelEnemy(),
    new DiabloEnemy(),
    new TamborEnemy(),
  ];
  private spawnedEnemies: BaseEnemy[] = [];
  private board: Board;

  public forceSpawn: boolean = false;

  constructor(board: Board) {
    this.board = board;
  }

  private realSpawnStrategy(scene: Scene, x: number, y: number): void {
    const enemy = new CascabelEnemy();
    if (this.spawnedEnemies.length === 0 || this.forceSpawn) {
      this.forceSpawn = false;
      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      console.log("[EnemySpawner] Enemy spawned", enemy.type);
      return;
    }
  }

  private introSpawnStrategy(scene: Scene, x: number, y: number): void {
    if (this.spawnedEnemies.length === 0 || this.forceSpawn) {
      const enemy = this.introEnemies.pop();
      if (!enemy) return;
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
    } else if (level === 2) {
      this.realSpawnStrategy(scene, x, y);
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
      enemy.move();
    });
  }

  /** Checks overlap between player and spawned enemies; calls onCollisionWithPlayer when overlapping. */
  public checkPlayerCollisions(player: Player): void {
    if (player.isMoving) return;
    const playerCell = this.board.worldToCell(player.getX(), player.getY());
    if (!playerCell) return;
    const { col: playerCol, row: playerRow } = playerCell;
    console.log("playerCol:", playerCol, "playerRow:", playerRow);
    for (const enemy of this.spawnedEnemies) {
      const enemyCell = this.board.worldToCell(enemy.sprite.x, enemy.sprite.y);
      if (!enemyCell) continue;
      const { col: enemyCol, row: enemyRow } = enemyCell;
      console.log("enemyCol:", enemyCol, "enemyRow:", enemyRow);
      if (
        enemyRow === playerRow &&
        (enemyCol === playerCol || enemyCol === playerCol + 1)
      ) {
        enemy.onCollisionWithPlayer(player);
      }
    }
  }
}
