import { Scene } from "phaser";
import { runPlayerSetup } from "../entities/Player";

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
    this.load.image("fondo_main", "fondo_main.png");
    this.load.image("player_raw", "player/player-spritesheet.png");
    // Vida de la Wife: 1 = peor (cerca de 0), 4 = mejor (100%)
    this.load.image("wife_life_1", "wife/Dolores_doodle_1.png");
    this.load.image("wife_life_2", "wife/Dolores_doodle_2.png");
    this.load.image("wife_life_3", "wife/Dolores_doodle_3.png");
    this.load.image("wife_life_4", "wife/Dolores_doodle_4.png");
  }

  create() {
    runPlayerSetup(this);
    this.scene.start("MainMenu");
  }
}
