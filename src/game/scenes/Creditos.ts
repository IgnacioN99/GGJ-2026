import { Scene, GameObjects } from "phaser";

export class Creditos extends Scene {
  background: GameObjects.Image;

  constructor() {
    super("Creditos");
  }

  create() {
    this.sound.stopAll();
    this.sound.add("creditos", { loop: true }).play();

    const w = this.scale.width;
    const h = this.scale.height;
    this.background = this.add.image(w / 2, h / 2, "creditos");
    this.background.setDisplaySize(w, h);

    this.input.keyboard?.on(
      "keydown-ESC",
      () => this.scene.start("MainMenu"),
      this,
    );
  }
}
