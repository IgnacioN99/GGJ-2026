import {
  WifeEventTypes,
  WIFE_LIFE_IMAGE_KEYS,
  getWifeLifeImageIndex,
  type Wife
} from '../Wife';
import type { WifeLifeDisplayConfig } from './type';

/** Margen para que la imagen no quede recortada por el borde de la pantalla. */

const DEFAULT_CONFIG: Required<WifeLifeDisplayConfig> = {
  x: 0,
  y: -30,
  width: 200,
  height: 200,
  depth: 1000
};

/**
 * Entidad que muestra la imagen de vida de la Wife en la escena.
 * Se suscribe a SoundAdded, SoundReduced y Reset para actualizar la textura.
 */
export class WifeLifeDisplay extends Phaser.GameObjects.Image {
  private readonly wife: Wife;
  private readonly updateTexture: () => void;

  constructor(
    scene: Phaser.Scene,
    wife: Wife,
    config: WifeLifeDisplayConfig = {}
  ) {
    const { x, y, width, height, depth } = { ...DEFAULT_CONFIG, ...config };
    const lifeIndex = getWifeLifeImageIndex(wife.currentSound, wife.maxSound);
    super(scene, x, y, WIFE_LIFE_IMAGE_KEYS[lifeIndex - 1]);

    this.wife = wife;
    this.setOrigin(0, 0).setDisplaySize(width, height).setDepth(depth).setPosition(x, y);

    this.updateTexture = (): void => {
      const idx = getWifeLifeImageIndex(this.wife.currentSound, this.wife.maxSound);
      this.setTexture(WIFE_LIFE_IMAGE_KEYS[idx - 1]);
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

export type { WifeLifeDisplayConfig } from './type';
