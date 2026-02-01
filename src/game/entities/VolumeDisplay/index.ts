import { WifeEventTypes, type Wife } from "../Wife";
import type { VolumeDisplayConfig } from "./type";

/** Claves de textura para el indicador de volumen (0 = vacío, 7 = lleno). */
export const VOLUME_IMAGE_KEYS = [
  "volumen_0",
  "volumen_1",
  "volumen_2",
  "volumen_3",
  "volumen_4",
  "volumen_5",
  "volumen_6",
  "volumen_7",
] as const;

/**
 * Índice de imagen de volumen (0-7) a partir del estado de sonido de la Wife.
 * currentSound 0 → volumen 0 (vacío); currentSound = maxSound → volumen 7 (lleno).
 */
export function getVolumeImageIndex(
  currentSound: number,
  maxSound: number,
): number {
  if (maxSound <= 0) return 0;
  const ratio = currentSound / maxSound;
  return Math.min(7, Math.floor(ratio * 8));
}

const DEFAULT_CONFIG: Required<VolumeDisplayConfig> = {
  x: 0,
  y: -30,
  width: 200,
  height: 200,
  depth: 1000,
};

/**
 * Entidad que muestra el indicador de volumen (sonido de la Wife) en la escena.
 * Se suscribe a SoundAdded, SoundReduced y Reset para actualizar la textura.
 */
export class VolumeDisplay extends Phaser.GameObjects.Image {
  private readonly wife: Wife;
  private readonly updateTexture: () => void;
  private lastTexture: number | null = null;

  constructor(
    scene: Phaser.Scene,
    wife: Wife,
    config: VolumeDisplayConfig = {},
  ) {
    const { x, y, width, height, depth } = { ...DEFAULT_CONFIG, ...config };
    const volumeIndex = getVolumeImageIndex(wife.currentSound, wife.maxSound);
    super(scene, x, y, VOLUME_IMAGE_KEYS[volumeIndex]);

    this.wife = wife;
    this.setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(depth)
      .setPosition(x, y);

    this.updateTexture = (): void => {
      const idx = getVolumeImageIndex(
        this.wife.currentSound,
        this.wife.maxSound,
      );
      if (idx !== this.lastTexture) {
        this.setTexture(VOLUME_IMAGE_KEYS[idx]);
        if (this.lastTexture !== null && this.lastTexture < idx) {
          this.scene.sound.play("sfx_medidor", { loop: false });
        }
        this.lastTexture = idx;
      }
    };

    wife.on(WifeEventTypes.SoundAdded, this.updateTexture);
    wife.on(WifeEventTypes.SoundReduced, this.updateTexture);
    wife.on(WifeEventTypes.Reset, this.updateTexture);
  }

  destroy(fromScene?: boolean): void {
    this.wife.off(WifeEventTypes.SoundAdded, this.updateTexture);
    this.wife.off(WifeEventTypes.SoundReduced, this.updateTexture);
    this.wife.off(WifeEventTypes.Reset, this.updateTexture);
    super.destroy(fromScene);
  }
}

export type { VolumeDisplayConfig } from "./type";
