import { Scene } from "phaser";
import { CascabelEnemy } from "../BaseEnemy/CascabelEnemy";
import { BaseEnemy } from "../BaseEnemy/index";
import { Board } from "../Board";
import { TamborEnemy } from "../BaseEnemy/TamborEnemy";
import { DiabloEnemy } from "../BaseEnemy/DiabloEnemy";
import type Player from "../entities/Player";
import { EnemyTypes } from "../BaseEnemy/types";
import { SECONDS_TO_SPAWN } from "./types";

export class EnemySpawner {
  private introEnemies: BaseEnemy[] = [
    new CascabelEnemy(),
    new DiabloEnemy(),
    new TamborEnemy(),
  ];
  private spawnedEnemies: BaseEnemy[] = [];
  private board: Board;
  private spawnCooldown: number = 0;
  private COOLDOWN_TIME_MS: number = SECONDS_TO_SPAWN * 1000;
  private lastCooldown: number = 0;

  private spawnCount = 0;
  private fastSpawnCount = 3;
  private lastSpawnRow: number | null = null;

  public forceSpawn: boolean = false;

  constructor(board: Board) {
    this.board = board;
  }

  private instanceRandomEnemy(): BaseEnemy {
    const randomIndex = Math.floor(
      Math.random() * Object.values(EnemyTypes).length,
    );

    if (randomIndex === 0) {
      return new CascabelEnemy();
    } else if (randomIndex === 1) {
      return new DiabloEnemy();
    } else {
      return new TamborEnemy();
    }
  }

  private hardSpawnStrategy(
    scene: Scene,
    delta: number,
    x: number,
    y: number,
  ): void {
    const enemy = this.instanceRandomEnemy();
    this.spawnCooldown -= delta;
    if (this.spawnCooldown <= 0 || this.forceSpawn) {
      this.spawnCount += 1;

      if (this.spawnCount === 5) {
        this.spawnCooldown = this.COOLDOWN_TIME_MS / 3;
        if (!this.lastSpawnRow) {
          this.lastSpawnRow = y;
        }

        this.fastSpawnCount += 1;

        if (this.fastSpawnCount === 3) {
          this.spawnCount = 0;
          this.fastSpawnCount = 0;
          this.lastSpawnRow = null;
        }
      } else {
        this.spawnCooldown = this.COOLDOWN_TIME_MS;
      }

      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      console.log("[EnemySpawner] Enemy spawned", enemy.type);
    }
    this.logCooldown();
  }

  private realSpawnStrategy(
    scene: Scene,
    delta: number,
    x: number,
    y: number,
  ): void {
    const enemy = this.instanceRandomEnemy();
    this.spawnCooldown -= delta;
    if (this.spawnCooldown <= 0 || this.forceSpawn) {
      this.spawnCooldown = this.COOLDOWN_TIME_MS;
      this.forceSpawn = false;
      enemy.setSprite(x, y, scene);
      this.spawnedEnemies.push(enemy);
      console.log("[EnemySpawner] Enemy spawned", enemy.type);
    }

    this.logCooldown();
  }

  private logCooldown() {
    const roundedSeconds = Math.round(this.spawnCooldown / 1000);
    if (this.lastCooldown === 0 || roundedSeconds < this.lastCooldown) {
      this.lastCooldown = roundedSeconds;
      console.log("[EnemySpawner] Cooldown updated", this.lastCooldown);
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

  public spawnEnemyOnScreen(delta: number, scene: Scene, level: number): void {
    // pick a random lane
    const randomRow = Math.floor(Math.random() * this.board.getTotalRows());
    const { y } = this.board.cellToWorld(0, randomRow);
    const x = scene.scale.width;

    // spawn
    if (level === 1) {
      this.introSpawnStrategy(scene, x, y);
    } else if (level === 2) {
      this.realSpawnStrategy(scene, delta, x, y);
    } else if (level === 3) {
      this.hardSpawnStrategy(scene, delta, x, y);
    }
  }

  public getSpawnedEnemies(): BaseEnemy[] {
    return this.spawnedEnemies;
  }

  public moveEnemies(_scene: Phaser.Scene): void {
    this.spawnedEnemies.forEach((enemy: BaseEnemy) => {
      const nextX = enemy.calculateNextX();

      const willOverlap = this.spawnedEnemies.some((other: BaseEnemy) => {
        if (other === enemy) return false;
        const sameRow = enemy.sprite.y === other.sprite.y;
        const xDistance = Math.abs(nextX - other.sprite.x);
        return sameRow && xDistance <= enemy.sprite.width / 4;
      });

      if (!willOverlap) {
        enemy.move();
      }
    });
  }

  /** Checks overlap between player and spawned enemies; calls onCollisionWithPlayer when overlapping. */
  public checkPlayerCollisions(player: Player): void {
    if (player.isMoving) return;
    const playerCell = this.board.worldToCell(player.getX(), player.getY());
    if (!playerCell) return;
    const { col: playerCol, row: playerRow } = playerCell;
    //console.log("playerCol:", playerCol, "playerRow:", playerRow);
    for (const enemy of this.spawnedEnemies) {
      const enemyCell = this.board.worldToCell(enemy.sprite.x, enemy.sprite.y);
      if (!enemyCell) continue;
      const { col: enemyCol, row: enemyRow } = enemyCell;
      //console.log("enemyCol:", enemyCol, "enemyRow:", enemyRow);
      if (
        enemyRow === playerRow &&
        (enemyCol === playerCol || enemyCol === playerCol + 1)
      ) {
        enemy.onCollisionWithPlayer(player);
      }
    }
  }
}
