import { Scene, GameObjects } from "phaser";

/** Cuadro image keys (must match Preloader). */
const CUADRO_KEYS = [
  "cuadro_0",
  "cuadro_1",
  "cuadro_2",
  "cuadro_3",
  "cuadro_4",
] as const;

/** Time in ms before auto-advancing to the next slide. */
const SLIDE_DURATION_MS = 4000;

export class Intro extends Scene {
  private currentSlide: GameObjects.Image | null = null;
  private slideIndex = 0;
  private autoAdvanceTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("Intro");
  }

  create() {
    this.sound.stopAll();
    this.sound.add("intro", { loop: true }).play();

    this.input.keyboard?.on("keydown-SPACE", this.advanceSlide, this);
    this.showSlide(0);
  }

  private advanceSlide = () => {
    this.cancelAutoAdvance();

    this.slideIndex++;
    if (this.slideIndex >= CUADRO_KEYS.length) {
      this.goToGame1();
      return;
    }

    this.showSlide(this.slideIndex);
  };

  private showSlide(index: number) {
    this.cancelAutoAdvance();

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

    this.scheduleNextAutoAdvance();
  }

  private scheduleNextAutoAdvance() {
    this.cancelAutoAdvance();
    this.autoAdvanceTimer = this.time.delayedCall(
      SLIDE_DURATION_MS,
      this.advanceSlide,
      [],
      this,
    );
  }

  private cancelAutoAdvance() {
    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.destroy();
      this.autoAdvanceTimer = null;
    }
  }

  private goToGame1() {
    this.cancelAutoAdvance();
    this.input.keyboard?.off("keydown-SPACE", this.advanceSlide, this);
    this.sound.stopAll();
    this.scene.start("Game1");
  }

  shutdown() {
    this.cancelAutoAdvance();
    this.input.keyboard?.off("keydown-SPACE", this.advanceSlide, this);
  }
}
