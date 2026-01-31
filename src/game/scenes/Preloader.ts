import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.image(512, 384, "background");
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("logo", "logo.png");
    this.load.image(
      "enemies/cascabel/sprite.png",
      "enemies/cascabel/sprite.png",
    );
    this.load.image("enemies/diablo/sprite.png", "enemies/diablo/sprite.png");
    this.load.image("enemies/tambor/sprite.png", "enemies/tambor/sprite.png");
    this.load.image("fondo_main", "fondo_main.png");
    this.load.image("player", "player/sprite.png");
  }

  create() {
    this.scene.start("MainMenu");
  }
}
