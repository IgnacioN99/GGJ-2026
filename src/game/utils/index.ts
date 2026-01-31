import type { Scene } from "phaser";
import type { CreateTextureWithoutDummyOptions } from "./type";

/**
 * Considera si un pixel es fondo dummy (blanco, gris, damero) para hacerlo transparente.
 */
function isDummyBackground(r: number, g: number, b: number): boolean {
  const t = 30;
  const gray =
    Math.abs(r - g) < t && Math.abs(g - b) < t && Math.abs(r - b) < t;
  const midGray = gray && r >= 100 && r <= 200;
  const white = r >= 250 && g >= 250 && b >= 250;
  return white || midGray || (gray && r >= 170);
}

/**
 * Crea una textura a partir de una raw, reemplazando el fondo dummy
 * (blanco/gris/damero) por transparencia. Sirve para cualquier entidad del juego.
 *
 * @param scene - Escena de Phaser (para acceder a textures).
 * @param options - rawKey, outputKey y opcionalmente frameCols/frameRows para spritesheets.
 */
export function createTextureWithoutDummyBackground(
  scene: Scene,
  options: CreateTextureWithoutDummyOptions,
): void {
  const { rawKey, outputKey, frameCols, frameRows } = options;

  const rawTexture = scene.textures.get(rawKey);
  const source = rawTexture.getSourceImage() as HTMLImageElement;
  if (!source || !source.complete) {
    console.warn(`Texture "${rawKey}" not ready`);
    return;
  }

  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;

  const canvasTexture = scene.textures.createCanvas(outputKey, w, h);
  if (!canvasTexture) return;

  const ctx = canvasTexture.context;
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isDummyBackground(r, g, b)) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (frameCols != null && frameRows != null) {
    const frameWidth = Math.floor(w / frameCols);
    const frameHeight = Math.floor(h / frameRows);
    const frameCount = frameCols * frameRows;
    for (let i = 0; i < frameCount; i++) {
      const col = i % frameCols;
      const row = Math.floor(i / frameCols);
      canvasTexture.add(
        i,
        0,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
      );
    }
  } else {
    canvasTexture.add(0, 0, 0, 0, w, h);
  }
  canvasTexture.refresh();
}

export type { CreateTextureWithoutDummyOptions } from "./type";
