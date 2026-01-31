import { Scene } from 'phaser';
import entities from '../entities';

/** Área en la que el player puede moverse: mitad izquierda de la pantalla */
export function getPlayerMovementBounds(scene: Scene, margin: number = 20): { minX: number; maxX: number; minY: number; maxY: number } {
    const w = scene.scale.width;
    const h = scene.scale.height;
    return {
        minX: margin,
        maxX: Math.floor(w / 2) - margin,
        minY: margin,
        maxY: h - margin
    };
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: InstanceType<typeof entities.player>;
    private movementBounds: { minX: number; maxX: number; minY: number; maxY: number };

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.movementBounds = getPlayerMovementBounds(this);
        const { minX, maxX, minY, maxY } = this.movementBounds;
        const startX = Math.round((minX + maxX) / 2);
        const startY = maxY - 50;

        this.player = new entities.player(this, startX, startY);
        this.add.existing(this.player);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const x = Phaser.Math.Clamp(pointer.worldX, minX, maxX);
            const y = Phaser.Math.Clamp(pointer.worldY, minY, maxY);
            this.player.moveTo(x, y);
        });
    }
}
