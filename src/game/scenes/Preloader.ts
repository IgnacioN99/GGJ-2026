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
    this.load.image("fondo_01", "fondos/fondo_01.png");
    this.load.image("fondo_02", "fondos/fondo_02.png");
    this.load.image("fondo_03", "fondos/fondo_03.png");
    this.load.image("fondo_04", "fondos/fondo_04.png");
    this.load.image("enemies/diablo/sprite.png", "enemies/diablo/sprite.png");
    this.load.image("enemies/tambor/sprite.png", "enemies/tambor/sprite.png");
    this.load.image("player", "player/sprite.png");
    // Escoba: 2 imágenes separadas, cada una = 1 frame.
    // Añade sprite-escoba-frame1.png cuando lo tengas y cambia la segunda línea.
    this.load.image("player-escoba-0", "player/sprite-escoba.png");
    this.load.image("player-escoba-1", "player/sprite-escoba.png");
    // Manguera: 2 imágenes separadas (provisional: spritelata para ambos).
    // Añade spritelata-frame1.png (o el nombre que uses) y cambia la segunda línea.
    this.load.image("player-manguera-0", "player/spritelata.png");
    this.load.image("player-manguera-1", "player/spritelata.png");
    // Vida de la Wife: 1 = peor (cerca de 0), 4 = mejor (100%)
    this.load.image("wife_life_1", "wife/Dolores_doodle_1.png");
    this.load.image("wife_life_2", "wife/Dolores_doodle_2.png");
    this.load.image("wife_life_3", "wife/Dolores_doodle_3.png");
    this.load.image("wife_life_4", "wife/Dolores_doodle_4.png");
    this.load.image("items/escoba", "items/escoba-icon.png");
    this.load.image("items/manguera", "items/mangera-icon.png");
    this.load.audio("menu", "sounds/menu.ogg");
    this.load.audio("background", "sounds/background.ogg");
  }

  create() {
    this.scene.start("MainMenu");
  }
}
