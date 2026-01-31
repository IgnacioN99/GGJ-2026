import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;
    private won = false;

    constructor ()
    {
        super('GameOver');
    }

    init(data: { won?: boolean }): void {
        this.won = data?.won ?? false;
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(this.won ? 0x008000 : 0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        const message = this.won ? 'You Win!' : 'Game Over';
        this.gameover_text = this.add.text(512, 384, message, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
