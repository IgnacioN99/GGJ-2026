import { Scene } from 'phaser';
import entities from '../entities';
import { Board, type Cell } from '../Board';
import { getBoardConfigForLevel } from '../Board/type';
import { Wife, DEFAULT_MAX_SOUND, WifeEventTypes, soundReduced } from '../entities/Wife';

/** Evento emitido cuando el jugador ataca en una celda del tablero */
export const EVENT_ATTACK_AT_CELL = 'attackAtCell';


export class Game1 extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: InstanceType<typeof entities.player>;
    private board: Board;
    private wife: Wife;

    constructor ()
    {
        super('Game1');
    }

    create ()
    {
        const boardConfig = getBoardConfigForLevel(1);

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x5a3a2a);

        const w = this.scale.width;
        const h = this.scale.height;
        this.background = this.add.image(w / 2, h / 2, 'fondo_main').setDisplaySize(w, h).setDepth(-2);

        this.board = new Board(this, boardConfig);

        this.board.drawBoard(0xc4d4a0, 0x8bac0f, 0);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.board.updateHover(pointer.worldX, pointer.worldY);
        });
        this.input.on('pointerout', () => {
            this.board.clearHover();
        });

        // Posición inicial del jugador: centro abajo del tablero
        const startCol = Math.floor(boardConfig.cols / 2);
        const startRow = boardConfig.rows - 1;
        const { x: startX, y: startY } = this.board.cellToWorld(startCol, startRow);

        this.player = new entities.player(this, startX, startY);
        this.add.existing(this.player);

        this.wife = new Wife(DEFAULT_MAX_SOUND, this);


        // Evento emitido cuando la Wife está abrumada
        this.wife.on(WifeEventTypes.Overwhelmed, () => {
            this.scene.start('GameOver');
        });



        // Expuesto para E2E (Playwright): leer posición del jugador y comprobar que está en celdas del tablero
        if (typeof window !== 'undefined') {
            (window as unknown as { __gameScene?: Game1 }).__gameScene = this;
        }

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const cell = this.board.worldToCell(pointer.worldX, pointer.worldY)
                ?? this.board.worldToNearestCell(pointer.worldX, pointer.worldY);

            const { x, y } = this.board.cellToWorld(cell.col, cell.row);
            this.player.moveTo(x, y);

            // Ataque en esa posición (celda del tablero)
            this.attackAtCell(cell);
        });
    }

    update(): void {
        this.input.once("pointerdown", (event: Phaser.Input.Pointer) => {

      const {corners, bounds} = this.board.getBoardPerspectivePositions();

      console.log(
        "event.worldY:",
        event.worldY,
        "bounds.minY:",
        bounds.minY,
        "bounds.maxY:",
        bounds.maxY,
        "corners:",
        corners
      );
    });
    }

    /** Ejecuta el ataque en la celda indicada (puedes extender con daño, efectos, etc.) */
    attackAtCell(cell: Cell): void {
        this.events.emit(EVENT_ATTACK_AT_CELL, cell);
        // reemplazar por la cantidad de sonido que se reduce por el ataque
        this.events.emit(WifeEventTypes.SoundReduced, soundReduced(10));
        // Aquí puedes añadir lógica de daño, animación, sonido, etc.
    }

    /** Centro de una celda en coordenadas mundo (para E2E: comprobar que el jugador queda en la celda) */
    getCellCenter(col: number, row: number): { x: number; y: number } {
        return this.board.cellToWorld(col, row);
    }
}
