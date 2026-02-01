import { Scene } from "phaser";
import entities, {
  Wife,
  DEFAULT_MAX_SOUND,
  WifeEventTypes,
  soundAdded,
  soundReduced,
  WifeLifeDisplay,
  VolumeDisplay,
  Escoba,
  Manguera,
  PlayerEventTypes,
  ItemEventTypes,
  ItemTypes,
  type BaseItem,
} from "../entities";
import { Board, type Cell } from "../Board";
import { GameLevel, getBoardConfigForLevel } from "../Board/type";
import { ENEMY_MAX_SOUND_CONTRIBUTION } from "../BaseEnemy";
import { EnemySpawner } from "../EnemySpawner";
import { GameTimer, GameTimerEventTypes } from "../GameTimer";

// ─── Constantes ─────────────────────────────────────────────────────────────

/** Evento emitido cuando el jugador ataca en una celda (payload: Cell). Al escucharlo se matan enemigos en esa celda y la de adelante. */
export const EVENT_ATTACK_AT_CELL = "attackAtCell";

/** X donde los enemigos dejan de avanzar (cerca de la base). Debe coincidir con BaseEnemy.move(). */
const BOARD_END_X = 270;

/** Claves de fondos (mismo fondo, distintos tonos). Se rotan por tiempo con crossfade. */
const FONDOS_KEYS = ["fondo_01", "fondo_02", "fondo_03", "fondo_04"] as const;
const FONDO_CROSSFADE_DURATION_MS = 2000;
const FONDO_DEPTH = -2;

/** Longitud del chorro de agua en número de celdas (cuánto avanza desde el jugador). */
const AGUA_JET_LENGTH_CELLS = 2;

/** Layout de la barra de items en la parte superior. */
const ITEM_UI = {
  startX: 0, // Se calcula en create
  startY: 20,
  size: 60,
  gap: 15,
  disabledTint: 0x666666, // Gris cuando el item no está disponible
};

