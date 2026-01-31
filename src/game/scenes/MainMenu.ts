import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const btnStyle = {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        };

        const game1Btn = this.add.text(512, 540, 'Game 1', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const game2Btn = this.add.text(512, 600, 'Game 2', btnStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });

        game1Btn.on('pointerdown', () => this.scene.start('Game1'));
        game2Btn.on('pointerdown', () => this.scene.start('Game2'));
    }
}
