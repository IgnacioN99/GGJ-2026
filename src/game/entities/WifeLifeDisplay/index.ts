import {
  WifeEventTypes,
  WIFE_LIFE_IMAGE_KEYS,
  getWifeLifeImageIndex,
  type Wife
} from '../Wife';
import type { WifeLifeDisplayConfig } from './type';

const DEFAULT_CONFIG: Required<WifeLifeDisplayConfig> = {
  x: 80,
  y: 80,
  width: 100,
  height: 100,
  depth: 1
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
    this.setOrigin(0, 0).setDisplaySize(width, height).setDepth(depth);

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
