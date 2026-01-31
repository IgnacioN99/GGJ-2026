import { Scene } from "phaser";
import entities from "../entities";
import {
  worldToCell,
  worldToNearestCell,
  cellToWorld,
  drawBoard,
  type BoardConfig,
  type Cell,
} from "../Board";
import { EnemySpawner } from "../enemySpawner";
<<<<<<< Updated upstream
import { getBoardPerspectivePositions } from "../Board";
=======
import { getBoardBounds, DEFAULT_BOARD_CONFIG } from "../Board";
>>>>>>> Stashed changes

/** Evento emitido cuando el jugador ataca en una celda del tablero */
export const EVENT_ATTACK_AT_CELL = "attackAtCell";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  level: number = 1;

  private enemySpawner: EnemySpawner;
  player: InstanceType<typeof entities.player>;
  private boardConfig: BoardConfig;
  private topY: number;

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x5a3a2a);

    const w = this.scale.width;
    const h = this.scale.height;
    this.background = this.add
      .image(w / 2, h / 2, "fondo_main")
      .setDisplaySize(w, h)
      .setDepth(-2);

    this.boardConfig = DEFAULT_BOARD_CONFIG;

    drawBoard(this, this.boardConfig);

    // Posición inicial del jugador: centro abajo del tablero
    const startCol = Math.floor(this.boardConfig.cols / 2);
    const startRow = this.boardConfig.rows - 1;
    const { x: startX, y: startY } = cellToWorld(
      startCol,
      startRow,
      this,
      this.boardConfig,
    );

    this.player = new entities.player(this, startX, startY);
    this.add.existing(this.player);

    // Expuesto para E2E (Playwright): leer posición del jugador y comprobar que está en celdas del tablero
    if (typeof window !== "undefined") {
      (window as unknown as { __gameScene?: Game }).__gameScene = this;
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const cell =
        worldToCell(pointer.worldX, pointer.worldY, this) ??
        worldToNearestCell(
          pointer.worldX,
          pointer.worldY,
          this,
          this.boardConfig,
        );

      const { x, y } = cellToWorld(cell.col, cell.row, this, this.boardConfig);
      this.player.moveTo(x, y);
    });
  }

  update(): void {
    this.input.once("pointerdown", (event: Phaser.Input.Pointer) => {
      const { corners, bounds } = getBoardPerspectivePositions(
        this,
        this.boardConfig,
      );

      console.log(
        "event.worldY:",
        event.worldY,
        "bounds.minY:",
        bounds.minY,
        "bounds.maxY:",
        bounds.maxY,
        "corners:",
        corners,
      );
    });

    this.topY = 484;
    this.enemySpawner = new EnemySpawner();
    this.enemySpawner.spawnEnemyOnScreen(this, this.level, this.topY);
  }

  update(): void {
    this.input.once("pointerdown", (event: Phaser.Input.Pointer) => {
      this.enemySpawner.forceSpawn = true;

      const bounds = getBoardBounds(this, this.boardConfig);

      console.log(
        "event.worldY:",
        event.worldY,
        "bounds.minY:",
        bounds.minY,
        "bounds.maxY:",
        bounds.maxY,
      );
    });

    /*this.enemySpawner.spawnEnemyOnScreen(this, this.level, this.topY);
    this.enemySpawner.moveEnemies(this);

    this.enemySpawner.forceSpawn = false;*/
  }

  /** Ejecuta el ataque en la celda indicada (puedes extender con daño, efectos, etc.) */
  attackAtCell(cell: Cell): void {
    this.events.emit(EVENT_ATTACK_AT_CELL, cell);
    // Aquí puedes añadir lógica de daño, animación, sonido, etc.
  }

  /** Centro de una celda en coordenadas mundo (para E2E: comprobar que el jugador queda en la celda) */
  getCellCenter(col: number, row: number): { x: number; y: number } {
    return cellToWorld(col, row, this, this.boardConfig);
  }
  constructor() {
    super("Game");
  }
}
