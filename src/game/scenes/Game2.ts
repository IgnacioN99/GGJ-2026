import { Scene } from "phaser";
import entities, {
  DEFAULT_MAX_SOUND,
  Wife,
  WifeEventTypes,
  WifeLifeDisplay,
} from "../entities";
import { Board, type Cell } from "../Board";
import { getBoardConfigForLevel, type GameLevel } from "../Board/type";
import { GameTimer, GameTimerEventTypes } from "../GameTimer";
import { EnemySpawner } from "../EnemySpawner";

/** Evento emitido cuando el jugador ataca en una celda del tablero */
export const EVENT_ATTACK_AT_CELL = "attackAtCell";

/** Claves de fondos por tono (mismo fondo, distintos tonos). Se cambian por tiempo con crossfade. */
const FONDOS_KEYS = ["fondo_01", "fondo_02", "fondo_03", "fondo_04"] as const;
const FONDO_CROSSFADE_DURATION_MS = 2000;
const FONDO_DEPTH = -2;

export class Game2 extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: InstanceType<typeof entities.player>;
  private board: Board;

  private enemySpawner: EnemySpawner;
  private level: GameLevel = 3;

  private wife: Wife;
  private gameTimer: GameTimer;
  /** Dos capas de fondo para crossfade por opacidad. */
  private fondoLayerA: Phaser.GameObjects.Image;
  private fondoLayerB: Phaser.GameObjects.Image;
  /** Índice del fondo actualmente visible (0..3). */
  private fondoIndex = 0;
  /** Si hay una transición de fondo en curso. */
  private fondoTransitioning = false;

  constructor() {
    super("Game2");
  }

  create() {
    console.log("Game2 created");
    // init camera
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x5a3a2a);

    // init background
    const w = this.scale.width;
    const h = this.scale.height;
    this.fondoLayerA = this.add
      .image(w / 2, h / 2, FONDOS_KEYS[0])
      .setDisplaySize(w, h)
      .setDepth(FONDO_DEPTH)
      .setAlpha(1);
    this.fondoLayerB = this.add
      .image(w / 2, h / 2, FONDOS_KEYS[1])
      .setDisplaySize(w, h)
      .setDepth(FONDO_DEPTH - 0.1)
      .setAlpha(0);

    // init board
    const boardConfig = getBoardConfigForLevel(this.level);
    this.board = new Board(this, boardConfig);
    this.board.drawBoard(0xc4d4a0, 0x8bac0f, 0);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.board.updateHover(pointer.worldX, pointer.worldY);
    });
    this.input.on("pointerout", () => {
      this.board.clearHover();
    });

    // init player
    const startCol = 0;
    const startRow = 2;
    const { x: startX, y: startY } = this.board.cellToWorld(startCol, startRow);
    this.player = new entities.player(this, startX, startY);
    this.add.existing(this.player);

    // init wife
    this.wife = new Wife(DEFAULT_MAX_SOUND, this);
    const wifeLifeDisplay = new WifeLifeDisplay(this, this.wife, {
      x: 80,
      y: 80,
      width: 200,
      height: 200,
    });
    this.add.existing(wifeLifeDisplay);

    // init game timer
    this.gameTimer = new GameTimer();
    this.gameTimer.on(GameTimerEventTypes.Finished, () => {
      this.scene.start("GameOver", { won: true });
    });

    // init enemy spawner
    this.enemySpawner = new EnemySpawner(this.board);

    // EVENTS

    // handle game over
    this.wife.on(WifeEventTypes.Overwhelmed, () => {
      // Evento emitido cuando la Wife está abrumada
      this.scene.start("GameOver", { won: false });
    });

    // handle player click
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const cell =
        this.board.worldToCell(pointer.worldX, pointer.worldY) ??
        this.board.worldToNearestCell(pointer.worldX, pointer.worldY);

      const { x, y } = this.board.cellToWorld(cell.col, cell.row);
      this.player.moveTo(x, y);

      this.attackAtCell(cell);
    });
  }

  update(_time: number, delta: number): void {
    // update game timer (use delta = ms since last frame, not time)
    this.gameTimer.update(delta);
    this.updateFondoByTime();

    // update enemy spawner
    this.enemySpawner.spawnEnemyOnScreen(delta, this, this.level);
    this.enemySpawner.checkPlayerCollisions(this.player);
    this.enemySpawner.moveEnemies(this);
  }

  /** Cambia de fondo por tiempo: a 25%, 50% y 75% de la partida, crossfade al siguiente tono. */
  private updateFondoByTime(): void {
    if (this.fondoTransitioning || this.fondoIndex >= FONDOS_KEYS.length - 1)
      return;
    const { elapsedSeconds, durationSeconds } = this.gameTimer.getCurrentTime();
    const progress = elapsedSeconds / durationSeconds;
    const nextThreshold = (this.fondoIndex + 1) / FONDOS_KEYS.length;
    if (progress < nextThreshold) return;

    this.fondoTransitioning = true;
    const nextIndex = this.fondoIndex + 1;
    const incoming = this.fondoLayerB;
    const outgoing = this.fondoLayerA;
    incoming.setTexture(FONDOS_KEYS[nextIndex]).setAlpha(0);

    this.tweens.add({
      targets: outgoing,
      alpha: 0,
      duration: FONDO_CROSSFADE_DURATION_MS,
      ease: "Linear",
    });
    this.tweens.add({
      targets: incoming,
      alpha: 1,
      duration: FONDO_CROSSFADE_DURATION_MS,
      ease: "Linear",
      onComplete: () => {
        this.fondoIndex = nextIndex;
        this.fondoTransitioning = false;
        outgoing.setAlpha(0);
        incoming.setAlpha(1);
        this.fondoLayerA = incoming;
        this.fondoLayerB = outgoing;
        this.fondoLayerA.setDepth(FONDO_DEPTH);
        this.fondoLayerB.setDepth(FONDO_DEPTH - 0.1);
      },
    });
  }

  /** Ejecuta el ataque en la celda indicada (puedes extender con daño, efectos, etc.) */
  attackAtCell(cell: Cell): void {
    this.events.emit(EVENT_ATTACK_AT_CELL, cell);
  }
}
