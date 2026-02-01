import { Scene, GameObjects } from "phaser";

export class Creditos extends Scene {
  background: GameObjects.Image;

  constructor() {
    super("Creditos");
  }

  create() {
    //this.sound.stopAll();
    const creditosSound = this.sound.add("creditos", {
      loop: true,
      volume: 0,
    });
    creditosSound.play();
    this.tweens.add({
      targets: creditosSound,
      volume: 1,
      duration: 1500,
      ease: "Linear",
    });

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
