import type { Scene } from "phaser";
import { createTextureWithoutDummyBackground } from "../../utils";

function createPlayerAnimations(scene: Scene): void {
  const frameRate = 10;
  scene.anims.create({
    key: "walk_up",
    frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 5 }),
    frameRate,
    repeat: -1,
  });
  scene.anims.create({
    key: "walk_left",
    frames: scene.anims.generateFrameNumbers("player", { start: 6, end: 11 }),
    frameRate,
    repeat: -1,
  });
  scene.anims.create({
    key: "walk_right",
    frames: scene.anims.generateFrameNumbers("player", { start: 12, end: 17 }),
    frameRate,
    repeat: -1,
  });
  scene.anims.create({
    key: "walk_down",
    frames: scene.anims.generateFrameNumbers("player", { start: 18, end: 23 }),
    frameRate,
    repeat: -1,
  });
}

/** Ejecuta la configuración del jugador (textura transparente + animaciones). Debe llamarse después de cargar los assets. */
export function runPlayerSetup(scene: Scene): void {
  createTextureWithoutDummyBackground(scene, {
    rawKey: "player_raw",
    outputKey: "player",
    frameCols: 6,
    frameRows: 4,
  });
  createPlayerAnimations(scene);
}
