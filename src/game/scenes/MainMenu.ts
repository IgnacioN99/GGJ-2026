import { Scene, GameObjects } from "phaser";

/** Cuando true, muestra botones game1/game2 como rectángulos rojos de debug. */
const DEBUG_GAME_BUTTONS = true;

const GAME_BTN_WIDTH = 250;
const GAME_BTN_HEIGHT = 70;

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.sound.stopAll();
    this.sound.add("menu", { loop: true }).play();

    const w = this.scale.width;
    const h = this.scale.height;
    this.background = this.add.image(w / 2, h / 2, "menu");
    this.background.setDisplaySize(w, h);

    if (DEBUG_GAME_BUTTONS) {
      const game1Btn = this.add
        .rectangle(270, 530, GAME_BTN_WIDTH, GAME_BTN_HEIGHT, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      const game2Btn = this.add
        .rectangle(270, 640, GAME_BTN_WIDTH, GAME_BTN_HEIGHT, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      game1Btn.on("pointerdown", () => {
        this.sound.stopAll();
        this.sound.add("sfx_confirm", { loop: false }).play();
        this.scene.start("Game1");
      });
      game2Btn.on("pointerdown", () => {
        this.sound.stopAll();
        this.sound.add("sfx_confirm", { loop: false }).play();
        this.scene.start("Creditos");
      });
    }
  }
}
