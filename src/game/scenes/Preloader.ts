import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    this.load.image("logo", "logo.png");
    this.load.image(
      "enemies/cascabel/sprite.png",
      "enemies/cascabel/sprite.png",
    );
    this.load.image("fondo_main", "fondo_main.png");
    this.load.image("player_raw", "player/player-spritesheet.png");
  }

  create() {
    this.makePlayerTextureTransparent();
    this.createPlayerAnimations();

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }

  /**
   * Crea la textura 'player' a partir de 'player_raw', reemplazando el damero
   * (gris/blanco) por transparencia para que el sprite no muestre fondo.
   */
  private makePlayerTextureTransparent(): void {
    const rawTexture = this.textures.get("player_raw");
    const source = rawTexture.getSourceImage() as HTMLImageElement;
    if (!source || !source.complete) {
      console.warn("Player raw image not ready");
      return;
    }

    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    const frameWidth = Math.floor(w / 6);
    const frameHeight = Math.floor(h / 4);

    const canvasTexture = this.textures.createCanvas("player", w, h);
    if (!canvasTexture) return;
    const ctx = canvasTexture.context;
    ctx.drawImage(source, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Reemplazar píxeles del damero (gris claro, gris, blanco) por transparencia
    const isCheckerboard = (r: number, g: number, b: number): boolean => {
      const t = 30;
      const gray =
        Math.abs(r - g) < t && Math.abs(g - b) < t && Math.abs(r - b) < t;
      const midGray = gray && r >= 100 && r <= 200; // ~#c0c0c0
      const white = r >= 250 && g >= 250 && b >= 250;
      return white || midGray || (gray && r >= 170);
    };

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isCheckerboard(r, g, b)) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    for (let i = 0; i < 24; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      canvasTexture.add(
        i,
        0,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
      );
    }
    canvasTexture.refresh();
  }

  private createPlayerAnimations(): void {
    const frameRate = 10;
    this.anims.create({
      key: "walk_up",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 5 }),
      frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_left",
      frames: this.anims.generateFrameNumbers("player", { start: 6, end: 11 }),
      frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_right",
      frames: this.anims.generateFrameNumbers("player", { start: 12, end: 17 }),
      frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_down",
      frames: this.anims.generateFrameNumbers("player", { start: 18, end: 23 }),
      frameRate,
      repeat: -1,
    });
  }
}
