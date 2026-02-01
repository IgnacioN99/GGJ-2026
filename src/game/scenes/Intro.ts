import { Scene, GameObjects } from "phaser";

/** Cuadro image keys (must match Preloader). */
const CUADRO_KEYS = [
  "intro/intro1.png",
  "intro/intro2.png",
  "intro/intro3.png",
] as const;

/** Time in ms before auto-advancing to the next slide. */
const SLIDE_DURATION_MS = 4000;

export class Intro extends Scene {
  private currentSlide: GameObjects.Image | null = null;
  private slideIndex = 0;
  private backgroundStarted = false;
  private introSound: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super("Intro");
  }

  create() {
    this.sound.stopAll();
    this.introSound = this.sound.add("intro", { loop: true });
    this.introSound.play();

    const padding = 16;
    const hint = this.add.text(
      this.scale.width - padding,
      this.scale.height - padding,
      "Presiona espacio para avanzar",
      {
        fontSize: "24px",
        color: "#000000",
        fontFamily: "Arial",
        fontStyle: "bold",
      },
    );
    hint.setOrigin(1, 1);
    hint.setDepth(100);

    this.input.keyboard?.on("keydown-SPACE", this.advanceSlide, this);
    this.showSlide(0);
  }

  private advanceSlide = () => {
    this.slideIndex++;
    if (this.slideIndex >= CUADRO_KEYS.length) {
      this.goToGame1();
      return;
    }

    this.showSlide(this.slideIndex);
  };

  private showSlide(index: number) {
    if (this.currentSlide) {
      this.currentSlide.destroy();
    }

    const key = CUADRO_KEYS[index];
    this.currentSlide = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      key,
    );
    this.currentSlide.setDisplaySize(this.scale.width, this.scale.height);

    if (index === 1 && !this.backgroundStarted) {
      this.backgroundStarted = true;
      if (this.introSound) {
        this.tweens.add({
          targets: this.introSound,
          volume: 0,
          duration: 3000,
          ease: "Linear",
          onComplete: () => {
            this.introSound?.stop();
          },
        });
      }
      const bgSound = this.sound.add("background", { loop: true });
      bgSound.volume = 0;
      bgSound.play();
      this.tweens.add({
        targets: bgSound,
        volume: 0.5,
        duration: 3000,
        ease: "Linear",
      });
    }
  }

  private goToGame1() {
    this.input.keyboard?.off("keydown-SPACE", this.advanceSlide, this);
    this.sound.stopAll();
    this.scene.start("Game1");
  }

  shutdown() {
    this.input.keyboard?.off("keydown-SPACE", this.advanceSlide, this);
  }
}
