import { Scene } from 'phaser';
import type { PlayerDirection } from './type';
import { MOVE_SPEED } from './type';

export class Player extends Phaser.GameObjects.Sprite {
    private targetX: number;
    private targetY: number;
    private isMoving: boolean = false;
    private moveSpeed: number = MOVE_SPEED;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'player', 0);
        this.targetX = x;
        this.targetY = y;
        this.setOrigin(0.5, 1); // anclar por los pies para que quede bien sobre el suelo
    }

    moveTo(worldX: number, worldY: number): void {
        this.targetX = worldX;
        this.targetY = worldY;
        this.isMoving = true;
    }

    getDirection(): PlayerDirection | null {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) return null;

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx > absDy) return dx > 0 ? 'right' : 'left';
        return dy > 0 ? 'down' : 'up';
    }

    private playWalkAnimation(direction: PlayerDirection): void {
        const key = `walk_${direction}`;
        if (!this.anims.isPlaying || this.anims.currentAnim?.key !== key) {
            this.anims.play(key, true);
        }
    }

    private stopAnimation(): void {
        if (this.anims.isPlaying) {
            this.anims.stop();
        }
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        if (!this.isMoving) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            this.isMoving = false;
            this.stopAnimation();
            return;
        }

        const speed = (this.moveSpeed * delta) / 1000;
        const moveX = (dx / dist) * speed;
        const moveY = (dy / dist) * speed;
        this.x += moveX;
        this.y += moveY;

        const direction = this.getDirection();
        if (direction) this.playWalkAnimation(direction);
    }
}

export type { PlayerDirection } from './type';
