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

    this.load.audio("menu", "sounds/menu.ogg");
    this.load.audio("background", "sounds/background.ogg");
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
    this.load.image("player-escoba-0", "player/color_escoba_1.png");
    this.load.image("player-escoba-1", "player/color_escoba_2.png");
    // Manguera: 2 imágenes separadas (provisional: spritelata para ambos).
    // Añade spritelata-frame1.png (o el nombre que uses) y cambia la segunda línea.
    this.load.image("player-manguera-0", "player/color_manguera_1.png");
    this.load.image("player-manguera-1", "player/color_manguera_2.png");
    // Caminar entre bloques (paso 1 y paso 2)
    this.load.image("player-paso-0", "player/VIEJO/paso 1.png");
    this.load.image("player-paso-1", "player/VIEJO/paso 2.png");
    // Cansado durante cooldown global (tras usar manguera)
    this.load.image("player-cansado", "player/VIEJO/cansado.png");
    // Sorpresa cuando el volumen está casi al tope (wife a punto de despertar)
    this.load.image("player-sorpresa", "player/VIEJO/sorpresa.png");
    // Frames de animación del chorro de agua (ataque manguera)
    for (let i = 1; i <= 9; i++) {
      const num = String(i).padStart(3, "0");
      this.load.image(`agua-${num}`, `player/agua/${num}.png`);
    }

    // Vida de la Wife: 1 = peor (cerca de 0), 4 = mejor (100%)
    this.load.image("wife_life_1", "wife/remedios-1.png");
    this.load.image("wife_life_2", "wife/remedios-2.png");
    this.load.image("wife_life_3", "wife/remedios-3.png");
    this.load.image("wife_life_4", "wife/remedios-4.png");
    // Indicador de volumen (0 = vacío, 7 = lleno), al lado del indicador de vida
    for (let i = 0; i <= 7; i++) {
      this.load.image(`volumen_${i}`, `wife/volumen/volumen-${i}.png`);
    }
    this.load.image("items/escoba", "items/escoba-icon.png");
    this.load.image("items/manguera", "items/mangera-icon.png");

  }

  create() {
    this.scene.start("MainMenu");
  }
}
