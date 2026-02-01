import { Scene } from "phaser";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private won = false;

  constructor() {
    super("GameOver");
  }

  init(data: { won?: boolean }): void {
    this.won = data?.won ?? false;
  }

  create() {
    this.sound.stopAll();
    if (this.won) {
      this.sound.add("sfx_dog", { loop: false }).play();
    } else {
      this.sound.add("sfx_door", { loop: false }).play();
    }
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(this.won ? 0x008000 : 0x333333);

    const w = this.scale.width;
    const h = this.scale.height;
    const key = this.won ? "you-win" : "game-over";
    const image = this.add.image(w / 2, h / 2, key);
    image.setDisplaySize(w, h);

    // Volver al menú con ESC
    this.input.keyboard?.on(
      "keydown-ESC",
      () => {
        this.scene.start("MainMenu");
      },
      this,
    );
  }
}