/** Formatea segundos restantes como "MM:SS". */
function formatRemainingTime(remainingSeconds: number): string {
  const total = Math.max(0, Math.ceil(remainingSeconds));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ─── Tipos ──────────────────────────────────────────────────────────────────

/** Representa un slot de la barra de items: item + su representación gráfica en pantalla. Si item es null, es decorativo (sin acción). */
interface ItemSlot {
  item: BaseItem | null;
  graphics: Phaser.GameObjects.Rectangle;
  icon?: Phaser.GameObjects.Image;
  isDisabled: boolean;
}

// ─── Escena principal del juego ─────────────────────────────────────────────

export class Game1 extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  player: InstanceType<typeof entities.player>; // Sprite del jugador, movimiento y items
  private board: Board; // Grid de celdas
  private wife: Wife; // Barra de estrés/sonido
  private gameTimer: GameTimer; // Duración de la partida
  private fondoLayerA: Phaser.GameObjects.Image; // Capas para crossfade de fondos
  private fondoLayerB: Phaser.GameObjects.Image;
  private fondoIndex = 0;
  private fondoTransitioning = false;
  private escoba: Escoba; // Items equipables
  private manguera: Manguera;
  private itemSlots: ItemSlot[] = []; // UI de la barra de items
  private timerText: Phaser.GameObjects.Text | null = null; // Tiempo restante MM:SS
  private enemySpawner: EnemySpawner;
  private level: GameLevel = 3;
  private backgroundSound: Phaser.Sound.BaseSound;
  private escobaLoopSound: Phaser.Sound.BaseSound | null = null;
  private mangueraLoopSound: Phaser.Sound.BaseSound | null = null;
  private breathLoopSound: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super("Game1");
  }

  /** Inicializa la escena: tablero, jugador, wife, timer, items, input. */
  create() {
    this.fondoIndex = 0;
    this.fondoTransitioning = false;

    const boardConfig = getBoardConfigForLevel(1);

    // Cámara y color de fondo de la escena
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x5a3a2a);

    // Dos capas de imagen para crossfade según el tiempo de partida
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

    // Tablero de celdas donde se mueve el jugador y ataca
    this.board = new Board(this, boardConfig);
    this.board.drawBoard(0xc4d4a0, 0x8bac0f, 0);

    // Hover del cursor sobre celdas del tablero
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.player?.canMove) {
        this.board.updateHover(pointer.worldX, pointer.worldY);
      } else {
        this.board.clearHover();
      }
    });
    this.input.on("pointerout", () => {
      this.board.clearHover();
    });

    // Animaciones del jugador con items: se repiten hasta que termine el uso del item (se detienen en restoreDefaultSprite)
    this.anims.create({
      key: "player-escoba-use",
      frames: [{ key: "player-escoba-0" }, { key: "player-escoba-1" }],
      frameRate: 8,
      repeat: -1, // Bucle durante el uso; se detiene en onItemUseCompleted
    });
    this.anims.create({
      key: "player-manguera-use",
      frames: [{ key: "player-manguera-0" }, { key: "player-manguera-1" }],
      frameRate: 4, // Velocidad baja para que el uso de la manguera se vea más pausado
      repeat: -1, // Bucle durante el uso; se detiene en onItemUseCompleted
    });
    this.anims.create({
      key: "player-walk",
      frames: [{ key: "player-paso-0" }, { key: "player-paso-1" }],
      frameRate: 8,
      repeat: -1, // Caminar entre bloques; se detiene al llegar
    });
    // Animación del chorro de agua (ataque manguera en línea recta)
    this.anims.create({
      key: "agua-attack",
      frames: [
        { key: "agua-001" },
        { key: "agua-002" },
        { key: "agua-003" },
        { key: "agua-004" },
        { key: "agua-005" },
        { key: "agua-006" },
        { key: "agua-007" },
        { key: "agua-008" },
        { key: "agua-009" },
      ],
      frameRate: 18,
      repeat: -1, // Bucle durante todo el ataque; se detiene al destruir el sprite
    });

    // Jugador: sprite que se mueve por celdas y usa items
    const startCol = Math.floor(boardConfig.cols / 2);
    const startRow = boardConfig.rows - 1;
    const { x: startX, y: startY } = this.board.cellToWorld(startCol, startRow);
    this.player = new entities.player(this, startX, startY);
    this.add.existing(this.player);

    // Wife: barra de estrés/sonido; si se sobrecarga → Game Over
    this.wife = new Wife(DEFAULT_MAX_SOUND, this);
    const wifeX = 0;
    const wifeY = -30;
    const wifeSize = 200;
    const gap = 10;
    const wifeLifeDisplay = new WifeLifeDisplay(this, this.wife, {
      x: wifeX,
      y: wifeY,
      width: wifeSize,
      height: wifeSize,
    });
    this.add.existing(wifeLifeDisplay);
    const volumeDisplay = new VolumeDisplay(this, this.wife, {
      x: wifeX + wifeSize + gap,
      y: wifeY,
      width: wifeSize,
      height: wifeSize,
    });
    this.add.existing(volumeDisplay);

    this.wife.on(WifeEventTypes.Overwhelmed, () => {
      this.backgroundSound.stop();
      this.sound.play("sfx_door");
      this.scene.start("GameOver", { won: false });
    });

    // Sprite sorpresa cuando el volumen está casi al tope (wife a punto de despertar)
    const VOLUME_ALERT_RATIO = 0.75;
    const updatePlayerVolumeAlert = (): void => {
      const aboutToLose =
        this.wife.currentSound >= this.wife.maxSound * VOLUME_ALERT_RATIO;
      this.player.setAboutToLose(aboutToLose);
    };
    this.wife.on(WifeEventTypes.SoundAdded, updatePlayerVolumeAlert);
    this.wife.on(WifeEventTypes.SoundReduced, updatePlayerVolumeAlert);
    this.wife.on(WifeEventTypes.Reset, updatePlayerVolumeAlert);
    updatePlayerVolumeAlert();

    // Timer de partida: al terminar → eliminar todos los enemigos, esperar animaciones y luego victoria
    this.gameTimer = new GameTimer();
    this.gameTimer.on(GameTimerEventTypes.Finished, () => {
      const allEnemies = this.enemySpawner.getSpawnedEnemies();
      for (const enemy of allEnemies) {
        this.events.emit(
          WifeEventTypes.SoundReduced,
          soundReduced(enemy.soundContribution),
        );
      }
      this.enemySpawner.removeEnemies(this, allEnemies);
      // Esperar a que terminen las animaciones de muerte (500 ms cada una, se lanzan a la vez)
      const WIN_TRANSITION_DELAY_MS = 1000;
      this.time.delayedCall(WIN_TRANSITION_DELAY_MS, () => {
        this.backgroundSound.stop();
        this.scene.start("GameOver", { won: true });
      });
    });

    // Timer de tiempo restante centrado entre wife e items (MM:SS)
    const timerY = ITEM_UI.startY + ITEM_UI.size / 2;
    this.timerText = this.add
      .text(
        w / 2,
        timerY,
        formatRemainingTime(this.gameTimer.remainingSeconds),
        {
          fontSize: "44px",
          color: "#000000",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5, 0.5)
      .setDepth(101);

    // Items equipables (escoba, manguera) con cooldown
    this.escoba = new Escoba();
    this.manguera = new Manguera();
    this.escoba.on(ItemEventTypes.UseStarted, () => {
      this.escobaLoopSound?.play();
    });
    this.escoba.on(ItemEventTypes.UseCompleted, () => {
      this.escobaLoopSound?.stop();
    });
    this.manguera.on(ItemEventTypes.UseStarted, () => {
      this.mangueraLoopSound?.play();
      this.killEnemiesInMangueraLine();
      this.playAguaAttackAnimation();
    });
    this.manguera.on(ItemEventTypes.UseCompleted, () => {
      this.mangueraLoopSound?.stop();
    });
    this.createItemUI();

    // Suscripción a eventos del jugador para actualizar barra de items y hover
    this.events.on(PlayerEventTypes.ItemEquipped, () => this.updateItemUI());
    this.events.on(PlayerEventTypes.ItemUnequipped, () => {
      this.updateItemUI();
      this.board.clearHover();
    });
    this.events.on(PlayerEventTypes.GlobalCooldownStarted, () => {
      this.updateItemUI();
      this.board.clearHover();
      this.breathLoopSound?.play();
    });
    this.events.on(PlayerEventTypes.GlobalCooldownEnded, () => {
      this.updateItemUI();
      this.breathLoopSound?.stop();
    });
    this.events.on(PlayerEventTypes.Blocked, () => {
      this.board.clearHover();
    });
    // La escoba mata enemigos continuamente durante el uso (en update)

    // Enemy spawner: genera enemigos que avanzan por el tablero
    this.enemySpawner = new EnemySpawner(this.board);

    // Música de fondo (igual que Game2: parar otros sonidos y reproducir en loop)
    //this.sound.stopAll();
    this.backgroundSound = this.sound.add("background", {
      loop: true,
      volume: 0,
    });
    this.backgroundSound.play();
    this.tweens.add({
      targets: this.backgroundSound,
      volume: 1,
      duration: 6000,
      ease: "Linear",
    });

    // Sonidos en bucle de escoba, manguera y respiración (cooldown global)
    this.escobaLoopSound = this.sound.add("sfx_escoba", {
      loop: true,
      volume: 0.35,
    });
    this.mangueraLoopSound = this.sound.add("sfx_manguera", { loop: true });
    this.breathLoopSound = this.sound.add("sfx_breath", { loop: true });

    // Volver al menú con ESC
    this.input.keyboard?.on(
      "keydown-ESC",
      () => {
        this.backgroundSound.stop();
        this.scene.start("MainMenu");
      },
      this,
    );

    // Hook E2E (Playwright): expone la escena en window.__gameScene para tests
    if (typeof window !== "undefined") {
      (window as unknown as { __gameScene?: Game1 }).__gameScene = this;
    }

    // Click: equipar item si se clickea la barra, sino mover jugador y atacar en celda
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Verificar si el click fue en un item slot
      const clickedSlot = this.getClickedItemSlot(pointer.x, pointer.y);
      if (clickedSlot) {
        this.onItemSlotClicked(clickedSlot);
        return;
      }

      // Si el player no puede moverse, ignorar clicks en el tablero
      if (!this.player.canMove) {
        console.log("[Game1] Player no puede moverse, ignorando click");
        return;
      }

      const cell =
        this.board.worldToCell(pointer.worldX, pointer.worldY) ??
        this.board.worldToNearestCell(pointer.worldX, pointer.worldY);

      const { x, y } = this.board.cellToWorld(cell.col, cell.row);
      this.player.moveTo(x, y);
    });
  }

  /** Dibuja la barra de items (escoba, manguera, perro) arriba a la derecha con iconos clicables. El perro es decorativo (no dispara acción). */
  private createItemUI(): void {
    const w = this.scale.width;
    const totalItems = 3;
    const totalWidth =
      totalItems * ITEM_UI.size + (totalItems - 1) * ITEM_UI.gap;
    ITEM_UI.startX = w - totalWidth - 20;

    // Slot Escoba: rectángulo invisible + icono
    const escobaX = ITEM_UI.startX;
    const escobaCenterX = escobaX + ITEM_UI.size / 2;
    const escobaCenterY = ITEM_UI.startY + ITEM_UI.size / 2;
    const escobaGraphics = this.add
      .rectangle(
        escobaCenterX,
        escobaCenterY,
        ITEM_UI.size,
        ITEM_UI.size,
        0x000000,
        0, // Transparente
      )
      .setStrokeStyle(0, 0x000000) // Sin borde
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    const escobaIcon = this.add
      .image(escobaCenterX, escobaCenterY, "items/escoba")
      .setDisplaySize(ITEM_UI.size + 10, ITEM_UI.size + 10)
      .setOrigin(0.5)
      .setDepth(101);

    this.itemSlots.push({
      item: this.escoba,
      graphics: escobaGraphics,
      icon: escobaIcon,
      isDisabled: false,
    });

    // Slot Manguera: rectángulo invisible + icono
    const mangueraX = ITEM_UI.startX + ITEM_UI.size + ITEM_UI.gap;
    const mangueraCenterX = mangueraX + ITEM_UI.size / 2;
    const mangueraCenterY = ITEM_UI.startY + ITEM_UI.size / 2;
    const mangueraGraphics = this.add
      .rectangle(
        mangueraCenterX,
        mangueraCenterY,
        ITEM_UI.size,
        ITEM_UI.size,
        0x000000,
        0, // Transparente
      )
      .setStrokeStyle(0, 0x000000) // Sin borde
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    const mangueraIcon = this.add
      .image(mangueraCenterX, mangueraCenterY, "items/manguera")
      .setDisplaySize(ITEM_UI.size + 10, ITEM_UI.size + 10)
      .setOrigin(0.5)
      .setDepth(101);

    this.itemSlots.push({
      item: this.manguera,
      graphics: mangueraGraphics,
      icon: mangueraIcon,
      isDisabled: false,
    });

    // Slot Perro: solo icono decorativo (no equipable, cursor not-allowed al hover)
    const perroX = ITEM_UI.startX + 2 * (ITEM_UI.size + ITEM_UI.gap);
    const perroCenterX = perroX + ITEM_UI.size / 2;
    const perroCenterY = ITEM_UI.startY + ITEM_UI.size / 2;
    const perroGraphics = this.add
      .rectangle(
        perroCenterX,
        perroCenterY,
        ITEM_UI.size,
        ITEM_UI.size,
        0x000000,
        0,
      )
      .setStrokeStyle(0, 0x000000)
      .setInteractive({ useHandCursor: false })
      .setDepth(100);

    perroGraphics.on("pointerover", () => {
      this.input.setDefaultCursor("not-allowed");
    });
    perroGraphics.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    const perroIcon = this.add
      .image(perroCenterX, perroCenterY, "items/perro")
      .setDisplaySize(ITEM_UI.size + 10, ITEM_UI.size + 10)
      .setOrigin(0.5)
      .setDepth(101);

    this.itemSlots.push({
      item: null,
      graphics: perroGraphics,
      icon: perroIcon,
      isDisabled: true,
    });

    this.updateItemUI();
  }

  /** Devuelve el slot sobre el que se hizo click, o null si no es un slot. */
  private getClickedItemSlot(x: number, y: number): ItemSlot | null {
    for (const slot of this.itemSlots) {
      const bounds = slot.graphics.getBounds();
      if (bounds.contains(x, y)) {
        return slot;
      }
    }
    return null;
  }

  /** Equipa el item del slot si está disponible y el jugador puede equipar. */
  private onItemSlotClicked(slot: ItemSlot): void {
    if (!slot.item) return; // Slot decorativo (ej. perro), no hace nada
    if (slot.isDisabled) {
      console.log("[Game1] Item no disponible");
      return;
    }

    if (!this.player.canEquipItem) {
      console.log("[Game1] Player no puede equipar items");
      return;
    }

    const success = this.player.equipItem(slot.item);
    if (success) {
      console.log("[Game1] Item equipado:", slot.item.itemType);
      this.updateItemUI();
    }
  }

  /** Refleja equipado/cooldown/disabled en bordes y tint de los iconos. */
  private updateItemUI(): void {
    const canEquip = this.player.canEquipItem;
    const equippedItem = this.player.equippedItem;

    for (let i = 0; i < this.itemSlots.length; i++) {
      const slot = this.itemSlots[i];
      if (!slot.item) {
        // Slot decorativo (perro): icono más opaco, sin tint
        slot.graphics.setStrokeStyle(0, 0x000000);
        slot.graphics.setFillStyle(0x000000, 0);
        slot.graphics.setAlpha(1);
        if (slot.icon) {
          slot.icon.setAlpha(1);
          slot.icon.clearTint();
        }
        continue;
      }
      const isEquipped = equippedItem === slot.item;
      const isOnCooldown = slot.item.isOnCooldown;

      // Determinar si está disabled
      slot.isDisabled = !canEquip || isOnCooldown;

      if (isEquipped) {
        slot.graphics.setStrokeStyle(4, 0x00ff00); // Borde verde = equipado
        slot.graphics.setFillStyle(0x000000, 0);
        slot.graphics.setAlpha(1);
        if (slot.icon) {
          slot.icon.setAlpha(1);
          slot.icon.clearTint();
        }
      } else if (slot.isDisabled) {
        slot.graphics.setStrokeStyle(0, 0x000000);
        slot.graphics.setFillStyle(0x000000, 0);
        slot.graphics.setAlpha(0.5);
        if (slot.icon) {
          slot.icon.setAlpha(0.5);
          slot.icon.setTint(ITEM_UI.disabledTint);
        }
      } else {
        slot.graphics.setStrokeStyle(0, 0x000000);
        slot.graphics.setFillStyle(0x000000, 0);
        slot.graphics.setAlpha(1);
        if (slot.icon) {
          slot.icon.setAlpha(1);
          slot.icon.clearTint();
        }
      }
    }
  }

  /** Loop de Phaser: actualiza timer, fondos, cooldowns de items, spawner y UI. */
  update(_time: number, delta: number): void {
    this.gameTimer.update(delta);
    if (this.timerText && !this.gameTimer.isFinished) {
      this.timerText.setText(
        formatRemainingTime(this.gameTimer.remainingSeconds),
      );
    }
    this.updateFondoByTime();

    // Enemy spawner: spawn, colisiones y movimiento
    this.enemySpawner.spawnEnemyOnScreen(delta, this, this.level);
    this.enemySpawner.checkPlayerCollisions(this, this.player);
    this.enemySpawner.moveEnemies(this);
    this.updateEnemyWifeSound();

    // Si no hay enemigos, el jugador puede moverse sin item
    const hasNoEnemies =
      this.enemySpawner.getSpawnedEnemies().filter((e) => e.sprite?.active)
        .length === 0;
    this.player.setAllowMoveWithoutItem(hasNoEnemies);

    // Durante el uso de la escoba, matar continuamente todos los enemigos delante del jugador
    if (
      this.escoba.isUsing &&
      this.player.equippedItem?.itemType === ItemTypes.ESCOBA
    ) {
      this.killEnemiesInEscobaSweep();
    }

    // Durante el uso de la manguera, matar continuamente enemigos en la fila (los que entren en rango)
    if (this.manguera.isUsing) {
      this.killEnemiesInMangueraLine();
    }

    // Cooldown de items no equipados (el equipado lo actualiza el player)
    for (const slot of this.itemSlots) {
      if (!slot.item) continue;
      if (slot.item !== this.player.equippedItem) {
        slot.item.update(delta);
      }
    }

    this.updateItemUI();
  }

  /** A 25%, 50%, 75% del tiempo de partida hace crossfade al siguiente tono de fondo. */
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

  /**
   * Actualiza el sonido de la Wife según la distancia de cada enemigo al fondo del tablero.
   * Cada enemigo aporta 1 al spawn y hasta ENEMY_MAX_SOUND_CONTRIBUTION al acercarse;
   * el valor reemplaza al anterior (no se acumula 1+2+3...).
   */
  private updateEnemyWifeSound(): void {
    const enemies = this.enemySpawner.getSpawnedEnemies();
    const range = Math.max(1, this.scale.width - BOARD_END_X);

    for (const enemy of enemies) {
      if (!enemy.sprite?.active) continue;

      if (enemy.soundContribution === 0) {
        this.events.emit(WifeEventTypes.SoundAdded, soundAdded(1));
        enemy.soundContribution = 1;
        continue;
      }

      const progress = Math.max(
        0,
        Math.min(1, (enemy.spawnX - enemy.sprite.x) / range),
      );
      const contribution = Math.max(
        1,
        Math.min(
          ENEMY_MAX_SOUND_CONTRIBUTION,
          Math.round(1 + progress * (ENEMY_MAX_SOUND_CONTRIBUTION - 1)),
        ),
      );

      if (contribution === enemy.soundContribution) continue;

      const delta = contribution - enemy.soundContribution;
      enemy.soundContribution = contribution;
      if (delta > 0) {
        this.events.emit(WifeEventTypes.SoundAdded, soundAdded(delta));
      } else {
        this.events.emit(WifeEventTypes.SoundReduced, soundReduced(-delta));
      }
    }
  }

  /**
   * Mata enemigos al usar la manguera: en la celda donde se para el jugador y en línea recta
   * el resto de la fila (misma fila) hasta el borde derecho del tablero. Solo dentro del tablero.
   * Emite SoundReduced por cada uno.
   */
  killEnemiesInMangueraLine(): void {
    const playerCell =
      this.board.worldToCell(this.player.getX(), this.player.getY()) ??
      this.board.worldToNearestCell(this.player.getX(), this.player.getY());
    const { col: playerCol, row: playerRow } = playerCell;
    const totalCols = this.board.getTotalCols();
    const cells: Cell[] = [];
    for (let col = playerCol; col < totalCols; col++) {
      cells.push({ col, row: playerRow });
    }
    const toKill = this.enemySpawner.getEnemiesInCells(cells);
    for (const enemy of toKill) {
      this.events.emit(
        WifeEventTypes.SoundReduced,
        soundReduced(enemy.soundContribution),
      );
    }
    this.enemySpawner.removeEnemies(this, toKill);
  }

  /**
   * Reproduce la animación del chorro de agua en línea recta desde adelante del jugador
   * hasta el borde derecho del tablero (misma fila que el jugador).
   * Usa la celda delante del jugador para el origen, así funciona igual en cualquier posición del tablero (y con perspectiva).
   */
  private playAguaAttackAnimation(): void {
    const bounds = this.board.getBoardBounds();
    const playerX = this.player.getX();
    const playerY = this.player.getY();
    // Usar worldToNearestCell para ser estables cuando el jugador está en el borde de una celda (evita que la 1ª vez salga atrás)
    const playerCell =
      this.board.worldToCell(playerX, playerY) ??
      this.board.worldToNearestCell(playerX, playerY);
    const frontCol = Math.min(
      playerCell.col + 1,
      this.board.getTotalCols() - 1,
    );
    const { x: cellFrontX, y: startY } = this.board.cellToWorld(
      frontCol,
      playerCell.row,
    );
    // Nunca iniciar detrás del jugador: si la celda queda atrás (p. ej. 1ª vez al llegar), usar mínimo adelante
    const minOffsetAdelante = bounds.cellWidth * 0.5;
    const startX = Math.max(cellFrontX, playerX + minOffsetAdelante);
    const offsetArriba = bounds.cellHeight * 0.5;
    const startYFinal = startY - offsetArriba;
    const jetDistance = AGUA_JET_LENGTH_CELLS * bounds.cellWidth;
    const endX = Math.min(startX + jetDistance, bounds.maxX);

    const aguaSprite = this.add.sprite(startX, startYFinal, "agua-001");
    aguaSprite.setOrigin(0.17, 0.57);
    aguaSprite.setDepth(5);

    aguaSprite.play("agua-attack");

    this.tweens.add({
      targets: aguaSprite,
      x: startX,
      duration: this.manguera.useDurationMs,
      ease: "Linear",
      onComplete: () => {
        aguaSprite.destroy();
      },
    });
  }

  /**
   * Mata enemigos durante el barrido de la escoba: la celda donde está el jugador
   * y la celda de adelante (col+1). Se ejecuta cada frame mientras dura el uso,
   * para que enemigos que lleguen durante la animación también mueran.
   */
  killEnemiesInEscobaSweep(): void {
    const playerCell =
      this.board.worldToCell(this.player.getX(), this.player.getY()) ??
      this.board.worldToNearestCell(this.player.getX(), this.player.getY());
    const cells: Cell[] = [
      playerCell,
      { col: playerCell.col + 1, row: playerCell.row },
    ];
    const toKill = this.enemySpawner.getEnemiesInCells(cells);
    for (const enemy of toKill) {
      this.events.emit(
        WifeEventTypes.SoundReduced,
        soundReduced(enemy.soundContribution),
      );
    }
    this.enemySpawner.removeEnemies(this, toKill);
  }

  /**
   * Mata los enemigos en el área de ataque (celdas indicadas + enemigos a 1 bloque del borde del tablero)
   * solo si el jugador tiene la escoba equipada. Emite SoundReduced por cada uno y los quita del spawner.
   */
  killEnemiesInTargetArea(cells: Cell[]): void {
    if (
      !this.player.hasEquippedItem ||
      this.player.equippedItem?.itemType !== ItemTypes.ESCOBA
    ) {
      return;
    }
    const toKill = this.enemySpawner.getEnemiesInCells(cells);
    for (const enemy of toKill) {
      this.events.emit(
        WifeEventTypes.SoundReduced,
        soundReduced(enemy.soundContribution),
      );
    }
    this.enemySpawner.removeEnemies(this, toKill);
  }

  /** Emite evento de ataque en celda (solo debe llamarse con escoba equipada); el listener mata enemigos en la celda de adelante. */
  attackAtCell(cell: Cell): void {
    this.events.emit(EVENT_ATTACK_AT_CELL, cell);
  }

  /** Devuelve el timer de partida (para UI o tests E2E). */
  getGameTimer(): GameTimer {
    return this.gameTimer;
  }
}
